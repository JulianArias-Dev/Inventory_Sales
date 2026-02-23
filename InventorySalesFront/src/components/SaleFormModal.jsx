import React, { useState, useEffect } from 'react';
import * as productService from '../services/productService';
import * as salesService from '../services/salesService';
import '../styles/saleFormModal.css';

const SaleFormModal = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState('form'); // 'form' o 'confirm'
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado del formulario
    const [formData, setFormData] = useState({
        cliente: '',
        productos: [] // { productId, nombre, precio, cantidad, subtotal }
    });

    // Estado para nuevo producto a agregar
    const [nuevoProducto, setNuevoProducto] = useState({
        productId: '',
        cantidad: 1,
        precio: 0,
        nombre: ''
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const data = await productService.getAll();
            setProductos(data);
        } catch (error) {
            setError('Error al cargar los productos');
            console.error(error);
        }
    };

    const handleClienteChange = (e) => {
        setFormData({
            ...formData,
            cliente: e.target.value
        });
    };

    const handleProductoSelect = (e) => {
        const productId = parseInt(e.target.value);
        const productoSeleccionado = productos.find(p => p.id === productId);

        if (productoSeleccionado) {
            setNuevoProducto({
                productId: productoSeleccionado.id,
                nombre: productoSeleccionado.name,
                precio: productoSeleccionado.price,
                cantidad: 1
            });
        }
    };

    const handleCantidadChange = (e) => {
        const cantidad = parseInt(e.target.value) || 1;
        setNuevoProducto({
            ...nuevoProducto,
            cantidad: cantidad > 0 ? cantidad : 1
        });
    };

    const agregarProducto = () => {
        if (!nuevoProducto.productId) {
            setError('Seleccione un producto');
            return;
        }

        if (nuevoProducto.cantidad < 1) {
            setError('La cantidad debe ser mayor a 0');
            return;
        }

        // Verificar stock disponible
        const productoEnStock = productos.find(p => p.id === nuevoProducto.productId);
        if (productoEnStock && productoEnStock.stock < nuevoProducto.cantidad) {
            setError(`Stock insuficiente. Stock disponible: ${productoEnStock.stock}`);
            return;
        }

        // Verificar si el producto ya está en la lista
        const productoExistente = formData.productos.find(p => p.productId === nuevoProducto.productId);
        if (productoExistente) {
            const nuevaCantidad = productoExistente.cantidad + nuevoProducto.cantidad;
            if (productoEnStock && productoEnStock.stock < nuevaCantidad) {
                setError(`Stock insuficiente. Stock disponible: ${productoEnStock.stock}`);
                return;
            }

            // Actualizar cantidad del producto existente
            const productosActualizados = formData.productos.map(p => {
                if (p.productId === nuevoProducto.productId) {
                    const nuevaCantidad = p.cantidad + nuevoProducto.cantidad;
                    return {
                        ...p,
                        cantidad: nuevaCantidad,
                        subtotal: p.precio * nuevaCantidad
                    };
                }
                return p;
            });

            setFormData({
                ...formData,
                productos: productosActualizados
            });
        } else {
            // Agregar nuevo producto
            const subtotal = nuevoProducto.precio * nuevoProducto.cantidad;
            setFormData({
                ...formData,
                productos: [
                    ...formData.productos,
                    {
                        ...nuevoProducto,
                        subtotal
                    }
                ]
            });
        }

        // Resetear selección
        setNuevoProducto({
            productId: '',
            cantidad: 1,
            precio: 0,
            nombre: ''
        });
        setError('');
    };

    const eliminarProducto = (index) => {
        const nuevosProductos = formData.productos.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            productos: nuevosProductos
        });
    };

    const calcularTotal = () => {
        return formData.productos.reduce((total, producto) => total + producto.subtotal, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.cliente.trim()) {
            setError('Ingrese el nombre del cliente');
            return;
        }

        if (formData.productos.length === 0) {
            setError('Agregue al menos un producto');
            return;
        }

        // Ir al paso de confirmación
        setStep('confirm');
        setError('');
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);

            // Preparar datos para el endpoint
            const ventaData = {
                cliente: formData.cliente,
                productos: formData.productos.map(p => ({
                    productId: p.productId,
                    cantidad: p.cantidad
                }))
            };

            await salesService.createVenta(ventaData);

            setStep('form');
            onSuccess(); // Recargar lista de ventas
            onClose(); // Cerrar modal
        } catch (error) {
            setError('Error al registrar la venta');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setStep('form');
    };

    const handleCancel = () => {
        if (step === 'confirm') {
            setStep('form');
        } else {
            if (formData.productos.length > 0 || formData.cliente) {
                if (window.confirm('¿Está seguro que desea cancelar? Los datos ingresados se perderán.')) {
                    onClose();
                }
            } else {
                onClose();
            }
        }
    };

    const total = calcularTotal();

    // Modal de confirmación
    if (step === 'confirm') {
        return (
            <div className="sale-modal-overlay" onClick={handleCancel}>
                <div className="sale-modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="bi bi-check-circle me-2"></i>
                            Confirmar Venta
                        </h5>
                        <button type="button" className="btn-close" onClick={handleCancel}></button>
                    </div>

                    <div className="modal-body">
                        {error && (
                            <div className="custom-alert custom-alert-danger">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                {error}
                            </div>
                        )}

                        <div className="sale-summary">
                            <div className="summary-section">
                                <h6><i className="bi bi-person me-2"></i>Cliente</h6>
                                <p className="summary-value">{formData.cliente}</p>
                            </div>

                            <div className="summary-section">
                                <h6><i className="bi bi-box me-2"></i>Productos</h6>
                                <div className="products-summary">
                                    {formData.productos.map((producto, index) => (
                                        <div key={index} className="product-summary-item">
                                            <div className="product-info">
                                                <span className="product-name">{producto.nombre}</span>
                                                <span className="product-detail">
                                                    {producto.cantidad} x ${producto.precio.toFixed(2)}
                                                </span>
                                            </div>
                                            <span className="product-subtotal">
                                                ${producto.subtotal.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="summary-total">
                                <div className="total-row">
                                    <span>Subtotal:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="total-row grand-total">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="confirm-info">
                                <i className="bi bi-info-circle me-2"></i>
                                Al confirmar, se registrará la venta y se actualizará el stock automáticamente.
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleEdit}
                        >
                            <i className="bi bi-pencil me-2"></i>
                            Editar Venta
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                        >
                            <i className="bi bi-x-lg me-2"></i>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-2"></i>
                                    Confirmar Venta
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Modal del formulario
    return (
        <div className="sale-modal-overlay" onClick={handleCancel}>
            <div className="sale-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h5 className="modal-title">
                        <i className="bi bi-cart-plus me-2"></i>
                        Nueva Venta
                    </h5>
                    <button type="button" className="btn-close" onClick={handleCancel}></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="custom-alert custom-alert-danger">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                                {error}
                            </div>
                        )}

                        {/* Datos del cliente */}
                        <div className="form-section">
                            <h6 className="section-title">
                                <i className="bi bi-person me-2"></i>
                                Datos del Cliente
                            </h6>
                            <div className="mb-3">
                                <label className="form-label">Nombre del Cliente</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.cliente}
                                    onChange={handleClienteChange}
                                    placeholder="Ingrese el nombre del cliente"
                                    required
                                />
                            </div>
                        </div>

                        {/* Agregar productos */}
                        <div className="form-section">
                            <h6 className="section-title">
                                <i className="bi bi-box me-2"></i>
                                Agregar Productos
                            </h6>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <select
                                        className="form-select"
                                        value={nuevoProducto.productId}
                                        onChange={handleProductoSelect}
                                    >
                                        <option value="">Seleccione un producto</option>
                                        {productos.map(producto => (
                                            <option key={producto.id} value={producto.id}>
                                                {producto.name} - ${producto.price} (Stock: {producto.stock})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {nuevoProducto.productId && (
                                    <>
                                        <div className="col-md-3">
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                value={nuevoProducto.cantidad}
                                                onChange={handleCantidadChange}
                                                placeholder="Cantidad"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <button
                                                type="button"
                                                className="btn btn-primary w-100"
                                                onClick={agregarProducto}
                                            >
                                                <i className="bi bi-plus me-2"></i>
                                                Agregar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Lista de productos agregados */}
                            {formData.productos.length > 0 && (
                                <div className="selected-products mt-3">
                                    <h6 className="mb-2">Productos seleccionados:</h6>
                                    <div className="products-list">
                                        {formData.productos.map((producto, index) => (
                                            <div key={index} className="selected-product-item">
                                                <div className="product-details">
                                                    <span className="product-name">{producto.nombre}</span>
                                                    <span className="product-quantity">
                                                        {producto.cantidad} x ${producto.precio.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="product-actions">
                                                    <span className="product-subtotal">
                                                        ${producto.subtotal.toFixed(2)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn-remove"
                                                        onClick={() => eliminarProducto(index)}
                                                        title="Eliminar producto"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resumen */}
                        {formData.productos.length > 0 && (
                            <div className="form-section summary-section">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            <i className="bi bi-x-lg me-2"></i>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={formData.productos.length === 0}
                        >
                            <i className="bi bi-arrow-right me-2"></i>
                            Continuar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaleFormModal;