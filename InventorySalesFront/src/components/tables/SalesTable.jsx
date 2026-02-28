import React from 'react';
import '../../styles/salesTable.css';

const SalesTable = ({ ventas, onViewDetails, loading }) => {
    if (loading) {
        return (
            <div className="sales-table-wrapper">
                <div className="loading-state">
                    <div className="custom-spinner"></div>
                    <p className="text-muted">Cargando ventas...</p>
                </div>
            </div>
        );
    }

    if (!ventas || ventas.length === 0) {
        return (
            <div className="sales-table-wrapper">
                <div className="empty-state">
                    <i className="bi bi-cart-x"></i>
                    <p>No hay ventas registradas</p>
                    <p className="text-muted">Comienza creando una nueva venta</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sales-table-wrapper">
            <table className="sales-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ventas.map((venta) => (
                        <tr key={venta.id}>
                            <td>
                                <span className="sale-id-badge">#{venta.id}</span>
                            </td>
                            <td>
                                <div className="date-cell">
                                    <i className="bi bi-calendar3"></i>
                                    {new Date(venta.date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </td>
                            <td>
                                <div className="customer-info">
                                    <div className="customer-avatar">
                                        <i className="bi bi-person"></i>
                                    </div>
                                    <div className="customer-details">
                                        <span className="customer-name">{venta.customerName || 'Sin nombre'}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="amount-cell">
                                ${venta.totalAmount?.toFixed(2) || '0.00'}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-action btn-view"
                                        onClick={() => onViewDetails(venta.id)}
                                        title="Ver detalles de la venta"
                                    >
                                        <i className="bi bi-eye"></i>
                                        Detalle
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SalesTable;