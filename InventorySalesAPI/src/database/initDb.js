const db = require('../config/db');

async function initializeDatabase() {
  const maxRetries = 15;
  const retryIntervalMs = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DB] Conectando a MySQL (intento ${attempt}/${maxRetries})...`);
      const conn = await db.pool.getConnection();

      try {
        console.log('[DB] Verificando y creando tablas si no existen...');

        await conn.query(`
          CREATE TABLE IF NOT EXISTS Categorias (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(100) NOT NULL UNIQUE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS Productos (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(100) NOT NULL UNIQUE,
            Price DECIMAL(18,2) NOT NULL,
            Stock INT NOT NULL,
            CategoriaId INT NOT NULL,
            CONSTRAINT FK_Productos_Categorias FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id) ON DELETE RESTRICT
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS Ventas (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Date DATETIME NOT NULL,
            CustomerName VARCHAR(100) NOT NULL,
            CustomerEmail VARCHAR(100) NULL,
            TotalAmount DECIMAL(18,2) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await conn.query(`
          CREATE TABLE IF NOT EXISTS VentaProductos (
            VentaId INT NOT NULL,
            ProductoId INT NOT NULL,
            Cantidad INT NOT NULL,
            PrecioUnitario DECIMAL(18,2) NOT NULL,
            PRIMARY KEY (VentaId, ProductoId),
            CONSTRAINT FK_VentaProductos_Ventas FOREIGN KEY (VentaId) REFERENCES Ventas(Id) ON DELETE CASCADE,
            CONSTRAINT FK_VentaProductos_Productos FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE RESTRICT
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Check if seeding is needed for Categorias
        const [catCount] = await conn.query('SELECT COUNT(*) as count FROM Categorias');
        if ((catCount[0]?.count || 0) === 0) {
          console.log('[DB] Insertando categorías iniciales de prueba...');
          await conn.query(`
            INSERT INTO Categorias (Id, Name) VALUES
            (1, 'Jeans'),
            (2, 'Zapatos')
          `);
        }

        // Check if seeding is needed for Productos
        const [prodCount] = await conn.query('SELECT COUNT(*) as count FROM Productos');
        if ((prodCount[0]?.count || 0) === 0) {
          console.log('[DB] Insertando productos iniciales de prueba...');
          await conn.query(`
            INSERT INTO Productos (Id, Name, Price, Stock, CategoriaId) VALUES
            (1, 'Jeans Azules', 125000, 50, 1),
            (2, 'Jeans Claros', 118000, 50, 1),
            (3, 'Tennis Nike', 220000, 50, 2),
            (4, 'Tennis Adidas', 225000, 50, 2)
          `);
        }

        console.log('[DB] Base de datos inicializada correctamente.');
        return;
      } finally {
        conn.release();
      }
    } catch (err) {
      console.warn(`[DB Advertencia] Error conectando a la BD: ${err.message}`);
      if (attempt === maxRetries) {
        console.error('[DB Error] No se pudo conectar a la base de datos tras múltiples intentos.');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
    }
  }
}

module.exports = { initializeDatabase };
