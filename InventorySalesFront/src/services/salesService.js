const API_URL = 'http://localhost:5000/api';

const salesService = {
    // Obtener todas las ventas
    getVentas: async () => {
        try {
            const response = await fetch(`${API_URL}/Ventas`);
            if (!response.ok) throw new Error('Error al cargar las ventas');
            return await response.json();
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
            // IMPORTANTE: El DTO espera ProductoId con P mayúscula
            const dataToSend = {
                customerName: ventaData.customerName,
                productos: ventaData.productos.map(p => ({
                    ProductoId: Number(p.productoId), // Con P mayúscula!
                    Cantidad: Number(p.cantidad) // Con C mayúscula!
                }))
            };

            console.log('Enviando al backend:', JSON.stringify(dataToSend, null, 2));

            const response = await fetch(`${API_URL}/Ventas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            const responseText = await response.text();
            console.log('Respuesta del servidor:', responseText);

            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = { message: responseText };
            }

            if (!response.ok) {
                console.error('Error del servidor:', response.status, responseData);
                throw new Error(responseData.message || `Error ${response.status}: ${responseText}`);
            }

            return responseData;
        } catch (error) {
            console.error('Error en createVenta:', error);
            throw error;
        }
    }
};

export default salesService;