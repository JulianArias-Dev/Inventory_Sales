# 🛒 Ventas e Inventario

Sistema básico de **gestión de ventas e inventario, desarrollado como práctica de dockerización de aplicaciones full stack.**


## El proyecto incluye:
* API REST desarrollada en Microsoft .NET 8
* ORM con Entity Framework Core 9
* Frontend en React + Vite
* Estilos con Bootstrap
* Base de datos SQL Server 2022
* Orquestación con Docker Compose

## 🚀 Cómo ejecutar el proyecto
1️⃣ Clonar el repositorio
```bash
git clone <url-del-proyecto>
```
2️⃣ Navegar a la carpeta raíz
```bash
cd Inventory_Sales
```
3️⃣ Construir, levantar los contenedores y cargar los datos de prueba
```bash
.\Inicializador.ps1
```
Esto creará:
* Categorías
* Productos
* Ventas de ejemplo

🧪 Para levantar los contenedores
```bash
docker compose up
```

