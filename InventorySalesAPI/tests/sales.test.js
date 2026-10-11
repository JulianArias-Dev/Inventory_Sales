const { SalesService } = require('../src/services/salesService');
const { createMockPool } = require('./helpers/mockDb');

describe('SalesService Unit Tests', () => {
  let mockPool;
  let mockSqsSender;
  let service;

  beforeEach(() => {
    mockPool = createMockPool();
    mockSqsSender = jest.fn().mockResolvedValue();
    service = new SalesService(mockPool, mockSqsSender);
  });

  describe('create (Bug 4 fix: SQS con nombres de productos y manejo no bloqueante)', () => {
    it('debe registrar la venta, descontar stock y enviar nombres de productos a SQS', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock FROM Productos', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50 },
        { id: 2, name: 'Tennis Nike', price: 220000, stock: 30 }
      ]);
      mockPool.onQuery('INSERT INTO Ventas', { insertId: 101 });
      mockPool.onQuery('INSERT INTO VentaProductos', { affectedRows: 1 });
      mockPool.onQuery('UPDATE Productos SET Stock', { affectedRows: 1 });

      const saleData = {
        customerName: 'Carlos Rodriguez',
        customerEmail: 'carlos@test.com',
        productos: [
          { productoId: 1, cantidad: 2 },
          { productoId: 2, cantidad: 1 }
        ]
      };

      const result = await service.create(saleData);

      expect(mockPool._conn.beginTransaction).toHaveBeenCalled();
      expect(mockPool._conn.commit).toHaveBeenCalled();

      expect(result.id).toBe(101);
      expect(result.customerName).toBe('Carlos Rodriguez');
      expect(result.customerEmail).toBe('carlos@test.com');
      // Total: 2 * 125000 + 1 * 220000 = 250000 + 220000 = 470000
      expect(result.totalAmount).toBe(470000);
      expect(result.productos).toHaveLength(2);
      expect(result.productos[0].productoNombre).toBe('Jeans Azules');
      expect(result.productos[1].productoNombre).toBe('Tennis Nike');

      // Bug 4 fix: Verify SQS sender was called with product names populated!
      expect(mockSqsSender).toHaveBeenCalledTimes(1);
      const [notifSale, notifProductNames] = mockSqsSender.mock.calls[0];
      expect(notifSale.id).toBe(101);
      expect(notifProductNames).toEqual(['Jeans Azules', 'Tennis Nike']);
    });

    it('debe agregar productos repetidos en una única fila de VentaProductos evitando error de clave primaria', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock FROM Productos', [
        { id: 1, name: 'Jeans Azules', price: 100000, stock: 50 }
      ]);
      mockPool.onQuery('INSERT INTO Ventas', { insertId: 105 });
      mockPool.onQuery('INSERT INTO VentaProductos', { affectedRows: 1 });
      mockPool.onQuery('UPDATE Productos SET Stock', { affectedRows: 1 });

      // Same product listed twice: qty 2 and qty 3
      const saleData = {
        customerName: 'Cliente Multiple',
        customerEmail: 'multiple@test.com',
        productos: [
          { productoId: 1, cantidad: 2 },
          { productoId: 1, cantidad: 3 }
        ]
      };

      const result = await service.create(saleData);

      expect(result.totalAmount).toBe(500000);
      // Aggregated into 1 unique product entry with quantity 5
      expect(result.productos).toHaveLength(1);
      expect(result.productos[0].cantidad).toBe(5);

      // Verify SQS received single product name
      expect(mockSqsSender).toHaveBeenCalledTimes(1);
      const [, notifNames] = mockSqsSender.mock.calls[0];
      expect(notifNames).toEqual(['Jeans Azules']);
    });

    it('debe completar la venta exitosamente aunque SQS falle (comportamiento no bloqueante)', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock FROM Productos', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50 }
      ]);
      mockPool.onQuery('INSERT INTO Ventas', { insertId: 102 });
      mockPool.onQuery('INSERT INTO VentaProductos', { affectedRows: 1 });
      mockPool.onQuery('UPDATE Productos SET Stock', { affectedRows: 1 });

      mockSqsSender.mockRejectedValue(new Error('AWS SQS Connection Timeout'));

      const saleData = {
        customerName: 'Ana Gomez',
        customerEmail: 'ana@test.com',
        productos: [{ productoId: 1, cantidad: 1 }]
      };

      const result = await service.create(saleData);
      expect(result.id).toBe(102);
      expect(mockPool._conn.commit).toHaveBeenCalled();
    });

    it('debe revertir la transacción y fallar si algún producto no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock FROM Productos', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50 }
      ]);

      const saleData = {
        customerName: 'Pedro',
        customerEmail: 'pedro@test.com',
        productos: [
          { productoId: 1, cantidad: 1 },
          { productoId: 999, cantidad: 1 }
        ]
      };

      await expect(service.create(saleData)).rejects.toMatchObject({
        status: 400,
        message: 'Uno o más productos no existen.'
      });

      expect(mockPool._conn.rollback).toHaveBeenCalled();
    });

    it('debe revertir la transacción y fallar si el stock es insuficiente', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock FROM Productos', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 3 }
      ]);

      const saleData = {
        customerName: 'Pedro',
        customerEmail: 'pedro@test.com',
        productos: [{ productoId: 1, cantidad: 10 }]
      };

      await expect(service.create(saleData)).rejects.toMatchObject({
        status: 400,
        message: 'Stock insuficiente para el producto Jeans Azules'
      });

      expect(mockPool._conn.rollback).toHaveBeenCalled();
    });

    it('debe fallar si los datos de cliente o lista de productos son inválidos', async () => {
      await expect(service.create({ customerName: '', customerEmail: 'a@b.com', productos: [{ productoId: 1, cantidad: 1 }] }))
        .rejects.toMatchObject({ status: 400, message: 'El nombre del cliente es requerido.' });

      await expect(service.create({ customerName: 'Pedro', customerEmail: '', productos: [{ productoId: 1, cantidad: 1 }] }))
        .rejects.toMatchObject({ status: 400, message: 'El email del cliente es requerido.' });

      await expect(service.create({ customerName: 'Pedro', customerEmail: 'a@b.com', productos: [] }))
        .rejects.toMatchObject({ status: 400, message: 'Debe incluir al menos un producto en la venta.' });

      await expect(service.create({ customerName: 'Pedro', customerEmail: 'a@b.com', productos: [{ productoId: 1, cantidad: -2 }] }))
        .rejects.toMatchObject({ status: 400, message: 'Cada producto debe tener un ID válido y cantidad mayor a cero.' });

      await expect(service.create({ customerName: 'Pedro', customerEmail: 'a@b.com', productos: [null] }))
        .rejects.toMatchObject({ status: 400, message: 'Cada producto debe tener un ID válido y cantidad mayor a cero.' });
    });
  });

  describe('getAll y getById', () => {
    it('debe retornar lista de ventas con sus productos asociados', async () => {
      mockPool.onQuery('SELECT Id as id, Date as date, TotalAmount as totalAmount', [
        { id: 1, date: new Date('2026-10-10'), totalAmount: 125000, customerName: 'Carlos', customerEmail: 'carlos@test.com' }
      ]);
      mockPool.onQuery('SELECT vp.VentaId as ventaId', [
        { ventaId: 1, productoId: 1, productoNombre: 'Jeans Azules', cantidad: 1, precioUnitario: 125000 }
      ]);

      const result = await service.getAll();
      expect(result).toHaveLength(1);
      expect(result[0].productos).toHaveLength(1);
      expect(result[0].productos[0].productoNombre).toBe('Jeans Azules');
    });

    it('debe retornar array vacío cuando no hay ventas', async () => {
      mockPool.onQuery('SELECT Id as id, Date as date, TotalAmount as totalAmount', []);

      const result = await service.getAll();
      expect(result).toEqual([]);
    });

    it('debe retornar una venta por ID con sus productos', async () => {
      mockPool.onQuery('SELECT Id as id, Date as date, TotalAmount as totalAmount', [
        { id: 1, date: new Date('2026-10-10'), totalAmount: 125000, customerName: 'Carlos', customerEmail: 'carlos@test.com' }
      ]);
      mockPool.onQuery('SELECT vp.ProductoId as productoId', [
        { productoId: 1, productoNombre: 'Jeans Azules', cantidad: 1, precioUnitario: 125000 }
      ]);

      const result = await service.getById(1);
      expect(result.id).toBe(1);
      expect(result.productos[0].productoNombre).toBe('Jeans Azules');
    });

    it('debe retornar null cuando la venta no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Date as date, TotalAmount as totalAmount', []);

      const result = await service.getById(999);
      expect(result).toBeNull();
    });

    it('debe retornar null si el ID no es numérico o menor a 1', async () => {
      expect(await service.getById('abc')).toBeNull();
      expect(await service.getById(-1)).toBeNull();
    });
  });
});
