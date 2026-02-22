import SaleForm from "./SaleForm";

function SaleFormModal({ show, onClose, onSubmit }) {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div
                className="card shadow-lg modal-card"
                style={{ width: "800px" }}
            >
                <div className="modal-header-custom d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Registrar Venta</h5>

                    <button
                        className="btn btn-close-modal"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>

                <div className="p-4">
                    <SaleForm onSubmit={onSubmit} />
                </div>
            </div>
        </div>
    );
}

export default SaleFormModal;