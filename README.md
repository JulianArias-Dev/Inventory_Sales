# 🛒 Ventas e Inventario

Sistema básico de **gestión de ventas e inventario, desarrollado como práctica de dockerización de aplicaciones full stack.**


## El proyecto incluye:
* API REST desarrollada en Node.js y Express
* Base de datos MySQL
* Pruebas unitarias con Jest
* Frontend en React + Vite
* Estilos con Bootstrap
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
3️⃣ Levantar los contenedores
```bash
docker compose up --build
```

## Probar la aplicación
### Backend
```bash
# En swagger se encontrará la documentación del backend
localhost:5000/swagger/index.html
```

### Frontend
```bash
localhost:5173/
```

## 🧪 Pruebas Unitarias (Jest)
Para ejecutar la suite de pruebas unitarias del backend:
```bash
cd InventorySalesAPI
npm install
npm test
```
O con el runner integrado:
```bash
node tests/runTests.js
```