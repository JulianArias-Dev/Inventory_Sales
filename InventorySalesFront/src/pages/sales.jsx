import React, { useState, useEffect } from 'react';
import salesService from '../services/salesService';
import SaleFormModal from '../components/SaleFormModal';
import '../styles/sales.css';

const Sales = () => {
    const [ventas, setVentas] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        cargarVentas();
    }, []);

    const cargarVentas = async () => {
        const data = await saleService.getAll();
        setVentas(data);
    };

    return (
        <div className="sales-page">

            <div className="sales-header">
                <h2 className="page-title">Ventas</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowModal(true)}
                >
                    Nueva Venta
                </button>
            </div>

            <table className="sales-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    {ventas.map((venta) => (
                        <tr key={venta.id}>
                            <td>{venta.id}</td>
                            <td>{new Date(venta.date).toLocaleDateString()}</td>
                            <td>{venta.customerName}</td>
                            <td>${venta.totalAmount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <SaleFormModal
                    onClose={() => setShowModal(false)}
                    onSuccess={cargarVentas}
                />
            )}

        </div>
    );
};

export default Sales;