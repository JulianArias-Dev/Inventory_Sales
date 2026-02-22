import { useState } from "react";

function SaleForm({ onSubmit }) {
    const [invoiceId, setInvoiceId] = useState("");
    const [cliente, setCliente] = useState("");
    const [productos, setProductos] = useState([]);

    const [currentProduct, setCurrentProduct] = useState({
        productId: "",
        cantidad: 1,
        unitPrice: 0
    });

    const total = productos.reduce(
        (acc, p) => acc + p.cantidad * p.unitPrice,
        0
    );

    const handleAddProduct = () => {
        if (!currentProduct.productId) return;

        setProductos([...productos, currentProduct]);

        setCurrentProduct({
            productId: "",
            cantidad: 1,
            unitPrice: 0
        });
    };

    const handleRemoveProduct = (index) => {
        const updated = productos.filter((_, i) => i !== index);
        setProductos(updated);
    };

    const handleSubmit = () => {
        if (!invoiceId || !cliente || productos.length === 0) return;

        const nuevaVenta = {
            id: invoiceId,
            cliente,
            total,
            productos
        };

        onSubmit(nuevaVenta);
    };

    const handleCancel = () => {
        setInvoiceId("");
        setCliente("");
        setProductos([]);
        setCurrentProduct({
            productId: "",
            cantidad: 1,
            unitPrice: 0
        });
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-body">

                <h5 className="mb-4">Registrar Venta</h5>

                {/* ID y Cliente */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">ID Factura</label>
                        <input
                            type="text"
                            className="form-control"
                            value={invoiceId}
                            onChange={(e) => setInvoiceId(e.target.value)}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Cliente</label>
                        <input
                            type="text"
                            className="form-control"
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                        />
                    </div>
                </div>

                <hr />

                {/* Agregar producto */}
                <div className="row align-items-end mb-3">
                    <div className="col-md-4">
                        <label className="form-label">Producto</label>
                        <input
                            type="text"
                            className="form-control"
                            value={currentProduct.productId}
                            onChange={(e) =>
                                setCurrentProduct({
                                    ...currentProduct,
                                    productId: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Cantidad</label>
                        <input
                            type="number"
                            className="form-control"
                            value={currentProduct.cantidad}
                            onChange={(e) =>
                                setCurrentProduct({
                                    ...currentProduct,
                                    cantidad: Number(e.target.value)
                                })
                            }
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Precio Unitario</label>
                        <input
                            type="number"
                            className="form-control"
                            value={currentProduct.unitPrice}
                            onChange={(e) =>
                                setCurrentProduct({
                                    ...currentProduct,
                                    unitPrice: Number(e.target.value)
                                })
                            }
                        />
                    </div>

                    <div className="col-md-2">
                        <button
                            className="btn btn-success w-100"
                            onClick={handleAddProduct}
                        >
                            Agregar
                        </button>
                    </div>
                </div>

                {/* Tabla productos agregados */}
                {productos.length > 0 && (
                    <>
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>P. Unit</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((p, index) => (
                                    <tr key={index}>
                                        <td>{p.productId}</td>
                                        <td>{p.cantidad}</td>
                                        <td>${p.unitPrice.toLocaleString()}</td>
                                        <td>${(p.cantidad * p.unitPrice).toLocaleString()}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleRemoveProduct(index)}
                                            >
                                                X
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="text-end mb-3">
                            <h6>Total General: ${total.toLocaleString()}</h6>
                        </div>
                    </>
                )}

                {/* Botones finales */}
                <div className="text-end">
                    <button
                        className="btn btn-primary me-2"
                        onClick={handleSubmit}
                    >
                        Registrar
                    </button>

                    <button
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    );
}

export default SaleForm;