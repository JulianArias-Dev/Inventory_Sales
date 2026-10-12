
export function validarProducto(nombre, precio, stock, categoria) {
  if (nombre.trim() === '') {
    return false;
  }

  if (precio === '' || !Number.isFinite(Number(precio)) || Number(precio) <= 0) {
    return false;
  }

  if (stock === '' || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return false;
  }

  if (categoria === '') {
    return false;
  }

  return true;
}
