const { ReportService } = require('../src/services/reportService');
const { createMockPool } = require('./helpers/mockDb');

describe('ReportService Unit Tests', () => {
  let mockPool;
  let service;

  beforeEach(() => {
    mockPool = createMockPool();
    service = new ReportService(mockPool);
  });

  describe('getSummary', () => {
    it('debe retornar resumen de KPIs cuando hay ventas registradas', async () => {
      mockPool.onQuery('SELECT COUNT(*) as total FROM Ventas', [{ total: 10 }]);
      mockPool.onQuery('SELECT COALESCE(SUM(TotalAmount), 0) as total FROM Ventas', [{ total: 2500000 }]);
      mockPool.onQuery('SELECT p.Name as nombre, SUM(vp.Cantidad) as cantidad', [
        { nombre: 'Jeans Azules', cantidad: 25 }
      ]);
      mockPool.onQuery('SELECT c.Name as nombre, SUM(vp.Cantidad) as cantidad', [
        { nombre: 'Jeans', cantidad: 35 }
      ]);

      const result = await service.getSummary();
      expect(result).toEqual({
        totalVentas: 10,
        totalIngresos: 2500000,
        productoMasVendido: {
          nombre: 'Jeans Azules',
          cantidad: 25
        },
        categoriaMasVendida: {
          nombre: 'Jeans',
          cantidad: 35
        }
      });
    });

    it('debe retornar valores por defecto en cero cuando no hay ventas', async () => {
      mockPool.onQuery('SELECT COUNT(*) as total FROM Ventas', [{ total: 0 }]);
      mockPool.onQuery('SELECT COALESCE(SUM(TotalAmount), 0) as total FROM Ventas', [{ total: 0 }]);
      mockPool.onQuery('SELECT p.Name as nombre, SUM(vp.Cantidad) as cantidad', []);
      mockPool.onQuery('SELECT c.Name as nombre, SUM(vp.Cantidad) as cantidad', []);

      const result = await service.getSummary();
      expect(result).toEqual({
        totalVentas: 0,
        totalIngresos: 0,
        productoMasVendido: {
          nombre: '',
          cantidad: 0
        },
        categoriaMasVendida: {
          nombre: '',
          cantidad: 0
        }
      });
    });
  });

  describe('getSalesByDay', () => {
    it('debe retornar ventas agrupadas por día', async () => {
      mockPool.onQuery('DATE_FORMAT(Date, \'%Y-%m-%d\') as fecha', [
        { fecha: '2026-10-09', cantidad: 3, total: 350000 },
        { fecha: '2026-10-10', cantidad: 5, total: 750000 }
      ]);

      const result = await service.getSalesByDay();
      expect(result).toEqual([
        { fecha: '2026-10-09', cantidad: 3, total: 350000 },
        { fecha: '2026-10-10', cantidad: 5, total: 750000 }
      ]);
    });

    it('debe retornar array vacío cuando no hay ventas registradas por día', async () => {
      mockPool.onQuery('DATE_FORMAT(Date, \'%Y-%m-%d\') as fecha', []);

      const result = await service.getSalesByDay();
      expect(result).toEqual([]);
    });
  });

  describe('getTopProducts', () => {
    it('debe retornar top de productos más vendidos con límite especificado', async () => {
      mockPool.onQuery('LIMIT ?', [
        { productoId: 1, nombre: 'Jeans Azules', cantidad: 15, total: 1875000 },
        { productoId: 3, nombre: 'Tennis Nike', cantidad: 10, total: 2200000 }
      ]);

      const result = await service.getTopProducts(2);
      expect(result).toEqual([
        { productoId: 1, produtoId: 1, nombre: 'Jeans Azules', cantidad: 15, total: 1875000 },
        { productoId: 3, produtoId: 3, nombre: 'Tennis Nike', cantidad: 10, total: 2200000 }
      ]);
    });

    it('debe usar límite por defecto de 5 si el parámetro no es numérico', async () => {
      mockPool.onQuery('LIMIT ?', []);

      const result = await service.getTopProducts('invalid');
      expect(result).toEqual([]);
    });
  });

  describe('getSalesByCategory', () => {
    it('debe retornar ventas agrupadas por categoría', async () => {
      mockPool.onQuery('JOIN Categorias c ON p.CategoriaId = c.Id', [
        { categoriaId: 1, categoria: 'Jeans', cantidad: 20, total: 2430000 },
        { categoriaId: 2, categoria: 'Zapatos', cantidad: 12, total: 2680000 }
      ]);

      const result = await service.getSalesByCategory();
      expect(result).toEqual([
        { categoriaId: 1, categoria: 'Jeans', cantidad: 20, total: 2430000 },
        { categoriaId: 2, categoria: 'Zapatos', cantidad: 12, total: 2680000 }
      ]);
    });

    it('debe retornar array vacío si no hay ventas por categoría', async () => {
      mockPool.onQuery('JOIN Categorias c ON p.CategoriaId = c.Id', []);

      const result = await service.getSalesByCategory();
      expect(result).toEqual([]);
    });
  });
});
