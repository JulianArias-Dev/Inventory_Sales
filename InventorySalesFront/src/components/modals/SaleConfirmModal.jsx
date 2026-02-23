import React from 'react';
import '../styles/SaleFormModal.css';

const SaleConfirmModal = ({
    show,
    onClose,
    onConfirm,
    onEdit,
    data,
    loading,
    error
}) => {
    if (!show) return null;

    const { cliente, productos, total } = data;

    return (
        <div className="sale-modal-overlay" onClick={onClose}>
            <div className="sale-modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h5 className="modal-title">
                        <i className="bi bi-check-circle me-2"></i>
                        Confirmar Venta
                    </h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
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
                            <p className="summary-value">{cliente}</p>
                        </div>

                        <div className="summary-section">
                            <h6><i className="bi bi-box me-2"></i>Productos</h6>
                            <div className="products-summary">
                                {productos.map((producto, index) => (
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
                        onClick={onEdit}
                    >
                        <i className="bi bi-pencil me-2"></i>
                        Editar Venta
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        <i className="bi bi-x-lg me-2"></i>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onConfirm}
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
};

export default SaleConfirmModal;