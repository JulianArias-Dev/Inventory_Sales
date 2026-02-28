const API_URL = 'http://localhost:5000/api'; // Mismo puerto que categorías

export const productService = {
  // Obtener todos los productos
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/Producto`);
      if (!response.ok) throw new Error('Error al cargar los productos');
      const data = await response.json();
      console.log('Productos desde backend:', data); // Para depurar
      return data;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/Producto/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Producto no encontrado');
        throw new Error('Error al cargar el producto');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear nuevo producto
  async create(productoData) {
    try {
      const response = await fetch(`${API_URL}/Producto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productoData.name,        // El backend espera 'name'
          price: parseFloat(productoData.price),
          stock: parseInt(productoData.stock),
          categoriaId: parseInt(productoData.categoria)  // El backend espera 'categoriaId'
        })
      });

      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.message || 'Error al crear el producto');
        }
        if (response.status === 409) {
          const error = await response.json();
          throw new Error(error.message || 'Ya existe un producto con ese nombre');
        }
        throw new Error('Error al crear el producto');
      }

      const nuevoProducto = await response.json();
      console.log('Producto creado:', nuevoProducto);
      return nuevoProducto;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar producto
  async update(id, productoData) {
    try {
      const response = await fetch(`${API_URL}/Producto/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productoData.name,
          price: parseFloat(productoData.price),
          stock: parseInt(productoData.stock),
          categoriaId: parseInt(productoData.categoria)
        })
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Producto no encontrado');
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.message || 'Error al actualizar el producto');
        }
        throw new Error('Error al actualizar el producto');
      }

      const productoActualizado = await response.json();
      console.log('Producto actualizado:', productoActualizado);
      return productoActualizado;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar producto
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/Producto/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Producto no encontrado');
        if (response.status === 400) {
          const error = await response.text();
          throw new Error(error || 'No se puede eliminar el producto porque tiene ventas asociadas');
        }
        throw new Error('Error al eliminar el producto');
      }

      return { success: true };
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
};