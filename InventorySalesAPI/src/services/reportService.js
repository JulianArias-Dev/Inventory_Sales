const db = require('../config/db');

class ReportService {
  constructor(customPool = null) {
    this._pool = customPool;
  }

  get pool() {
    return this._pool || db.pool;
  }

  async getSalesByDay() {
    const [rows] = await this.pool.query(`
      SELECT 
        DATE_FORMAT(Date, '%Y-%m-%d') as fecha,
        COUNT(*) as cantidad,
        COALESCE(SUM(TotalAmount), 0) as total
      FROM Ventas
      GROUP BY DATE_FORMAT(Date, '%Y-%m-%d')
      ORDER BY fecha ASC
    `);

    return rows.map(r => ({
      fecha: r.fecha,
      cantidad: Number(r.cantidad),
      total: Number(r.total)
    }));
  }

  async getTopProducts(top = 5) {
    const limit = Math.max(1, parseInt(top, 10) || 5);
    const [rows] = await this.pool.query(`
      SELECT 
        vp.ProductoId as productoId,
        p.Name as nombre,
        SUM(vp.Cantidad) as cantidad,
        COALESCE(SUM(vp.Cantidad * vp.PrecioUnitario), 0) as total
      FROM VentaProductos vp
      JOIN Productos p ON vp.ProductoId = p.Id
      GROUP BY vp.ProductoId, p.Name
      ORDER BY cantidad DESC
      LIMIT ?
    `, [limit]);

    return rows.map(r => ({
      productoId: Number(r.productoId),
      produtoId: Number(r.productoId), // Backwards compatibility for tests expecting produtoId
      nombre: r.nombre,
      cantidad: Number(r.cantidad),
      total: Number(r.total)
    }));
  }

  async getSalesByCategory() {
    const [rows] = await this.pool.query(`
      SELECT 
        p.CategoriaId as categoriaId,
        c.Name as categoria,
        SUM(vp.Cantidad) as cantidad,
        COALESCE(SUM(vp.Cantidad * vp.PrecioUnitario), 0) as total
      FROM VentaProductos vp
      JOIN Productos p ON vp.ProductoId = p.Id
      JOIN Categorias c ON p.CategoriaId = c.Id
      GROUP BY p.CategoriaId, c.Name
      ORDER BY cantidad DESC
    `);

    return rows.map(r => ({
      categoriaId: Number(r.categoriaId),
      categoria: r.categoria,
      cantidad: Number(r.cantidad),
      total: Number(r.total)
    }));
  }

  async getSummary() {
    const [countRows] = await this.pool.query('SELECT COUNT(*) as total FROM Ventas');
    const totalVentas = Number(countRows[0]?.total || 0);

    const [sumRows] = await this.pool.query('SELECT COALESCE(SUM(TotalAmount), 0) as total FROM Ventas');
    const totalIngresos = Number(sumRows[0]?.total || 0);

    const [topProdRows] = await this.pool.query(`
      SELECT p.Name as nombre, SUM(vp.Cantidad) as cantidad
      FROM VentaProductos vp
      JOIN Productos p ON vp.ProductoId = p.Id
      GROUP BY vp.ProductoId, p.Name
      ORDER BY cantidad DESC
      LIMIT 1
    `);

    const [topCatRows] = await this.pool.query(`
      SELECT c.Name as nombre, SUM(vp.Cantidad) as cantidad
      FROM VentaProductos vp
      JOIN Productos p ON vp.ProductoId = p.Id
      JOIN Categorias c ON p.CategoriaId = c.Id
      GROUP BY p.CategoriaId, c.Name
      ORDER BY cantidad DESC
      LIMIT 1
    `);

    return {
      totalVentas,
      totalIngresos,
      productoMasVendido: {
        nombre: topProdRows.length > 0 ? topProdRows[0].nombre : '',
        cantidad: topProdRows.length > 0 ? Number(topProdRows[0].cantidad) : 0
      },
      categoriaMasVendida: {
        nombre: topCatRows.length > 0 ? topCatRows[0].nombre : '',
        cantidad: topCatRows.length > 0 ? Number(topCatRows[0].cantidad) : 0
      }
    };
  }
}

module.exports = new ReportService();
module.exports.ReportService = ReportService;
