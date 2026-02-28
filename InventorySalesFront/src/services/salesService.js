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
            console.log('Obteniendo venta ID:', id);
            const response = await fetch(`${API_URL}/Ventas/${id}`);

            const responseText = await response.text();
            console.log('Respuesta del servidor:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                data = { message: responseText };
            }

            if (!response.ok) {
                console.error('Error del servidor:', response.status, data);
                throw new Error(data.message || `Error ${response.status}: ${responseText}`);
            }

            return data;
        } catch (error) {
            console.error('Error en getVentaById:', error);
            throw error;
        }
    },

    // Crear nueva venta
    createVenta: async (ventaData) => {
        try {
            const dataToSend = {
                customerName: ventaData.customerName,
                productos: ventaData.productos.map(p => ({
                    ProductoId: Number(p.productoId),
                    Cantidad: Number(p.cantidad)
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