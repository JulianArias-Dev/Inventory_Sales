const SalesTable = ({ ventas, onViewDetails }) => {
    return (
        <table border="1" width="100%">
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
                        <td>{venta.id}</td>
                        <td>{new Date(venta.date).toLocaleDateString()}</td>
                        <td>{venta.customerName}</td>
                        <td>${venta.totalAmount}</td>
                        <td>
                            <button onClick={() => onViewDetails(venta.id)}>
                                Detalle
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SalesTable;