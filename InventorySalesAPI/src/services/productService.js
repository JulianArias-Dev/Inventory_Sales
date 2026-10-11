const db = require('../config/db');

class ProductService {
  constructor(customPool = null) {
    this._pool = customPool;
  }

  get pool() {
    return this._pool || db.pool;
  }

  async getAll() {
    const [rows] = await this.pool.query(
      'SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos ORDER BY Id ASC'
    );
    return rows.map(r => ({
      id: Number(r.id),
      name: r.name,
      price: Number(r.price),
      stock: Number(r.stock),
      categoria: Number(r.categoria)
    }));
  }

  async getById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return null;

    const [rows] = await this.pool.query(
      'SELECT Id as id, Name as name, Price as price, Stock as stock, CategoriaId as categoria FROM Productos WHERE Id = ?',
      [numericId]
    );

    if (rows.length === 0) return null;

    return {
      id: Number(rows[0].id),
      name: rows[0].name,
      price: Number(rows[0].price),
      stock: Number(rows[0].stock),
      categoria: Number(rows[0].categoria)
    };
  }

  async hasSales(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return false;

    const [rows] = await this.pool.query(
      'SELECT COUNT(*) as count FROM VentaProductos WHERE ProductoId = ?',
      [numericId]
    );

    return Number(rows[0]?.count || 0) > 0;
  }

  async create(data) {
    const name = typeof data?.name === 'string'
      ? data.name.trim()
      : (data?.name != null ? String(data.name).trim() : '');

    if (!name) {
      const err = new Error('El nombre del producto es requerido.');
      err.status = 400;
      throw err;
    }

    const price = parseFloat(data?.price);
    if (isNaN(price) || price < 0) {
      const err = new Error('El precio del producto debe ser un número positivo.');
      err.status = 400;
      throw err;
    }

    const stock = parseInt(data?.stock, 10);
    if (isNaN(stock) || stock < 0) {
      const err = new Error('El stock del producto debe ser un entero no negativo.');
      err.status = 400;
      throw err;
    }

    const categoriaId = parseInt(data?.categoriaId !== undefined ? data.categoriaId : data?.categoria, 10);
    if (isNaN(categoriaId) || categoriaId <= 0) {
      const err = new Error('La categoría del producto es requerida.');
      err.status = 400;
      throw err;
    }

    // Check category exists
    const [catRows] = await this.pool.query(
      'SELECT Id FROM Categorias WHERE Id = ?',
      [categoriaId]
    );
    if (catRows.length === 0) {
      const err = new Error('La categoría especificada no existe.');
      err.status = 400;
      throw err;
    }

    // Check duplicate name
    const [existing] = await this.pool.query(
      'SELECT Id FROM Productos WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?))',
      [name]
    );
    if (existing.length > 0) {
      const err = new Error('Ya existe un producto con ese nombre.');
      err.status = 409;
      throw err;
    }

    const [result] = await this.pool.query(
      'INSERT INTO Productos (Name, Price, Stock, CategoriaId) VALUES (?, ?, ?, ?)',
      [name, price, stock, categoriaId]
    );

    return {
      id: Number(result.insertId),
      name,
      price: Number(price),
      stock: Number(stock),
      categoria: categoriaId
    };
  }

  async update(id, data) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      const err = new Error('ID de producto inválido.');
      err.status = 400;
      throw err;
    }

    const product = await this.getById(numericId);
    if (!product) {
      return null;
    }

    const name = data?.name !== undefined
      ? (typeof data.name === 'string' ? data.name.trim() : String(data.name).trim())
      : product.name;

    if (!name) {
      const err = new Error('El nombre del producto no puede estar vacío.');
      err.status = 400;
      throw err;
    }

    const price = data?.price !== undefined ? parseFloat(data.price) : product.price;
    if (isNaN(price) || price < 0) {
      const err = new Error('El precio debe ser un número positivo.');
      err.status = 400;
      throw err;
    }

    const stock = data?.stock !== undefined ? parseInt(data.stock, 10) : product.stock;
    if (isNaN(stock) || stock < 0) {
      const err = new Error('El stock debe ser un entero no negativo.');
      err.status = 400;
      throw err;
    }

    const categoriaId = data?.categoriaId !== undefined
      ? parseInt(data.categoriaId, 10)
      : (data?.categoria !== undefined ? parseInt(data.categoria, 10) : product.categoria);

    if (isNaN(categoriaId) || categoriaId <= 0) {
      const err = new Error('La categoría es inválida.');
      err.status = 400;
      throw err;
    }

    // Verify category exists
    const [catRows] = await this.pool.query(
      'SELECT Id FROM Categorias WHERE Id = ?',
      [categoriaId]
    );
    if (catRows.length === 0) {
      const err = new Error('La categoría especificada no existe.');
      err.status = 400;
      throw err;
    }

    // Check duplicate name with another product
    const [existing] = await this.pool.query(
      'SELECT Id FROM Productos WHERE LOWER(TRIM(Name)) = LOWER(TRIM(?)) AND Id != ?',
      [name, numericId]
    );
    if (existing.length > 0) {
      const err = new Error('Ya existe un producto con ese nombre.');
      err.status = 400;
      throw err;
    }

    await this.pool.query(
      'UPDATE Productos SET Name = ?, Price = ?, Stock = ?, CategoriaId = ? WHERE Id = ?',
      [name, price, stock, categoriaId, numericId]
    );

    return {
      id: numericId,
      name,
      price: Number(price),
      stock: Number(stock),
      categoria: categoriaId
    };
  }

  async delete(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      return { found: false };
    }

    const product = await this.getById(numericId);
    if (!product) {
      return { found: false };
    }

    // Bug 3 fix: Prevent deletion when product has associated sales
    const hasRelation = await this.hasSales(numericId);
    if (hasRelation) {
      return {
        found: true,
        hasRelations: true,
        message: 'No se puede eliminar el producto porque tiene ventas asociadas'
      };
    }

    try {
      await this.pool.query('DELETE FROM Productos WHERE Id = ?', [numericId]);
    } catch (err) {
      // Catch MySQL foreign key constraint error (ER_ROW_IS_REFERENCED_2 / errno 1451)
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
        return {
          found: true,
          hasRelations: true,
          message: 'No se puede eliminar el producto porque tiene ventas asociadas'
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

module.exports = new ProductService();
module.exports.ProductService = ProductService;
