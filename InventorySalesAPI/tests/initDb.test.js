const { initializeDatabase } = require('../src/database/initDb');
const db = require('../src/config/db');
const authService = require('../src/services/authService');
const { createMockPool } = require('./helpers/mockDb');

describe('Database Initialization & Admin Seeding Unit Tests', () => {
  let mockPool;
  let originalPool;

  beforeEach(() => {
    originalPool = db.pool;
    mockPool = createMockPool();
    db.setPool(mockPool);
  });

  afterEach(() => {
    db.setPool(originalPool);
  });

  it('debe ejecutar DDL para crear las tablas incluyendo Usuarios', async () => {
    const executedQueries = [];
    mockPool._conn.query.mockImplementation(async (sql, params) => {
      executedQueries.push(sql);
      if (sql.includes('COUNT(*) as count FROM Categorias')) {
        return [[{ count: 2 }]];
      }
      if (sql.includes('COUNT(*) as count FROM Productos')) {
        return [[{ count: 4 }]];
      }
      if (sql.includes('COUNT(*) as count FROM Usuarios')) {
        return [[{ count: 1 }]];
      }
      return [[]];
    });

    await initializeDatabase({ maxRetries: 1, retryIntervalMs: 1 });

    const hasUsuariosTable = executedQueries.some(q =>
      typeof q === 'string' && q.includes('CREATE TABLE IF NOT EXISTS Usuarios')
    );
    expect(hasUsuariosTable).toBe(true);
    expect(mockPool._conn.release).toHaveBeenCalled();
  });

  it('debe crear el usuario Admin inicial con contraseña hasheada cuando no existe', async () => {
    const insertedUsers = [];

    mockPool._conn.query.mockImplementation(async (sql, params) => {
      if (sql.includes('COUNT(*) as count FROM Categorias')) {
        return [[{ count: 2 }]];
      }
      if (sql.includes('COUNT(*) as count FROM Productos')) {
        return [[{ count: 4 }]];
      }
      if (sql.includes('COUNT(*) as count FROM Usuarios')) {
        return [[{ count: 0 }]];
      }
      if (sql.includes('INSERT INTO Usuarios')) {
        insertedUsers.push(params);
        return [{ insertId: 1 }];
      }
      return [[]];
    });

    await initializeDatabase({ maxRetries: 1, retryIntervalMs: 1 });

    expect(insertedUsers).toHaveLength(1);
    const [username, hashedPassword, role] = insertedUsers[0];
    expect(username).toBe('Admin');
    expect(role).toBe('Admin');
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword).not.toBe('Admin123!');

    const isValid = await authService.comparePassword('Admin123!', hashedPassword);
    expect(isValid).toBe(true);
    expect(mockPool._conn.release).toHaveBeenCalled();
  });

  it('no debe insertar usuario Admin si ya existe en la base de datos', async () => {
    let insertCalled = false;

    mockPool._conn.query.mockImplementation(async (sql, params) => {
      if (sql.includes('COUNT(*) as count FROM Categorias')) {
        return [[{ count: 2 }]];
      }
      if (sql.includes('COUNT(*) as count FROM Productos')) {
        return [[{ count: 4 }]];
      }
      if (sql.includes('COUNT(*) as count FROM Usuarios')) {
        return [[{ count: 1 }]];
      }
      if (sql.includes('INSERT INTO Usuarios')) {
        insertCalled = true;
        return [{ insertId: 1 }];
      }
      return [[]];
    });

    await initializeDatabase({ maxRetries: 1, retryIntervalMs: 1 });

    expect(insertCalled).toBe(false);
    expect(mockPool._conn.release).toHaveBeenCalled();
  });

  it('debe insertar categorías y productos iniciales si las tablas están vacías', async () => {
    let categoriesInserted = false;
    let productsInserted = false;

    mockPool._conn.query.mockImplementation(async (sql, params) => {
      if (sql.includes('COUNT(*) as count FROM Categorias')) {
        return [[{ count: 0 }]];
      }
      if (sql.includes('INSERT INTO Categorias')) {
        categoriesInserted = true;
        return [[]];
      }
      if (sql.includes('COUNT(*) as count FROM Productos')) {
        return [[{ count: 0 }]];
      }
      if (sql.includes('INSERT INTO Productos')) {
        productsInserted = true;
        return [[]];
      }
      if (sql.includes('COUNT(*) as count FROM Usuarios')) {
        return [[{ count: 1 }]];
      }
      return [[]];
    });

    await initializeDatabase({ maxRetries: 1, retryIntervalMs: 1 });

    expect(categoriesInserted).toBe(true);
    expect(productsInserted).toBe(true);
    expect(mockPool._conn.release).toHaveBeenCalled();
  });

  it('debe manejar errores de conexión liberando recursos y agotando reintentos', async () => {
    mockPool.getConnection.mockRejectedValue(new Error('Connection refused'));

    // Debe completar sin lanzar excepción no capturada
    await initializeDatabase({ maxRetries: 2, retryIntervalMs: 5 });

    expect(mockPool.getConnection).toHaveBeenCalledTimes(2);
  });
});
