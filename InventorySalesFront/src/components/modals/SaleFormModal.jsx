import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import salesService from '../../services/salesService';
import SaleConfirmModal from './SaleConfirmModal';
import '../../styles/salesDetailsModal.css';

const SaleFormModal = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState('form');
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        customerName: '',
        productos: []
    });

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
            setLoading(true);
            const data = await productService.getAll();

            if (Array.isArray(data)) {
                setProductos(data);
            } else {
                setError('Error al cargar los productos');
            }
        } catch (error) {
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            productos: []
        });
        setNuevoProducto({
            productId: '',
            cantidad: 1,
            precio: 0,
            nombre: ''
        });
        setError('');
        setStep('form');
    };

    const handleClienteChange = (e) => {
        setFormData({
            ...formData,
            customerName: e.target.value
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

        const productoEnStock = productos.find(p => p.id === nuevoProducto.productId);
        if (productoEnStock && productoEnStock.stock < nuevoProducto.cantidad) {
            setError(`Stock insuficiente. Stock disponible: ${productoEnStock.stock}`);
            return;
        }

        const productoExistente = formData.productos.find(p => p.productId === nuevoProducto.productId);

        if (productoExistente) {
            const nuevaCantidad = productoExistente.cantidad + nuevoProducto.cantidad;
            if (productoEnStock && productoEnStock.stock < nuevaCantidad) {
                setError(`Stock insuficiente. Stock disponible: ${productoEnStock.stock}`);
                return;
            }

            const productosActualizados = formData.productos.map(p => {
                if (p.productId === nuevoProducto.productId) {
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

        if (!formData.customerName.trim()) {
            setError('Ingrese el nombre del cliente');
            return;
        }

        if (formData.productos.length === 0) {
            setError('Agregue al menos un producto');
            return;
        }

        setStep('confirm');
        setError('');
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            setError('');

            const ventaData = {
                customerName: formData.customerName.trim(),
                productos: formData.productos.map(p => ({
                    productoId: p.productId,
                    cantidad: p.cantidad
                }))
            };

            console.log('Enviando venta:', ventaData);

            await salesService.createVenta(ventaData);

            resetForm(); // Limpiar todo
            onSuccess(); // Notificar éxito y cerrar
        } catch (error) {
            console.error('Error en handleConfirm:', error);
            setError(error.message || 'Error al registrar la venta');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (step === 'confirm') {
            // Si estamos en confirmación, volvemos al formulario
            // setStep('form');
            if (window.confirm('¿Está seguro que desea cancelar la venta?')) {
                resetForm();
                onClose();
            }
        } else {
            // Si estamos en el formulario, preguntamos si hay datos
            if (formData.productos.length > 0 || formData.customerName) {
                if (window.confirm('¿Está seguro que desea cancelar? Los datos ingresados se perderán.')) {
                    resetForm();
                    onClose(); // Cerrar el modal completamente
                }
            } else {
                onClose(); // Cerrar directamente si no hay datos
            }
        }
    };

    const total = calcularTotal();

    if (step === 'confirm') {
        return (
            <SaleConfirmModal
                show={true}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                onEdit={() => setStep('form')}
                data={{
                    cliente: formData.customerName,
                    productos: formData.productos,
                    total
                }}
                loading={loading}
                error={error}
            />
        );
    }

    return (
        <div className="sale-modal-overlay" onClick={handleCancel}>
            <div className="sale-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h5 className="modal-title">
                        <i className="bi bi-cart-plus me-2"></i>
                        Nueva Venta
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={handleCancel}
                        disabled={loading}
                    ></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="custom-alert custom-alert-danger">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </div>
                        )}

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
                                    value={formData.customerName}
                                    onChange={handleClienteChange}
                                    placeholder="Ingrese el nombre del cliente"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

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
                                        disabled={loading}
                                    >
                                        <option value="">Seleccione un producto</option>
                                        {productos.map(producto => (
                                            <option key={producto.id} value={producto.id}>
                                                {producto.name} - ${producto.price?.toFixed(2)} (Stock: {producto.stock})
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
                                                max={productos.find(p => p.id === nuevoProducto.productId)?.stock || 1}
                                                value={nuevoProducto.cantidad}
                                                onChange={handleCantidadChange}
                                                placeholder="Cantidad"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <button
                                                type="button"
                                                className="btn btn-primary w-100"
                                                onClick={agregarProducto}
                                                disabled={loading}
                                            >
                                                <i className="bi bi-plus me-2"></i>
                                                Agregar
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {formData.productos.length > 0 && (
                                <div className="selected-products mt-3">
                                    <h6 className="mb-2">Productos seleccionados:</h6>
                                    <div className="products-list">
                                        {formData.productos.map((producto, index) => (
                                            <div key={index} className="selected-product-item">
                                                <div className="product-details">
                                                    <span className="product-name">{producto.nombre}</span>
                                                    <span className="product-quantity">
                                                        {producto.cantidad} x ${producto.precio?.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="product-actions">
                                                    <span className="product-subtotal">
                                                        ${producto.subtotal?.toFixed(2)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="btn-remove"
                                                        onClick={() => eliminarProducto(index)}
                                                        title="Eliminar producto"
                                                        disabled={loading}
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
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            <i className="bi bi-x-lg me-2"></i>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={formData.productos.length === 0 || loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-arrow-right me-2"></i>
                                    Continuar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaleFormModal;