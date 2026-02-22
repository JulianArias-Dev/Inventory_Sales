function SaleDetailsModal({ sale, onClose }) {

    const calculateProductTotal = (producto) => {
        return producto.cantidad * producto.unitPrice;
    };

    return (
        <div className="modal-overlay">
            <div className="card shadow-lg modal-card">

                {/* Header */}
                <div className="modal-header-custom">
                    <h5 className="mb-0">Factura #{sale.id}</h5>
                </div>

                {/* Body */}
                <div className="p-4">

                    <p>
                        <strong>Cliente:</strong> {sale.cliente}
                    </p>

                    <hr />

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>P. Unitario</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.productos.map((producto, index) => (
                                <tr key={index}>
                                    <td>{producto.productId}</td>
                                    <td>{producto.cantidad}</td>
                                    <td>${producto.unitPrice.toLocaleString()}</td>
                                    <td>
                                        ${calculateProductTotal(producto).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <hr />

                    <h5 className="text-end total-general">
                        Total General: ${sale.total.toLocaleString()}
                    </h5>

                    <div className="text-end mt-3">
                        <button
                            className="btn btn-close-modal"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default SaleDetailsModal;