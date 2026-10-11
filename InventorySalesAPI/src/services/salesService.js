const db = require('../config/db');
const { sendSaleNotification } = require('./sqsService');

class SalesService {
  constructor(customPool = null, customSqsSender = null) {
    this._pool = customPool;
    this._sendNotification = customSqsSender || sendSaleNotification;
  }

  get pool() {
    return this._pool || db.pool;
  }

  async getAll() {
    const [salesRows] = await this.pool.query(
      'SELECT Id as id, Date as date, TotalAmount as totalAmount, CustomerName as customerName, CustomerEmail as customerEmail FROM Ventas ORDER BY Date DESC, Id DESC'
    );

    if (salesRows.length === 0) return [];

    const saleIds = salesRows.map(s => Number(s.id));
    const [itemRows] = await this.pool.query(
      `SELECT vp.VentaId as ventaId, vp.ProductoId as productoId, COALESCE(p.Name, 'Producto') as productoNombre, vp.Cantidad as cantidad, vp.PrecioUnitario as precioUnitario
       FROM VentaProductos vp
       LEFT JOIN Productos p ON vp.ProductoId = p.Id
       WHERE vp.VentaId IN (${saleIds.map(() => '?').join(',')})`,
      saleIds
    );

    const itemsBySale = {};
    for (const item of itemRows) {
      if (!itemsBySale[item.ventaId]) itemsBySale[item.ventaId] = [];
      itemsBySale[item.ventaId].push({
        productoId: Number(item.productoId),
        productoNombre: item.productoNombre,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario)
      });
    }

