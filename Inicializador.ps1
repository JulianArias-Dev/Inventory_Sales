# Inicializador.ps1
# Script que levanta Docker e inserta datos según AppDbContext.cs

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "INICIALIZADOR AUTOMÁTICO - ACTIVIDAD 1" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PASO 1: Construyendo imágenes Docker..." -ForegroundColor Yellow
docker compose build --parallel
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Error al construir las imágenes" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Imágenes construidas correctamente" -ForegroundColor Green
Write-Host ""

Write-Host "PASO 2: Levantando contenedores..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Error al levantar contenedores" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Contenedores iniciados" -ForegroundColor Green
Write-Host ""

Write-Host "PASO 3: Esperando que los servicios estén listos..." -ForegroundColor Yellow

# Esperar a que SQL Server esté listo
Write-Host "   Esperando SQL Server..." -NoNewline
$maxAttempts = 30
$attempt = 0
$sqlReady = $false
while ($attempt -lt $maxAttempts -and -not $sqlReady) {
    $result = docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -Q "SELECT 1" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $sqlReady = $true
        Write-Host " ✅" -ForegroundColor Green
    }
    else {
        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 3
    }
}
if (-not $sqlReady) {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "ERROR: SQL Server no responde después de $maxAttempts intentos" -ForegroundColor Red
    exit 1
}

# Crear la base de datos si no existe
Write-Host "   Verificando base de datos..." -NoNewline
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'InventorySales') CREATE DATABASE InventorySales" 
Write-Host " ✅" -ForegroundColor Green

# Esperar a que la API esté respondiendo
Write-Host "   Esperando API..." -NoNewline
$attempt = 0
$apiReady = $false
while ($attempt -lt $maxAttempts -and -not $apiReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/swagger" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $apiReady = $true
            Write-Host " ✅" -ForegroundColor Green
        }
    }
    catch {
        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}
if (-not $apiReady) {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "ERROR: API no responde después de $maxAttempts intentos" -ForegroundColor Red
    Write-Host "   Revisa los logs con: docker compose logs api" -ForegroundColor Yellow
    exit 1
}

