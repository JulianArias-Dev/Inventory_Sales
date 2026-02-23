import { useEffect, useState } from "react";
import { getVentas } from "../services/salesService";
import SalesTable from "../components/SalesTable";
import SaleFormModal from "../components/SaleFormModal";
import SalesDetailsModal from "../components/SaleDetailsModal";

const Sales = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedVentaId, setSelectedVentaId] = useState(null);

    const loadVentas = async () => {
        try {
            const data = await getVentas();
            setVentas(data);
        } catch (error) {
            console.error("Error cargando ventas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVentas();
    }, []);

    const handleVentaRegistrada = () => {
        setShowFormModal(false);
        loadVentas(); // refresca tabla
    };

    return (
        <div>
            <h2>Ventas</h2>

            <button onClick={() => setShowFormModal(true)}>
                Registrar Venta
            </button>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <SalesTable
                    ventas={ventas}
                    onViewDetails={(id) => setSelectedVentaId(id)}
                />
            )}

            {showFormModal && (
                <SaleFormModal
                    onClose={() => setShowFormModal(false)}
                    onSuccess={handleVentaRegistrada}
                />
            )}

            {selectedVentaId && (
                <SalesDetailsModal
                    ventaId={selectedVentaId}
                    onClose={() => setSelectedVentaId(null)}
                />
            )}
        </div>
    );
};

export default Sales;