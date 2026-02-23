import { useEffect, useState } from "react";
import salesService from "../../services/salesService";
import '../../styles/salesDetailsModal.css';

const SalesDetailsModal = ({ ventaId, onClose }) => {
    const [venta, setVenta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadVenta = async () => {
            try {
                setLoading(true);
                const data = await getVentaById(ventaId);
                setVenta(data);
                setError("");
            } catch (error) {
                console.error(error);
                setError("Error al cargar los detalles de la venta");
            } finally {
                setLoading(false);
            }
        };

        loadVenta();
    }, [ventaId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="details-modal-overlay" onClick={onClose}>
                <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>
                            <i className="bi bi-receipt"></i>
                            Detalle de Venta
                        </h3>
                        <button className="btn-close" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="details-loading">
                            <div className="spinner"></div>
                            <p>Cargando detalles de la venta...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="details-modal-overlay" onClick={onClose}>
                <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>
                            <i className="bi bi-receipt"></i>
                            Detalle de Venta
                        </h3>
                        <button className="btn-close" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="custom-alert custom-alert-danger">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={onClose}>
                            <i className="bi bi-x-lg"></i>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!venta) return null;

    const calcularSubtotal = (cantidad, precioUnitario) => cantidad * precioUnitario;

    return (
        <div className="details-modal-overlay" onClick={onClose}>
            <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        <i className="bi bi-receipt"></i>
                        Factura #{venta.id}
                    </h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Invoice Header */}
                    <div className="invoice-header">
                        <div className="invoice-id">
                            <i className="bi bi-upc-scan"></i>
                            #{venta.id}
                        </div>
                        <div className="invoice-date">
                            <i className="bi bi-calendar3"></i>
                            {new Date(venta.date).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="customer-info-card">
                        <div className="customer-avatar-large">
                            <i className="bi bi-person"></i>
                        </div>
                        <div className="customer-details-large">
                            <h4>{venta.customerName}</h4>
                            <p>
                                <i className="bi bi-person-badge"></i>
                                Cliente
                            </p>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="products-table-wrapper">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venta.productos?.map((p, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="product-name-cell">
                                                <div className="product-icon-small">
                                                    <i className="bi bi-box"></i>
                                                </div>
                                                {p.productoNombre}
                                            </div>
                                        </td>
                                        <td>{p.cantidad}</td>
                                        <td>${p.precioUnitario.toFixed(2)}</td>
                                        <td>${calcularSubtotal(p.cantidad, p.precioUnitario).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="totals-section">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>${venta.totalAmount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="total-row">
                            <span>IVA (19%):</span>
                            <span>${(venta.totalAmount * 0.19).toFixed(2)}</span>
                        </div>
                        <div className="total-row final">
                            <span>Total:</span>
                            <span>${(venta.totalAmount * 1.19).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={handlePrint}>
                        <i className="bi bi-printer"></i>
                        Imprimir
                    </button>
                    <button className="btn-primary" onClick={onClose}>
                        <i className="bi bi-check-lg"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesDetailsModal;