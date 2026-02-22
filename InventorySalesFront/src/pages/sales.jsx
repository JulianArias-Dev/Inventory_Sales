import { useState } from "react";
import SalesTable from "./Components/SalesTable";
import SaleDetailsModal from "./Components/SaleDetailsModal";

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

export default Sales;