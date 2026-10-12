const db = require('../config/db');
const authService = require('../services/authService');

async function initializeDatabase(options = {}) {
  const maxRetries = options.maxRetries || 15;
  const retryIntervalMs = options.retryIntervalMs || 3000;

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

        await conn.query(`
          CREATE TABLE IF NOT EXISTS Usuarios (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Username VARCHAR(100) NOT NULL UNIQUE,
            Password VARCHAR(255) NOT NULL,
            Role VARCHAR(50) NOT NULL DEFAULT 'Admin'
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

        // Check if seeding is needed for Ventas and VentaProductos
        const [ventasCount] = await conn.query(
          'SELECT COUNT(*) as count FROM Ventas'
        );

        if ((ventasCount[0]?.count || 0) === 0) {
          console.log('[DB] Insertando ventas iniciales de prueba...');

          // Insertar ventas
          await conn.query(`
            INSERT INTO Ventas (Id, Date, CustomerName, CustomerEmail, TotalAmount) VALUES
            (1, '2026-10-01 09:15:00', 'Juan Pérez', 'juan.perez@gmail.com', 250000.00),
            (2, '2026-10-02 10:30:00', 'María González', 'maria.gonzalez@gmail.com', 243000.00),
            (3, '2026-10-03 14:20:00', 'Carlos Rodríguez', 'carlos.rodriguez@gmail.com', 220000.00),
            (4, '2026-10-04 16:45:00', 'Laura Martínez', 'laura.martinez@gmail.com', 450000.00),
            (5, '2026-10-05 11:10:00', 'Andrés Ramírez', 'andres.ramirez@gmail.com', 236000.00),
            (6, '2026-10-06 12:00:00', 'Sofía Torres', 'sofia.torres@gmail.com', 225000.00),
            (7, '2026-10-07 15:35:00', 'Daniel Castro', 'daniel.castro@gmail.com', 470000.00),
            (8, '2026-10-08 17:20:00', 'Valentina López', 'valentina.lopez@gmail.com', 118000.00),
            (9, '2026-10-09 13:50:00', 'Sebastián Herrera', 'sebastian.herrera@gmail.com', 345000.00),
            (10, '2026-10-10 18:05:00', 'Camila Fernández', 'camila.fernandez@gmail.com', 675000.00),
            (11, '2026-10-11 09:40:00', 'Miguel Sánchez', 'miguel.sanchez@gmail.com', 125000.00),
            (12, '2026-10-12 14:25:00', 'Isabella Díaz', 'isabella.diaz@gmail.com', 445000.00),
            (13, '2026-10-12 15:10:00', 'David Moreno', 'david.moreno@gmail.com', 350000.00),
            (14, '2026-10-12 16:30:00', 'Natalia Vargas', 'natalia.vargas@gmail.com', 563000.00),
            (15, '2026-10-12 17:45:00', 'Felipe Jiménez', 'felipe.jimenez@gmail.com', 220000.00)
          `);

          console.log('[DB] Insertando detalles de los productos vendidos...');

          // Insertar productos asociados a cada venta
          await conn.query(`
            INSERT INTO VentaProductos (VentaId, ProductoId, Cantidad, PrecioUnitario) VALUES
            -- Venta 1: 2 Jeans Azules
            (1, 1, 2, 125000.00),

            -- Venta 2: 2 Jeans Claros
            (2, 2, 2, 118000.00),

            -- Venta 3: 1 Tennis Nike
            (3, 3, 1, 220000.00),

            -- Venta 4: 2 Tennis Adidas
            (4, 4, 2, 225000.00),

            -- Venta 5: 2 Jeans Claros
            (5, 2, 2, 118000.00),

            -- Venta 6: 1 Tennis Adidas
            (6, 4, 1, 225000.00),

            -- Venta 7: 2 Jeans Azules y 1 Tennis Nike
            (7, 1, 2, 125000.00),
            (7, 3, 1, 220000.00),

            -- Venta 8: 1 Jeans Claros
            (8, 2, 1, 118000.00),

            -- Venta 9: 1 Jeans Azules y 1 Tennis Adidas
            (9, 1, 1, 125000.00),
            (9, 4, 1, 225000.00),

            -- Venta 10: 2 Tennis Nike y 1 Tennis Adidas
            (10, 3, 2, 220000.00),
            (10, 4, 1, 225000.00),

            -- Venta 11: 1 Jeans Azules
            (11, 1, 1, 125000.00),

            -- Venta 12: 1 Jeans Claros y 1 Tennis Adidas
            (12, 2, 1, 118000.00),
            (12, 4, 1, 225000.00),

            -- Venta 13: 1 Jeans Azules y 1 Jeans Claros
            (13, 1, 1, 125000.00),
            (13, 2, 1, 118000.00),

            -- Venta 14: 2 Jeans Azules, 1 Jeans Claros y 1 Tennis Adidas
            (14, 1, 2, 125000.00),
            (14, 2, 1, 118000.00),
            (14, 4, 1, 225000.00),

            -- Venta 15: 1 Tennis Nike
            (15, 3, 1, 220000.00)
          `);

          console.log('[DB] Ventas y detalles insertados correctamente.');
        }

        // Check if seeding is needed for Admin user
        const [adminCount] = await conn.query(
          'SELECT COUNT(*) as count FROM Usuarios WHERE LOWER(TRIM(Username)) = ?',
          ['admin']
        );
        if ((adminCount[0]?.count || 0) === 0) {
          console.log('[DB] Creando usuario Admin inicial...');
          const hashedPassword = await authService.hashPassword('Admin123!');
          await conn.query(
            'INSERT INTO Usuarios (Username, Password, Role) VALUES (?, ?, ?)',
            ['Admin', hashedPassword, 'Admin']
          );
          console.log('[DB] Usuario Admin creado correctamente.');
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
