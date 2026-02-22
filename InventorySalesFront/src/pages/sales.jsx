import { useState } from "react";
import SalesTable from "../components/SalesTable";
import SaleDetailsModal from "../Components/SaleDetailsModal";

const mockSales = [
    {
        id: "F001",
        cliente: "Juan Pérez",
        total: 150000,
        productos: [
            { productId: "P01", cantidad: 2, unitPrice: 30000 },
            { productId: "P02", cantidad: 3, unitPrice: 30000 }
        ]
    },
    {
        id: "F002",
        cliente: "María Gómez",
        total: 80000,
        productos: [
            { productId: "P03", cantidad: 1, unitPrice: 80000 }
        ]
    }
];

function Sales() {
    const [selectedSale, setSelectedSale] = useState(null);

    return (
        <div className="p-4" style={{ backgroundColor: "#F3F4F6", minHeight: "100vh" }}>
            <h2 className="mb-4">Ventas</h2>

            <SalesTable sales={mockSales} onView={setSelectedSale} />

            {selectedSale && (
                <SaleDetailsModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                />
            )}
        </div>
    );
}

export default Sales;