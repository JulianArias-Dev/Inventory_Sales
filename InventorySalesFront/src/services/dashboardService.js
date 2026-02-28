const API_URL = 'http://localhost:5000/api';

const dashboardService = {
    // Obtener resumen para las cards (KPI)
    getSummary: async () => {
        try {
            const response = await fetch(`${API_URL}/Reporte/summary`);
            if (!response.ok) throw new Error('Error al cargar el resumen');
            return await response.json();
        } catch (error) {
            console.error('Error en getSummary:', error);
            throw error;
        }
    },

    // Obtener ventas por día para el gráfico de línea
    getVentasPorDia: async () => {
        try {
            const response = await fetch(`${API_URL}/Reporte/ventas-por-dia`);
            if (!response.ok) throw new Error('Error al cargar ventas por día');
            return await response.json();
        } catch (error) {
            console.error('Error en getVentasPorDia:', error);
            throw error;
        }
    },

    // Obtener productos top
    getProductosTop: async (top = 5) => {
        try {
            const response = await fetch(`${API_URL}/Reporte/productos-top/${top}`);
            if (!response.ok) throw new Error('Error al cargar productos top');
            return await response.json();
        } catch (error) {
            console.error('Error en getProductosTop:', error);
            throw error;
        }
    },

    // Obtener ventas por categoría
    getVentasPorCategoria: async () => {
        try {
            const response = await fetch(`${API_URL}/Reporte/ventas-por-categoria`);
            if (!response.ok) throw new Error('Error al cargar ventas por categoría');
            return await response.json();
        } catch (error) {
            console.error('Error en getVentasPorCategoria:', error);
            throw error;
        }
    },

    // Método unificado para obtener todos los datos del dashboard
    getDashboardData: async () => {
        try {
            console.log('Cargando datos del dashboard...');

            // Hacer todas las peticiones en paralelo para mejor performance
            const [summary, ventasPorDia, productosTop, ventasPorCategoria] = await Promise.all([
                dashboardService.getSummary(),
                dashboardService.getVentasPorDia(),
                dashboardService.getProductosTop(5),
                dashboardService.getVentasPorCategoria()
            ]);

            console.log('Datos recibidos:', { summary, ventasPorDia, productosTop, ventasPorCategoria });

            // Transformar los datos al formato que espera el Dashboard
            return {
                resumen: {
                    totalVentas: summary?.totalVentas || 0,
                    totalIngresos: summary?.totalIngresos || 0,
                    productoMasVendido: {
                        nombre: summary?.productoMasVendido?.nombre || 'N/A',
                        cantidad: summary?.productoMasVendido?.cantidad || 0
                    },
                    categoriaMasVendida: {
                        nombre: summary?.categoriaMasVendida?.nombre || 'N/A',
                        cantidad: summary?.categoriaMasVendida?.cantidad || 0
                    }
                },
                ventasPorDia: ventasPorDia.map(item => ({
                    fecha: item.fecha || item.date,
                    cantidad: item.cantidad || item.quantity || 0
                })),
                productosMasVendidos: productosTop.map(item => ({
                    nombre: item.nombre || item.name || item.productoNombre,
                    cantidad: item.cantidad || item.quantity || 0
                })),
                ventasPorCategoria: ventasPorCategoria.map(item => ({
                    categoria: item.categoria || item.category || item.nombre,
                    cantidad: item.cantidad || item.quantity || 0
                }))
            };
        } catch (error) {
            console.error('Error en getDashboardData:', error);
            throw error;
        }
    },

    // Versión con manejo de errores individual (si una falla, las otras igual se muestran)
    getDashboardDataFlexible: async () => {
        try {
            console.log('Cargando datos del dashboard (modo flexible)...');

            const results = await Promise.allSettled([
                dashboardService.getSummary().catch(err => ({ error: err.message })),
                dashboardService.getVentasPorDia().catch(err => ({ error: err.message })),
                dashboardService.getProductosTop(5).catch(err => ({ error: err.message })),
                dashboardService.getVentasPorCategoria().catch(err => ({ error: err.message }))
            ]);

            const [summaryResult, ventasPorDiaResult, productosTopResult, ventasPorCategoriaResult] = results;

            // Valores por defecto
            const defaultSummary = {
                totalVentas: 0,
                totalIngresos: 0,
                productoMasVendido: { nombre: 'N/A', cantidad: 0 },
                categoriaMasVendida: { nombre: 'N/A', cantidad: 0 }
            };

            return {
                resumen: summaryResult.status === 'fulfilled' ? {
                    totalVentas: summaryResult.value?.totalVentas || 0,
                    totalIngresos: summaryResult.value?.totalIngresos || 0,
                    productoMasVendido: {
                        nombre: summaryResult.value?.productoMasVendido?.nombre || 'N/A',
                        cantidad: summaryResult.value?.productoMasVendido?.cantidad || 0
                    },
                    categoriaMasVendida: {
                        nombre: summaryResult.value?.categoriaMasVendida?.nombre || 'N/A',
                        cantidad: summaryResult.value?.categoriaMasVendida?.cantidad || 0
                    }
                } : defaultSummary,
                ventasPorDia: ventasPorDiaResult.status === 'fulfilled'
                    ? ventasPorDiaResult.value.map(item => ({
                        fecha: item.fecha || item.date,
                        cantidad: item.cantidad || item.quantity || 0
                    }))
                    : [],
                productosMasVendidos: productosTopResult.status === 'fulfilled'
                    ? productosTopResult.value.map(item => ({
                        nombre: item.nombre || item.name || item.productoNombre,
                        cantidad: item.cantidad || item.quantity || 0
                    }))
                    : [],
                ventasPorCategoria: ventasPorCategoriaResult.status === 'fulfilled'
                    ? ventasPorCategoriaResult.value.map(item => ({
                        categoria: item.categoria || item.category || item.nombre,
                        cantidad: item.cantidad || item.quantity || 0
                    }))
                    : []
            };
        } catch (error) {
            console.error('Error en getDashboardDataFlexible:', error);
            throw error;
        }
    }
};

export default dashboardService;