    return salesRows.map(s => ({
      id: Number(s.id),
      date: s.date,
      totalAmount: Number(s.totalAmount),
      customerName: s.customerName,
      customerEmail: s.customerEmail,
      productos: itemsBySale[Number(s.id)] || []
    }));
  }

  async getById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return null;

    const [salesRows] = await this.pool.query(
      'SELECT Id as id, Date as date, TotalAmount as totalAmount, CustomerName as customerName, CustomerEmail as customerEmail FROM Ventas WHERE Id = ?',
      [numericId]
    );

    if (salesRows.length === 0) return null;

    const [itemRows] = await this.pool.query(
      `SELECT vp.ProductoId as productoId, COALESCE(p.Name, 'Producto') as productoNombre, vp.Cantidad as cantidad, vp.PrecioUnitario as precioUnitario
       FROM VentaProductos vp
       LEFT JOIN Productos p ON vp.ProductoId = p.Id
       WHERE vp.VentaId = ?`,
      [numericId]
    );

    const s = salesRows[0];
    return {
      id: Number(s.id),
      date: s.date,
      totalAmount: Number(s.totalAmount),
      customerName: s.customerName,
      customerEmail: s.customerEmail,
      productos: itemRows.map(item => ({
        productoId: Number(item.productoId),
        productoNombre: item.productoNombre,
        cantidad: Number(item.cantidad),
        precioUnitario: Number(item.precioUnitario)
      }))
    };
  }

  async create(data) {
    const customerName = typeof data?.customerName === 'string'
      ? data.customerName.trim()
      : (data?.customerName != null ? String(data.customerName).trim() : '');

    if (!customerName) {
      const err = new Error('El nombre del cliente es requerido.');
      err.status = 400;
      throw err;
    }

    const customerEmail = typeof data?.customerEmail === 'string'
      ? data.customerEmail.trim()
      : (data?.customerEmail != null ? String(data.customerEmail).trim() : '');

    if (!customerEmail) {
      const err = new Error('El email del cliente es requerido.');
      err.status = 400;
      throw err;
    }

    const rawProductos = data?.productos;
    if (!Array.isArray(rawProductos) || rawProductos.length === 0) {
      const err = new Error('Debe incluir al menos un producto en la venta.');
      err.status = 400;
      throw err;
    }

    // Normalize and aggregate quantities per product ID
    const quantityMap = {};
    for (const p of rawProductos) {
      if (!p || typeof p !== 'object') {
        const err = new Error('Cada producto debe tener un ID válido y cantidad mayor a cero.');
        err.status = 400;
        throw err;
      }

      const prodId = parseInt(p.productoId !== undefined ? p.productoId : p.ProductoId, 10);
      const qty = parseInt(p.cantidad !== undefined ? p.cantidad : p.Cantidad, 10);

      if (isNaN(prodId) || isNaN(qty) || prodId <= 0 || qty <= 0) {
        const err = new Error('Cada producto debe tener un ID válido y cantidad mayor a cero.');
        err.status = 400;
        throw err;
      }

      quantityMap[prodId] = (quantityMap[prodId] || 0) + qty;
    }

    const uniqueIds = Object.keys(quantityMap).map(id => parseInt(id, 10));
    if (uniqueIds.length === 0) {
      const err = new Error('Debe incluir al menos un producto en la venta.');
      err.status = 400;
      throw err;
    }

    // Execute in transaction
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();

      const [productsDb] = await conn.query(
        `SELECT Id as id, Name as name, Price as price, Stock as stock FROM Productos WHERE Id IN (${uniqueIds.map(() => '?').join(',')}) FOR UPDATE`,
        uniqueIds
      );

      if (productsDb.length !== uniqueIds.length) {
        const err = new Error('Uno o más productos no existen.');
        err.status = 400;
        throw err;
      }

      const productMap = {};
      for (const prod of productsDb) {
        productMap[Number(prod.id)] = prod;
      }

      // Check stock
      for (const prodId of uniqueIds) {
        const prod = productMap[prodId];
        const requestedQty = quantityMap[prodId];
        if (prod.stock < requestedQty) {
          const err = new Error(`Stock insuficiente para el producto ${prod.name}`);
          err.status = 400;
          throw err;
        }
      }

      // Calculate total amount
      let totalAmount = 0;
      for (const prodId of uniqueIds) {
        const prod = productMap[prodId];
        const qty = quantityMap[prodId];
        totalAmount += qty * Number(prod.price);
      }

      const saleDate = new Date();

      // Insert sale
      const [saleResult] = await conn.query(
        'INSERT INTO Ventas (Date, CustomerName, CustomerEmail, TotalAmount) VALUES (?, ?, ?, ?)',
        [saleDate, customerName, customerEmail, totalAmount]
      );
      const saleId = Number(saleResult.insertId);

      // Insert aggregated sale items and update stock atomically
      const resultItems = [];
      const productNamesForSqs = [];

      for (const prodId of uniqueIds) {
        const prod = productMap[prodId];
        const qty = quantityMap[prodId];
        const unitPrice = Number(prod.price);

        await conn.query(
          'INSERT INTO VentaProductos (VentaId, ProductoId, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)',
          [saleId, prodId, qty, unitPrice]
        );

        await conn.query(
          'UPDATE Productos SET Stock = Stock - ? WHERE Id = ?',
          [qty, prodId]
        );

        resultItems.push({
          productoId: prodId,
          productoNombre: prod.name,
          cantidad: qty,
          precioUnitario: unitPrice
        });

        productNamesForSqs.push(prod.name);
      }

      await conn.commit();

      const createdSale = {
        id: saleId,
        date: saleDate,
        totalAmount,
        customerName,
        customerEmail,
        productos: resultItems
      };

      // Bug 4 fix: SQS notification populated with product names in Detalle, non-blocking
      try {
        await this._sendNotification(createdSale, productNamesForSqs);
      } catch (sqsErr) {
        console.warn(`[SalesService SQS Warning] ${sqsErr.message}`);
      }

      return createdSale;
    } catch (err) {
      try {
        await conn.rollback();
      } catch (rbErr) {
        console.warn(`[SalesService Rollback Warning] ${rbErr.message}`);
      }
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = new SalesService();
module.exports.SalesService = SalesService;
