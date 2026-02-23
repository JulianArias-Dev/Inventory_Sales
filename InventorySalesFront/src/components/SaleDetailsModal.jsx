import { useEffect, useState } from "react";
import { getVentaById } from "../services/ventasService";

const SalesDetailsModal = ({ ventaId, onClose }) => {
    const [venta, setVenta] = useState(null);

    useEffect(() => {
        const loadVenta = async () => {
            try {
                const data = await getVentaById(ventaId);
                setVenta(data);
            } catch (error) {
                console.error(error);
            }
        };

        loadVenta();
    }, [ventaId]);

    if (!venta) return <div>Cargando...</div>;

    return (
        <div className="modal">
            <h3>Factura #{venta.id}</h3>
            <p>Cliente: {venta.customerName}</p>
            <p>Fecha: {new Date(venta.date).toLocaleString()}</p>

            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {venta.productos.map((p, index) => (
                        <tr key={index}>
                            <td>{p.productoNombre}</td>
                            <td>{p.cantidad}</td>
                            <td>${p.precioUnitario}</td>
                            <td>${p.cantidad * p.precioUnitario}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4>Total: ${venta.totalAmount}</h4>

            <button onClick={onClose}>Cerrar</button>
        </div>
    );
};

export default SalesDetailsModal;