# Esperar a que las tablas estén creadas por Entity Framework
Write-Host "   Verificando creación de tablas..." -NoNewline
$attempt = 0
$tablesReady = $false
while ($attempt -lt $maxAttempts -and -not $tablesReady) {
    $tableCheck = docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -Q "USE InventorySales; SELECT COUNT(*) FROM sys.tables WHERE name IN ('Categorias', 'Productos', 'Ventas', 'VentaProducto')" -h -1 2>$null
    $tableCheck = $tableCheck.Trim()
    
    if ($tableCheck -eq "4") {
        $tablesReady = $true
        Write-Host " ✅" -ForegroundColor Green
    }
    else {
        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 3
    }
}
if (-not $tablesReady) {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "ERROR: Las tablas no se crearon después de $maxAttempts intentos" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "PASO 4: Insertando datos de prueba..." -ForegroundColor Yellow

# Consultar la estructura exacta de las tablas
Write-Host "   Consultando estructura de tablas..." -ForegroundColor Gray

$ventasColumns = docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Ventas' ORDER BY ORDINAL_POSITION" -h -1 -W 2>$null
Write-Host "   Columnas en Ventas: $ventasColumns" -ForegroundColor Gray

$vpColumns = docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'VentaProducto' ORDER BY ORDINAL_POSITION" -h -1 -W 2>$null
Write-Host "   Columnas en VentaProducto: $vpColumns" -ForegroundColor Gray

# Limpiar datos existentes (orden inverso por las FK)
Write-Host "   Limpiando datos existentes..." -ForegroundColor Gray
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q @"
-- Eliminar en orden inverso
DELETE FROM VentaProducto;
DELETE FROM Ventas;
DELETE FROM Productos;
DELETE FROM Categorias;
DBCC CHECKIDENT ('Categorias', RESEED, 0);
DBCC CHECKIDENT ('Productos', RESEED, 0);
DBCC CHECKIDENT ('Ventas', RESEED, 0);
"@ 2>$null

# Insertar Categorías
Write-Host "   Insertando categorías..." -ForegroundColor Gray
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q @"
SET IDENTITY_INSERT Categorias ON;
INSERT INTO Categorias (Id, Name) VALUES
(1, 'Electronica'),
(2, 'Ropa y Accesorios'),
(3, 'Hogar y Muebles'),
(4, 'Deportes y Fitness'),
(5, 'Juguetes y Juegos'),
(6, 'Libros y Papeleria'),
(7, 'Belleza y Cuidado Personal'),
(8, 'Alimentos y Bebidas'),
(9, 'Mascotas'),
(10, 'Herramientas y Ferreteria');
SET IDENTITY_INSERT Categorias OFF;
"@
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ Categorías insertadas (IDs 1-10)" -ForegroundColor Green }

# Insertar Productos
Write-Host "   Insertando productos..." -ForegroundColor Gray
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q @"
SET IDENTITY_INSERT Productos ON;
INSERT INTO Productos (Id, Name, Price, Stock, CategoriaId) VALUES
(1, 'Smartphone Samsung Galaxy S23', 899.99, 15, 1),
(2, 'Camiseta Deportiva Nike', 29.99, 50, 2),
(3, 'Sofa de 3 plazas', 499.99, 5, 3),
(4, 'Bicicleta de Montana', 349.99, 8, 4),
(5, 'LEGO Technic Porsche 911', 149.99, 12, 5),
(6, 'El Principito Libro', 12.99, 30, 6),
(7, 'Perfume Chanel No 5', 89.99, 10, 7),
(8, 'Cafe Colombiano 500g', 8.99, 100, 8),
(9, 'Alimento para Perros 15kg', 45.99, 20, 9),
(10, 'Taladro Electrico', 79.99, 7, 10);
SET IDENTITY_INSERT Productos OFF;
"@
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ Productos insertados (IDs 1-10)" -ForegroundColor Green }

# Insertar Ventas
Write-Host "   Insertando ventas..." -ForegroundColor Gray
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q @"
SET IDENTITY_INSERT Ventas ON;
INSERT INTO Ventas (Id, Date, CustomerName, TotalAmount) VALUES
-- HOY (5 ventas)
(1, GETDATE(), 'Carlos Rodriguez', 929.98),
(2, GETDATE(), 'Ana Martinez', 149.99),
(3, GETDATE(), 'Luis Gonzalez', 508.97),
(4, GETDATE(), 'Laura Sanchez', 89.99),
(5, GETDATE(), 'Pedro Gomez', 429.98),

-- AYER (3 ventas)
(6, DATEADD(day, -1, GETDATE()), 'Sofia Lopez', 71.96),
(7, DATEADD(day, -1, GETDATE()), 'Diego Torres', 899.99),
(8, DATEADD(day, -1, GETDATE()), 'Valentina Diaz', 59.98),

-- HACE 2 DÍAS (4 ventas)
(9, DATEADD(day, -2, GETDATE()), 'Andres Castro', 349.99),
(10, DATEADD(day, -2, GETDATE()), 'Camila Rojas', 30.97),
(11, DATEADD(day, -2, GETDATE()), 'Miguel Herrera', 149.99),
(12, DATEADD(day, -2, GETDATE()), 'Paula Medina', 89.99),

-- HACE 3 DÍAS (2 ventas)
(13, DATEADD(day, -3, GETDATE()), 'Juan Perez', 899.99),
(14, DATEADD(day, -3, GETDATE()), 'Daniela Ruiz', 59.98),

-- HACE 4 DÍAS (1 venta)
(15, DATEADD(day, -4, GETDATE()), 'Ricardo Mora', 349.99);

SET IDENTITY_INSERT Ventas OFF;
"@
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ Ventas insertadas (IDs 1-10)" -ForegroundColor Green }

# Insertar VentaProductos (con Cantidad y PrecioUnitario)
Write-Host "   Insertando relaciones Venta-Producto..." -ForegroundColor Gray
docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q @"
INSERT INTO VentaProducto (VentaId, ProductoId, Cantidad, PrecioUnitario) VALUES
(1, 1, 1, 899.99), (1, 2, 1, 29.99),  -- Carlos: Smartphone + Camiseta
(2, 5, 1, 149.99),                       -- Ana: LEGO
(3, 3, 1, 499.99), (3, 8, 2, 8.99),      -- Luis: Sofá + 2 Cafés
(4, 7, 1, 89.99),                         -- Laura: Perfume
(5, 4, 1, 349.99), (5, 10, 1, 79.99),    -- Pedro: Bicicleta + Taladro
(6, 6, 2, 12.99), (6, 9, 1, 45.99), (6, 8, 3, 8.99), -- Sofía: 2 Libros + Alimento + 3 Cafés
(7, 1, 1, 899.99),                         -- Diego: Smartphone
(8, 2, 2, 29.99),                          -- Valentina: 2 Camisetas
(9, 4, 1, 349.99),                         -- Andrés: Bicicleta
(10, 6, 1, 12.99), (10, 8, 2, 8.99);      -- Camila: Libro + 2 Cafés
"@
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ Relaciones Venta-Producto insertadas" -ForegroundColor Green }

Write-Host ""
Write-Host "PASO 5: Verificando datos insertados..." -ForegroundColor Yellow

Write-Host "   Verificando relaciones:" -ForegroundColor Gray

$prodSinCat = docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q "SELECT COUNT(*) FROM Productos WHERE CategoriaId NOT IN (SELECT Id FROM Categorias)" -h -1 2>$null
$prodSinCat = $prodSinCat.Trim()
if ($prodSinCat -eq "0") { Write-Host "   ✅ Todos los productos tienen categoría válida" -ForegroundColor Green }

Write-Host ""
Write-Host "RESUMEN DE DATOS:" -ForegroundColor Cyan

docker exec sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "Unicesar+2026" -C -d InventorySales -Q @"
SELECT 'Categorías' as Tabla, COUNT(*) as Registros FROM Categorias
UNION ALL
SELECT 'Productos', COUNT(*) FROM Productos
UNION ALL
SELECT 'Ventas', COUNT(*) FROM Ventas
UNION ALL
SELECT 'VentaProducto', COUNT(*) FROM VentaProducto;

SELECT '--- PRODUCTOS POR CATEGORÍA ---' as '';

SELECT c.Name as Categoria, p.Name as Producto, p.Price, p.Stock
FROM Productos p
JOIN Categorias c ON p.CategoriaId = c.Id
ORDER BY c.Id, p.Id;

SELECT '--- VENTAS CON PRODUCTOS, CANTIDADES Y PRECIOS ---' as '';

SELECT v.Id as VentaId, v.Date, v.CustomerName, v.TotalAmount,
       p.Name as Producto, vp.Cantidad, vp.PrecioUnitario,
       (vp.Cantidad * vp.PrecioUnitario) as Subtotal
FROM Ventas v
JOIN VentaProducto vp ON v.Id = vp.VentaId
JOIN Productos p ON vp.ProductoId = p.Id
ORDER BY v.Id, p.Id;
"@

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ PROYECTO INICIADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Yellow
Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   • API: http://localhost:5000/swagger" -ForegroundColor Cyan
Write-Host "   • SQL Server: localhost:1433 (sa/Unicesar+2026)" -ForegroundColor Cyan