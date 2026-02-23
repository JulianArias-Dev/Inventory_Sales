import api from './api';

const dashboardService = {
    // Obtener resumen general
    getResumen: async () => {
        const response = await api.get('/estadisticas/resumen');
        return response.data;
    },

    // Obtener ventas por día
    getVentasPorDia: async () => {
        const response = await api.get('/estadisticas/ventas-por-dia');
        return response.data;
    },

    // Obtener productos más vendidos
    getProductosMasVendidos: async (top = 10) => {
        const response = await api.get(`/estadisticas/productos-mas-vendidos?top=${top}`);
        return response.data;
    },

    // Obtener ventas por categoría
    getVentasPorCategoria: async () => {
        const response = await api.get('/estadisticas/ventas-por-categoria');
        return response.data;
    },

    // Obtener todos los datos del dashboard de una vez
    getDashboardData: async () => {
        const [resumen, ventasPorDia, productosMasVendidos, ventasPorCategoria] = await Promise.all([
            dashboardService.getResumen(),
            dashboardService.getVentasPorDia(),
            dashboardService.getProductosMasVendidos(),
            dashboardService.getVentasPorCategoria()
        ]);

        return {
            resumen,
            ventasPorDia,
            productosMasVendidos,
            ventasPorCategoria
        };
    }
};

export default dashboardService;