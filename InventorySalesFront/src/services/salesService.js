const API_URL = 'http://localhost:5000/api';

const salesService = {
    // Obtener todas las ventas
    getVentas: async () => {
        try {
            const response = await fetch(`${API_URL}/Ventas`);
            if (!response.ok) throw new Error('Error al cargar las ventas');
            const data = await response.json();
            console.log('Ventas desde backend:', data);
            return data;
        } catch (error) {
            console.error('Error en getVentas:', error);
            throw error;
        }
    },

    // Obtener venta por ID
    getVentaById: async (id) => {
        try {
            const response = await fetch(`${API_URL}/Ventas/${id}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('Venta no encontrada');
                throw new Error('Error al cargar la venta');
            }
            return await response.json();
        } catch (error) {
            console.error('Error en getVentaById:', error);
            throw error;
        }
    },

    // Crear nueva venta
    createVenta: async (ventaData) => {
        try {
            const response = await fetch(`${API_URL}/Ventas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Mapear los campos según el DTO CreateVentaDto del backend
                    clienteId: parseInt(ventaData.clienteId),
                    productoId: parseInt(ventaData.productoId),
                    cantidad: parseInt(ventaData.cantidad),
                    precioUnitario: parseFloat(ventaData.precioUnitario),
                    fecha: ventaData.fecha || new Date().toISOString(),
                    // Agregar otros campos según el DTO
                })
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const error = await response.json();
                    throw new Error(error.message || 'Error al crear la venta');
                }
                if (response.status === 409) {
                    const error = await response.json();
                    throw new Error(error.message || 'Conflicto al crear la venta');
                }
                throw new Error('Error al crear la venta');
            }

            const nuevaVenta = await response.json();
            console.log('Venta creada:', nuevaVenta);
            return nuevaVenta;
        } catch (error) {
            console.error('Error en createVenta:', error);
            throw error;
        }
    }
};

export default salesService;