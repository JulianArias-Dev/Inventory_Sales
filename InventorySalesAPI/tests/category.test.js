const { CategoryService } = require('../src/services/categoryService');
const { createMockPool } = require('./helpers/mockDb');

describe('CategoryService Unit Tests', () => {
  let mockPool;
  let service;

  beforeEach(() => {
    mockPool = createMockPool();
    service = new CategoryService(mockPool);
  });

  describe('getAll', () => {
    it('debe retornar lista de categorías mapeadas con id y nombre', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias', [
        { id: 1, nombre: 'Jeans' },
        { id: 2, nombre: 'Zapatos' }
      ]);

      const result = await service.getAll();
      expect(result).toEqual([
        { id: 1, nombre: 'Jeans' },
        { id: 2, nombre: 'Zapatos' }
      ]);
    });

    it('debe retornar lista vacía si no hay categorías', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias', []);

      const result = await service.getAll();
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('debe retornar la categoría cuando existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', [
        { id: 1, nombre: 'Jeans' }
      ]);

      const result = await service.getById(1);
      expect(result).toEqual({ id: 1, nombre: 'Jeans' });
    });

    it('debe retornar null cuando no existe la categoría', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', []);

      const result = await service.getById(999);
      expect(result).toBeNull();
    });

    it('debe retornar null cuando el ID no es numérico o menor a 1', async () => {
      expect(await service.getById('abc')).toBeNull();
      expect(await service.getById(-1)).toBeNull();
    });
  });

  describe('hasProducts', () => {
    it('debe retornar true si la categoría tiene productos', async () => {
      mockPool.onQuery('SELECT COUNT(*) as count FROM Productos WHERE CategoriaId = ?', [
        { count: 3 }
      ]);

      const result = await service.hasProducts(1);
      expect(result).toBe(true);
    });

    it('debe retornar false si la categoría no tiene productos', async () => {
      mockPool.onQuery('SELECT COUNT(*) as count FROM Productos WHERE CategoriaId = ?', [
        { count: 0 }
      ]);

      const result = await service.hasProducts(1);
      expect(result).toBe(false);
    });

    it('debe retornar false si el ID no es válido', async () => {
      expect(await service.hasProducts('invalid')).toBe(false);
    });
  });

  describe('create (Bug 2 fix: id generado en respuesta y validación de duplicados)', () => {
    it('debe crear la categoría e incluir el ID generado en la respuesta', async () => {
      mockPool.onQuery('SELECT Id FROM Categorias WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?))', []);
      mockPool.onQuery('INSERT INTO Categorias', { insertId: 5 });

      const result = await service.create({ nombre: 'Electrónica' });
      expect(result).toEqual({
        id: 5,
        nombre: 'Electrónica'
      });
    });

    it('debe lanzar error 400 si el nombre es vacío o solo espacios', async () => {
      await expect(service.create({ nombre: '   ' })).rejects.toMatchObject({
        status: 400,
        message: 'El nombre de la categoría es requerido.'
      });
    });

    it('debe lanzar error 400 si ya existe una categoría con ese nombre', async () => {
      mockPool.onQuery('SELECT Id FROM Categorias WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?))', [
        { Id: 1 }
      ]);

      await expect(service.create({ nombre: 'Jeans' })).rejects.toMatchObject({
        status: 400,
        message: 'Ya existe una categoría con ese nombre.'
      });
    });
  });

  describe('update (Bug 1 fix: actualización correcta por parámetro de ruta ID)', () => {
    it('debe actualizar la categoría correctamente por ID', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', [
        { id: 1, nombre: 'Jeans' }
      ]);
      mockPool.onQuery('SELECT Id FROM Categorias WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?)) AND Id != ?', []);
      mockPool.onQuery('UPDATE Categorias SET Name = ? WHERE Id = ?', { affectedRows: 1 });

      const result = await service.update(1, { nombre: 'Pantalones' });
      expect(result).toEqual({
        id: 1,
        nombre: 'Pantalones'
      });
    });

    it('debe retornar null si la categoría a actualizar no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', []);

      const result = await service.update(999, { nombre: 'Nuevo Nombre' });
      expect(result).toBeNull();
    });

    it('debe lanzar error 400 si el nuevo nombre ya está en uso por otra categoría', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', [
        { id: 1, nombre: 'Jeans' }
      ]);
      mockPool.onQuery('SELECT Id FROM Categorias WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?)) AND Id != ?', [
        { Id: 2 }
      ]);

      await expect(service.update(1, { nombre: 'Zapatos' })).rejects.toMatchObject({
        status: 400,
        message: 'Ya existe una categoría con ese nombre.'
      });
    });

    it('debe lanzar error 400 si el ID es inválido', async () => {
      await expect(service.update('no-num', { nombre: 'Pantalones' })).rejects.toMatchObject({
        status: 400,
        message: 'ID de categoría inválido.'
      });
    });
  });

  describe('delete (Bug 3 fix: impedir eliminación y retornar 400 con relaciones)', () => {
    it('debe prevenir eliminación y retornar hasRelations=true si tiene productos asociados', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', [
        { id: 1, nombre: 'Jeans' }
      ]);
      mockPool.onQuery('SELECT COUNT(*) as count FROM Productos WHERE CategoriaId = ?', [
        { count: 2 }
      ]);

      const result = await service.delete(1);
      expect(result).toEqual({
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar la categoría porque tiene productos asociados'
      });
    });

    it('debe retornar found=false si la categoría no existe', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', []);

      const result = await service.delete(999);
      expect(result).toEqual({ found: false });
    });

    it('debe retornar found=false si el ID no es numérico', async () => {
      const result = await service.delete('invalido');
      expect(result).toEqual({ found: false });
    });

    it('debe eliminar la categoría exitosamente si no tiene productos asociados', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', [
        { id: 1, nombre: 'Jeans' }
      ]);
      mockPool.onQuery('SELECT COUNT(*) as count FROM Productos WHERE CategoriaId = ?', [
        { count: 0 }
      ]);
      mockPool.onQuery('DELETE FROM Categorias WHERE Id = ?', { affectedRows: 1 });

      const result = await service.delete(1);
      expect(result).toEqual({
        found: true,
        hasRelations: false,
        success: true
      });
    });

    it('debe capturar error de clave foránea de MySQL y retornar hasRelations=true', async () => {
      mockPool.onQuery('SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?', [
        { id: 1, nombre: 'Jeans' }
      ]);
      mockPool.onQuery('SELECT COUNT(*) as count FROM Productos WHERE CategoriaId = ?', [
        { count: 0 }
      ]);
      const fkError = new Error('Cannot delete or update a parent row: a foreign key constraint fails');
      fkError.code = 'ER_ROW_IS_REFERENCED_2';
      mockPool.onQuery('DELETE FROM Categorias WHERE Id = ?', fkError);

      const result = await service.delete(1);
      expect(result).toEqual({
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar la categoría porque tiene productos asociados'
      });
    });
  });
});
