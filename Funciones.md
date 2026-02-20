# Ideas

## Tienda Online


### 1. Productos
```json
categoria = {
    _id :,
    nombre : 
}

producto =  {
    _id : ,
    nombre : "",
    precio : 0.0,
    stock : 0,
    categoria : 
}
```

### 2. Ventas

```json
venta =  {
    _id : ,
    cliente : ,
    total : 0.0,
    productos : [
        {
            productId :"", 
            cantidad:0,
            unitPrice:0.0,
        }
    ]
}

```

## Funciones
### Categorías
* Registrar categorías: El nombre debe ser único
* Modificar nombre de categorías
* Eliminar categorías: No se pueden eliminar categorías, si ya se encuentran productos asociados

### Productos
* Registrar Productos: El nombre debe ser único
* Modificar Productos:
    - Actualizar nombre, precio y stock
    - Modificar stock : Aumentar y disminuir
* Eliminar Productos: No se pueden elmiminar los productos si se encuentran asociados a una venta

### Ventas
* Registrar ventas: Al registrar una venta se debe disminuir el stock de los productos incluídos
* Eliminar ventas: Al eliminar una venta, se debe aumentar el stock de los productos incluídos 

### Dashboard
Crear una seccion con un dashboard que muestre un informe de las ventas registradas:
* Ventas por categotía
* Los 10 productos más vendidos
* Total ventas




         


