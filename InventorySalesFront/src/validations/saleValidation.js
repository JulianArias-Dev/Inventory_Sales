export function validarNombreCliente(nombre) {
  return nombre.trim() !== '';
}

export function validarEmailCliente(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.trim() !== '' && emailRegex.test(email.trim());
}

export function validarProductosVenta(productos) {
  return productos.length > 0;
}

export function validarCantidadProducto(cantidad, stock) {
    const cantidadNumero = Number(cantidad);
    const stockNumero = Number(stock);

    return (
        Number.isInteger(cantidadNumero) &&
        Number.isFinite(stockNumero) &&
        cantidadNumero >= 1 &&
        stockNumero >= 0 &&
        cantidadNumero <= stockNumero
    );
}

export function validarVenta(nombre, email, productos) {
  return (
    validarNombreCliente(nombre) &&
    validarEmailCliente(email) &&
    validarProductosVenta(productos)
  );
}
