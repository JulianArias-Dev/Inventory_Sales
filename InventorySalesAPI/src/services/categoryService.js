const db = require('../config/db');

class CategoryService {
  constructor(customPool = null) {
    this._pool = customPool;
  }

  get pool() {
    return this._pool || db.pool;
  }

  async getAll() {
    const [rows] = await this.pool.query(
      'SELECT Id as id, Name as nombre FROM Categorias ORDER BY Id ASC'
    );
    return rows.map(r => ({
      id: Number(r.id),
      nombre: r.nombre
    }));
  }

  async getById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return null;

    const [rows] = await this.pool.query(
      'SELECT Id as id, Name as nombre FROM Categorias WHERE Id = ?',
      [numericId]
    );

    if (rows.length === 0) return null;

    return {
      id: Number(rows[0].id),
      nombre: rows[0].nombre
    };
  }

  async hasProducts(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return false;

    const [rows] = await this.pool.query(
      'SELECT COUNT(*) as count FROM Productos WHERE CategoriaId = ?',
      [numericId]
    );

    return Number(rows[0]?.count || 0) > 0;
  }

  async create(data) {
    const nombre = typeof data?.nombre === 'string'
      ? data.nombre.trim()
      : (data?.nombre != null ? String(data.nombre).trim() : '');

    if (!nombre) {
      const err = new Error('El nombre de la categoría es requerido.');
      err.status = 400;
      throw err;
    }

    // Check duplicate name
    const [existing] = await this.pool.query(
      'SELECT Id FROM Categorias WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?))',
      [nombre]
    );

    if (existing.length > 0) {
      const err = new Error('Ya existe una categoría con ese nombre.');
      err.status = 400;
      throw err;
    }

    const [result] = await this.pool.query(
      'INSERT INTO Categorias (Name) VALUES (?)',
      [nombre]
    );

    // Bug 2 fix: Must include the newly generated ID in the response
    return {
      id: Number(result.insertId),
      nombre
    };
  }

  async update(id, data) {
    // Bug 1 fix: Parse and use route parameter ID properly
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      const err = new Error('ID de categoría inválido.');
      err.status = 400;
      throw err;
    }

    const nombre = typeof data?.nombre === 'string'
      ? data.nombre.trim()
      : (data?.nombre != null ? String(data.nombre).trim() : '');

    if (!nombre) {
      const err = new Error('El nombre de la categoría es requerido.');
      err.status = 400;
      throw err;
    }

    // Verify category exists
    const category = await this.getById(numericId);
    if (!category) {
      return null;
    }

    // Check duplicate name on another category
    const [existing] = await this.pool.query(
      'SELECT Id FROM Categorias WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?)) AND Id != ?',
      [nombre, numericId]
    );

    if (existing.length > 0) {
      const err = new Error('Ya existe una categoría con ese nombre.');
      err.status = 400;
      throw err;
    }

    await this.pool.query(
      'UPDATE Categorias SET Name = ? WHERE Id = ?',
      [nombre, numericId]
    );

    return {
      id: numericId,
      nombre
    };
  }

  async delete(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      return { found: false };
    }

    const category = await this.getById(numericId);
    if (!category) {
      return { found: false };
    }

    // Bug 3 fix: If category has associated products, prevent deletion and flag relation
    const hasRelation = await this.hasProducts(numericId);
    if (hasRelation) {
      return {
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar la categoría porque tiene productos asociados'
      };
    }

    try {
      await this.pool.query('DELETE FROM Categorias WHERE Id = ?', [numericId]);
    } catch (err) {
      // Catch MySQL foreign key constraint error (ER_ROW_IS_REFERENCED_2 / errno 1451)
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
        return {
          found: true,
          hasRelations: true,
          message: 'No se puede eliminar la categoría porque tiene productos asociados'
        };
      }
      throw err;
    }

    return {
      found: true,
      hasRelations: false,
      success: true
    };
  }
}

module.exports = new CategoryService();
module.exports.CategoryService = CategoryService;
