import api from "./api";

const salesService = {
    getVentas: async () => {
        const response = await api.get("/ventas");
        return response.data;
    },
    getVentaById: async (id) => {
        const response = await api.get(`/ventas/${id}`);
        return response.data;
    },
    createVenta: async (ventaData) => {
        const response = await api.post("/ventas", ventaData);
        return response.data;
    }
};

export default salesService;