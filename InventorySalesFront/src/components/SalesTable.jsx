function SalesTable({ sales, onView }) {
    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <table className="table table-hover align-middle mb-0">
                    <thead style={{ backgroundColor: "#1F2937", color: "white" }}>
                        <tr>
                            <th>ID Factura</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map((sale) => (
                            <tr key={sale.id}>
                                <td>{sale.id}</td>
                                <td>{sale.cliente}</td>
                                <td>${sale.total.toLocaleString()}</td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm"
                                        style={{ backgroundColor: "#2563EB", color: "white" }}
                                        onClick={() => onView(sale)}
                                    >
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SalesTable;