const API_URL = 'http://localhost:5000/api'; // Ajusta el puerto según tu backend

export const productoService = {
  // Obtener todos los productos
  async getAll() {
    try {
      const response = await fetch(`${API_URL}/Producto`);
      if (!response.ok) throw new Error('Error al cargar los productos');
      const productos = await response.json();
      
      // Necesitamos obtener las categorías para tener los nombres completos
      const categorias = await this.getCategorias();
      
      // Enriquecer los productos con la información completa de categoría
      return productos.map(producto => ({
        ...producto,
        categoria: categorias.find(c => c.id === producto.categoria) || { id: producto.categoria, nombre: 'Sin categoría' }
      }));
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
      const producto = await response.json();
      
      // Obtener la categoría para tener el nombre completo
      const categorias = await this.getCategorias();
      const categoriaCompleta = categorias.find(c => c.id === producto.categoria) || { id: producto.categoria, nombre: 'Sin categoría' };
      
      return {
        ...producto,
        categoria: categoriaCompleta
      };
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
          name: productoData.nombre,
          price: parseFloat(productoData.precio),
          stock: parseInt(productoData.stock),
          categoriaId: parseInt(productoData.categoriaId)
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
      
      // Obtener la categoría para tener el nombre completo
      const categorias = await this.getCategorias();
      const categoriaCompleta = categorias.find(c => c.id === nuevoProducto.categoria) || { id: nuevoProducto.categoria, nombre: 'Sin categoría' };
      
      return {
        ...nuevoProducto,
        categoria: categoriaCompleta
      };
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
          name: productoData.nombre,
          price: parseFloat(productoData.precio),
          stock: parseInt(productoData.stock),
          categoriaId: parseInt(productoData.categoriaId)
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
      
      // Obtener la categoría para tener el nombre completo
      const categorias = await this.getCategorias();
      const categoriaCompleta = categorias.find(c => c.id === productoActualizado.categoria) || { id: productoActualizado.categoria, nombre: 'Sin categoría' };
      
      return {
        ...productoActualizado,
        categoria: categoriaCompleta
      };
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  },

  // Modificar stock (aumentar o disminuir)
  async modificarStock(id, cantidad, operacion = 'aumentar') {
    try {
      // Primero obtenemos el producto actual
      const producto = await this.getById(id);
      
      // Calculamos el nuevo stock
      let nuevoStock;
      if (operacion === 'aumentar') {
        nuevoStock = producto.stock + cantidad;
      } else {
        if (producto.stock - cantidad < 0) {
          throw new Error('Stock insuficiente');
        }
        nuevoStock = producto.stock - cantidad;
      }

      // Actualizamos el producto con el nuevo stock usando el endpoint PUT
      const response = await fetch(`${API_URL}/Producto/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: producto.name,
          price: producto.price,
          stock: nuevoStock,
          categoriaId: producto.categoria.id || producto.categoria
        })
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error('Producto no encontrado');
        throw new Error('Error al modificar el stock');
      }

      const productoActualizado = await response.json();
      
      // Obtener la categoría para tener el nombre completo
      const categorias = await this.getCategorias();
      const categoriaCompleta = categorias.find(c => c.id === productoActualizado.categoria) || { id: productoActualizado.categoria, nombre: 'Sin categoría' };
      
      return {
        ...productoActualizado,
        categoria: categoriaCompleta
      };
    } catch (error) {
      console.error('Error en modificarStock:', error);
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
          // El servicio tiene validación de ventas asociadas en HasRelation
          throw new Error('No se puede eliminar el producto porque tiene ventas asociadas');
        }
        throw new Error('Error al eliminar el producto');
      }

      return { success: true };
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  },

  // Obtener categorías para el selector
  async getCategorias() {
    try {
      const response = await fetch(`${API_URL}/Categoria`);
      if (!response.ok) throw new Error('Error al cargar las categorías');
      return await response.json();
    } catch (error) {
      console.error('Error en getCategorias:', error);
      // Retornar un array vacío en caso de error para no romper la UI
      return [];
    }
  }
};