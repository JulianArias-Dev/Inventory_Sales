const { ProductService } = require('../src/services/productService');
const { createMockPool } = require('./helpers/mockDb');

describe('ProductService Unit Tests', () => {
  let mockPool;
  let service;

  beforeEach(() => {
    mockPool = createMockPool();
    service = new ProductService(mockPool);
  });

  describe('getAll', () => {
    it('debe retornar lista de productos con números tipados correctamente', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos', [
        { id: 1, name: 'Jeans Azules', price: '125000.00', stock: 50, categoria: 1 },
        { id: 2, name: 'Tennis Nike', price: '220000.00', stock: 30, categoria: 2 }
      ]);

      const result = await service.getAll();
      expect(result).toEqual([
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 },
        { id: 2, name: 'Tennis Nike', price: 220000, stock: 30, categoria: 2 }
      ]);
    });

    it('debe retornar lista vacía si no existen productos', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos', []);

      const result = await service.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('debe retornar el producto cuando existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);

      const result = await service.getById(1);
      expect(result).toEqual({
        id: 1,
        name: 'Jeans Azules',
        price: 125000,
        stock: 50,
        categoria: 1
      });
    });

    it('debe retornar null cuando no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', []);

      const result = await service.getById(999);
      expect(result).toBeNull();
    });

    it('debe retornar null si el ID no es numérico o menor a 1', async () => {
      expect(await service.getById('abc')).toBeNull();
      expect(await service.getById(-5)).toBeNull();
    });
  });

  describe('hasSales', () => {
    it('debe retornar true si el producto tiene ventas asociadas', async () => {
      mockPool.onQuery('SELECT COUNT(*) as count FROM VentaProductos WHERE ProductoId = ?', [
        { count: 3 }
      ]);

      const result = await service.hasSales(1);
      expect(result).toBe(true);
    });

    it('debe retornar false si el producto no tiene ventas asociadas', async () => {
      mockPool.onQuery('SELECT COUNT(*) as count FROM VentaProductos WHERE ProductoId = ?', [
        { count: 0 }
      ]);

      const result = await service.hasSales(2);
      expect(result).toBe(false);
    });

    it('debe retornar false si el ID no es válido', async () => {
      expect(await service.hasSales('xyz')).toBe(false);
    });
  });

  describe('create', () => {
    it('debe crear un producto correctamente y retornar el ID generado', async () => {
      // Mock category exists
      mockPool.onQuery('SELECT Id FROM Categorias WHERE Id = ?', [{ Id: 1 }]);
      // Mock duplicate name check
      mockPool.onQuery('SELECT Id FROM Productos WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?))', []);
      // Mock insert
      mockPool.onQuery('INSERT INTO Productos', { insertId: 10 });

      const result = await service.create({
        name: 'Camisa Blanca',
        price: 45000,
        stock: 20,
        categoriaId: 1
      });

      expect(result).toEqual({
        id: 10,
        name: 'Camisa Blanca',
        price: 45000,
        stock: 20,
        categoria: 1
      });
    });

    it('debe lanzar error 400 si la categoría no existe', async () => {
      mockPool.onQuery('SELECT Id FROM Categorias WHERE Id = ?', []);

      await expect(service.create({
        name: 'Camisa Blanca',
        price: 45000,
        stock: 20,
        categoriaId: 999
      })).rejects.toMatchObject({
        status: 400,
        message: 'La categoría especificada no existe.'
      });
    });

    it('debe lanzar error 409 si el nombre del producto ya existe', async () => {
      mockPool.onQuery('SELECT Id FROM Categorias WHERE Id = ?', [{ Id: 1 }]);
      mockPool.onQuery('SELECT Id FROM Productos WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?))', [{ Id: 1 }]);

      await expect(service.create({
        name: 'Jeans Azules',
        price: 125000,
        stock: 50,
        categoriaId: 1
      })).rejects.toMatchObject({
        status: 409,
        message: 'Ya existe un producto con ese nombre.'
      });
    });

    it('debe lanzar error 400 si el precio es negativo', async () => {
      await expect(service.create({
        name: 'Producto Malo',
        price: -10,
        stock: 5,
        categoriaId: 1
      })).rejects.toMatchObject({
        status: 400,
        message: 'El precio del producto debe ser un número positivo.'
      });
    });

    it('debe lanzar error 400 si el stock es negativo', async () => {
      await expect(service.create({
        name: 'Producto Malo',
        price: 1000,
        stock: -5,
        categoriaId: 1
      })).rejects.toMatchObject({
        status: 400,
        message: 'El stock del producto debe ser un entero no negativo.'
      });
    });

    it('debe lanzar error 400 si el nombre es vacío o solo espacios', async () => {
      await expect(service.create({
        name: '   ',
        price: 1000,
        stock: 5,
        categoriaId: 1
      })).rejects.toMatchObject({
        status: 400,
        message: 'El nombre del producto es requerido.'
      });
    });
  });

  describe('update', () => {
    it('debe actualizar el producto correctamente por ID', async () => {
      // Mock getById
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);
      // Mock category exists
      mockPool.onQuery('SELECT Id FROM Categorias WHERE Id = ?', [{ Id: 1 }]);
      // Mock duplicate name check
      mockPool.onQuery('SELECT Id FROM Productos WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?)) AND Id != ?', []);
      // Mock update
      mockPool.onQuery('UPDATE Productos SET Name = ?, Price = ?, Stock = ?, CategoriaId = ? WHERE Id = ?', { affectedRows: 1 });

      const result = await service.update(1, {
        name: 'Jeans Azules Oscuros',
        price: 130000,
        stock: 45,
        categoriaId: 1
      });

      expect(result).toEqual({
        id: 1,
        name: 'Jeans Azules Oscuros',
        price: 130000,
        stock: 45,
        categoria: 1
      });
    });

    it('debe retornar null si el producto a actualizar no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', []);

      const result = await service.update(999, {
        name: 'Inexistente',
        price: 100,
        stock: 1,
        categoriaId: 1
      });
      expect(result).toBeNull();
    });

    it('debe lanzar error 400 si el nuevo nombre ya está en uso por otro producto', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);
      mockPool.onQuery('SELECT Id FROM Categorias WHERE Id = ?', [{ Id: 1 }]);
      mockPool.onQuery('SELECT Id FROM Productos WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?)) AND Id != ?', [{ Id: 2 }]);

      await expect(service.update(1, {
        name: 'Tennis Nike',
        price: 125000,
        stock: 50,
        categoriaId: 1
      })).rejects.toMatchObject({
        status: 400,
        message: 'Ya existe un producto con ese nombre.'
      });
    });

    it('debe lanzar error 400 si la categoría destino no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);
      mockPool.onQuery('SELECT Id FROM Categorias WHERE Id = ?', []);

      await expect(service.update(1, {
        name: 'Jeans Azules',
        price: 125000,
        stock: 50,
        categoriaId: 999
      })).rejects.toMatchObject({
        status: 400,
        message: 'La categoría especificada no existe.'
      });
    });

    it('debe permitir actualizar solo el stock manteniendo los otros datos', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);
      mockPool.onQuery('SELECT Id FROM Categorias WHERE Id = ?', [{ Id: 1 }]);
      mockPool.onQuery('SELECT Id FROM Productos WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?)) AND Id != ?', []);
      mockPool.onQuery('UPDATE Productos SET Name = ?, Price = ?, Stock = ?, CategoriaId = ? WHERE Id = ?', { affectedRows: 1 });

      const result = await service.update(1, { stock: 65 });
      expect(result).toEqual({
        id: 1,
        name: 'Jeans Azules',
        price: 125000,
        stock: 65,
        categoria: 1
      });
    });
  });

  describe('delete (Bug 3 fix: impedir eliminación y retornar 400 cuando tiene ventas asociadas)', () => {
    it('debe retornar hasRelations=true y mensaje de bloqueo si tiene ventas asociadas', async () => {
      // Mock getById
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);
      // Mock hasSales -> 3 sales found
      mockPool.onQuery('SELECT COUNT(*) as count FROM VentaProductos WHERE ProductoId = ?', [
        { count: 3 }
      ]);

      const result = await service.delete(1);
      expect(result).toEqual({
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar el producto porque tiene ventas asociadas'
      });
    });

    it('debe retornar found=false si el producto no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', []);

      const result = await service.delete(999);
      expect(result).toEqual({ found: false });
    });

    it('debe eliminar el producto exitosamente si no tiene ventas asociadas', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);
      mockPool.onQuery('SELECT COUNT(*) as count FROM VentaProductos WHERE ProductoId = ?', [
        { count: 0 }
      ]);
      mockPool.onQuery('DELETE FROM Productos WHERE Id = ?', { affectedRows: 1 });

      const result = await service.delete(1);
      expect(result).toEqual({
        found: true,
        hasRelations: false,
        success: true
      });
    });

    it('debe capturar error de clave foránea de MySQL y retornar hasRelations=true', async () => {
      mockPool.onQuery('SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?', [
        { id: 1, name: 'Jeans Azules', price: 125000, stock: 50, categoria: 1 }
      ]);
      mockPool.onQuery('SELECT COUNT(*) as count FROM VentaProductos WHERE ProductoId = ?', [
        { count: 0 }
      ]);
      // Simulate race condition where DB constraint fails
      const fkError = new Error('Cannot delete or update a parent row: a foreign key constraint fails');
      fkError.code = 'ER_ROW_IS_REFERENCED_2';
      mockPool.onQuery('DELETE FROM Productos WHERE Id = ?', fkError);

      const result = await service.delete(1);
      expect(result).toEqual({
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar el producto porque tiene ventas asociadas'
      });
    });
  });
});
