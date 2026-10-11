const categoryController = require('../src/controllers/categoryController');
const productController = require('../src/controllers/productController');
const salesController = require('../src/controllers/salesController');
const reportController = require('../src/controllers/reportController');
const categoryService = require('../src/services/categoryService');
const productService = require('../src/services/productService');
const salesService = require('../src/services/salesService');
const reportService = require('../src/services/reportService');

describe('Controllers Unit Tests', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('categoryController', () => {
    it('getAll debe responder json con la lista de categorías', async () => {
      const mockList = [{ id: 1, nombre: 'Jeans' }];
      jest.spyOn(categoryService, 'getAll').mockResolvedValue(mockList);

      await categoryController.getAll(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockList);
    });

    it('getById debe responder 200 con la categoría si existe', async () => {
      req.params = { categoryId: '1' };
      const mockCat = { id: 1, nombre: 'Jeans' };
      jest.spyOn(categoryService, 'getById').mockResolvedValue(mockCat);

      await categoryController.getById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockCat);
    });

    it('getById debe responder 404 si la categoría no existe', async () => {
      req.params = { categoryId: '99' };
      jest.spyOn(categoryService, 'getById').mockResolvedValue(null);

      await categoryController.getById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Categoría no encontrada' });
    });

    it('create debe responder 201 con el ID generado (Bug 2 fix)', async () => {
      req.body = { nombre: 'Ropa' };
      const createdMock = { id: 7, nombre: 'Ropa' };
      jest.spyOn(categoryService, 'create').mockResolvedValue(createdMock);

      await categoryController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdMock);
    });

    it('create debe responder con error de validación cuando categoryService lanza error con status', async () => {
      req.body = { nombre: '' };
      const validationErr = new Error('El nombre de la categoría es requerido.');
      validationErr.status = 400;
      jest.spyOn(categoryService, 'create').mockRejectedValue(validationErr);

      await categoryController.create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'El nombre de la categoría es requerido.' });
    });

    it('update debe manejar el parámetro de ruta categoryId correctamente (Bug 1 fix)', async () => {
      req.params = { categoryId: '3' };
      req.body = { nombre: 'Moda' };
      const updatedMock = { id: 3, nombre: 'Moda' };
      jest.spyOn(categoryService, 'update').mockResolvedValue(updatedMock);

      await categoryController.update(req, res, next);

      expect(categoryService.update).toHaveBeenCalledWith('3', { nombre: 'Moda' });
      expect(res.json).toHaveBeenCalledWith(updatedMock);
    });

    it('update debe responder 404 si la categoría no existe', async () => {
      req.params = { categoryId: '99' };
      req.body = { nombre: 'Moda' };
      jest.spyOn(categoryService, 'update').mockResolvedValue(null);

      await categoryController.update(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Categoría no encontrada' });
    });

    it('delete debe retornar 400 si tiene productos asociados (Bug 3 fix)', async () => {
      req.params = { categoryId: '1' };
      jest.spyOn(categoryService, 'delete').mockResolvedValue({
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar la categoría porque tiene productos asociados'
      });

      await categoryController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('No se puede eliminar la categoría porque tiene productos asociados');
    });

    it('delete debe retornar 404 si la categoría no existe', async () => {
      req.params = { categoryId: '99' };
      jest.spyOn(categoryService, 'delete').mockResolvedValue({ found: false });

      await categoryController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Categoría no encontrada' });
    });

    it('delete debe retornar 200 si se elimina exitosamente', async () => {
      req.params = { categoryId: '1' };
      jest.spyOn(categoryService, 'delete').mockResolvedValue({ found: true, hasRelations: false, success: true });

      await categoryController.delete(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('tieneProductos debe responder con booleano', async () => {
      req.params = { categoryId: '1' };
      jest.spyOn(categoryService, 'hasProducts').mockResolvedValue(true);

      await categoryController.tieneProductos(req, res, next);
      expect(res.json).toHaveBeenCalledWith(true);
    });
  });

  describe('productController', () => {
    it('getAll debe responder json con la lista de productos', async () => {
      const mockList = [{ id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }];
      jest.spyOn(productService, 'getAll').mockResolvedValue(mockList);

      await productController.getAll(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockList);
    });

    it('getById debe responder 200 con el producto si existe', async () => {
      req.params = { productId: '1' };
      const mockProd = { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 };
      jest.spyOn(productService, 'getById').mockResolvedValue(mockProd);

      await productController.getById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockProd);
    });

    it('getById debe responder 404 si el producto no existe', async () => {
      req.params = { productId: '99' };
      jest.spyOn(productService, 'getById').mockResolvedValue(null);

      await productController.getById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('create debe responder 201 con el producto creado', async () => {
      req.body = { name: 'Chaqueta', price: 80000, stock: 10, categoriaId: 1 };
      const createdMock = { id: 12, name: 'Chaqueta', price: 80000, stock: 10, categoria: 1 };
      jest.spyOn(productService, 'create').mockResolvedValue(createdMock);

      await productController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdMock);
    });

    it('update debe responder 200 con el producto actualizado', async () => {
      req.params = { productId: '1' };
      req.body = { name: 'Chaqueta Actualizada', price: 85000, stock: 8, categoriaId: 1 };
      const updatedMock = { id: 1, name: 'Chaqueta Actualizada', price: 85000, stock: 8, categoria: 1 };
      jest.spyOn(productService, 'update').mockResolvedValue(updatedMock);

      await productController.update(req, res, next);
      expect(res.json).toHaveBeenCalledWith(updatedMock);
    });

    it('update debe responder 404 si el producto no existe', async () => {
      req.params = { productId: '99' };
      jest.spyOn(productService, 'update').mockResolvedValue(null);

      await productController.update(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });

    it('delete debe retornar 400 si el producto tiene ventas asociadas (Bug 3 fix)', async () => {
      req.params = { productId: '5' };
      jest.spyOn(productService, 'delete').mockResolvedValue({
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar el producto porque tiene ventas asociadas'
      });

      await productController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('No se puede eliminar el producto porque tiene ventas asociadas');
    });

    it('delete debe retornar 404 si el producto no existe', async () => {
      req.params = { productId: '999' };
      jest.spyOn(productService, 'delete').mockResolvedValue({ found: false });

      await productController.delete(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
    });
  });

  describe('salesController', () => {
    it('getAll debe responder json con la lista de ventas', async () => {
      const mockSales = [{ id: 1, customerName: 'Carlos', totalAmount: 125000 }];
      jest.spyOn(salesService, 'getAll').mockResolvedValue(mockSales);

      await salesController.getAll(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockSales);
    });

    it('getById debe responder 200 con la venta si existe', async () => {
      req.params = { saleId: '1' };
      const mockSale = { id: 1, customerName: 'Carlos', totalAmount: 125000, productos: [] };
      jest.spyOn(salesService, 'getById').mockResolvedValue(mockSale);

      await salesController.getById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockSale);
    });

    it('getById debe responder 404 si la venta no existe', async () => {
      req.params = { saleId: '99' };
      jest.spyOn(salesService, 'getById').mockResolvedValue(null);

      await salesController.getById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Venta no encontrada' });
    });

    it('create debe responder 201 con la venta registrada', async () => {
      req.body = {
        customerName: 'Juan',
        customerEmail: 'juan@test.com',
        productos: [{ productoId: 1, cantidad: 1 }]
      };
      const saleMock = { id: 1, customerName: 'Juan', totalAmount: 125000 };
      jest.spyOn(salesService, 'create').mockResolvedValue(saleMock);

      await salesController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(saleMock);
    });
  });

  describe('reportController', () => {
    it('getSummary debe responder con datos del dashboard', async () => {
      const summaryMock = {
        totalVentas: 15,
        totalIngresos: 3500000,
        productoMasVendido: { nombre: 'Jeans Azules', cantidad: 20 },
        categoriaMasVendida: { nombre: 'Jeans', cantidad: 30 }
      };
      jest.spyOn(reportService, 'getSummary').mockResolvedValue(summaryMock);

      await reportController.getSummary(req, res, next);

      expect(res.json).toHaveBeenCalledWith(summaryMock);
    });

    it('getSalesByDay debe responder con ventas agrupadas por día', async () => {
      const byDayMock = [{ fecha: '2026-10-10', cantidad: 5, total: 500000 }];
      jest.spyOn(reportService, 'getSalesByDay').mockResolvedValue(byDayMock);

      await reportController.getSalesByDay(req, res, next);
      expect(res.json).toHaveBeenCalledWith(byDayMock);
    });

    it('getTopProducts debe usar top=5 si no se especifica en params', async () => {
      const topMock = [{ productoId: 1, nombre: 'Jeans', cantidad: 10, total: 1000000 }];
      jest.spyOn(reportService, 'getTopProducts').mockResolvedValue(topMock);

      await reportController.getTopProducts(req, res, next);

      expect(reportService.getTopProducts).toHaveBeenCalledWith(5);
      expect(res.json).toHaveBeenCalledWith(topMock);
    });

    it('getSalesByCategory debe responder con ventas por categoría', async () => {
      const byCatMock = [{ categoriaId: 1, categoria: 'Jeans', cantidad: 10, total: 1000000 }];
      jest.spyOn(reportService, 'getSalesByCategory').mockResolvedValue(byCatMock);

      await reportController.getSalesByCategory(req, res, next);
      expect(res.json).toHaveBeenCalledWith(byCatMock);
    });
  });
});
