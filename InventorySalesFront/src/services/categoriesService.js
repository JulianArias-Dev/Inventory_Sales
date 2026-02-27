const API_URL = 'http://localhost:5232/api'; // Ajusta el puerto según tu backend

export const categoriaService = {
  // Obtener todas las categorías
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/Categoria`);
      if (!response.ok) throw new Error('Error al cargar las categorías');
      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/Categoria/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Categoría no encontrada');
        throw new Error('Error al cargar la categoría');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  },

  // Crear nueva categoría
  async create(categoriaData) {
    try {
      const response = await fetch(`${API_URL}/Categoria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: categoriaData.nombre })
      });

      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.message || 'Error al crear la categoría');
        }
        throw new Error('Error al crear la categoría');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  // Actualizar categoría
  async update(id, categoriaData) {
    try {
      const response = await fetch(`${API_URL}/Categoria/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: parseInt(id),
          nombre: categoriaData.nombre
        })
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Categoría no encontrada');
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.message || 'Error al actualizar la categoría');
        }
        throw new Error('Error al actualizar la categoría');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Eliminar categoría
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/Categoria/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Categoría no encontrada');
        if (response.status === 400) {
          // El backend probablemente devuelve un mensaje cuando tiene productos asociados
          const error = await response.text();
          throw new Error(error || 'No se puede eliminar la categoría porque tiene productos asociados');
        }
        throw new Error('Error al eliminar la categoría');
      }

      return { success: true };
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Verificar si una categoría tiene productos (si el backend tiene este endpoint)
  async tieneProductos(id) {
    try {
      // Si el backend tiene un endpoint para verificar productos
      const response = await fetch(`${API_URL}/Categoria/${id}/tiene-productos`);
      if (!response.ok) return false;
      return await response.json();
    } catch (error) {
      console.error('Error verificando productos:', error);
      return false;
    }
  }
};