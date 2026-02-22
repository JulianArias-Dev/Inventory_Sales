// Datos estáticos de prueba
const categorias = [
  { _id: '1', nombre: 'Electrónica' },
  { _id: '2', nombre: 'Ropa' },
  { _id: '3', nombre: 'Hogar' },
  { _id: '4', nombre: 'Deportes' }
];

// Simulamos productos asociados a categorías
const productosPorCategoria = {
  '1': ['Smart TV 55"', 'Laptop Gaming'], // Electrónica tiene productos
  '2': ['Camisa Polo'], // Ropa tiene productos
  '3': [], // Hogar no tiene productos
  '4': [] // Deportes no tiene productos
};

// Simular operaciones asíncronas
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoriaService = {
  // Obtener todas las categorías
  async getAll() {
    await delay(500);
    return [...categorias];
  },

  // Obtener categoría por ID
  async getById(id) {
    await delay(300);
    const categoria = categorias.find(c => c._id === id);
    if (!categoria) throw new Error('Categoría no encontrada');
    return { ...categoria };
  },

  // Verificar si una categoría tiene productos
  async tieneProductos(id) {
    await delay(200);
    return productosPorCategoria[id] && productosPorCategoria[id].length > 0;
  },

  // Crear nueva categoría
  async create(categoriaData) {
    await delay(500);
    
    // Validar que el nombre sea único
    const nombreExistente = categorias.find(
      c => c.nombre.toLowerCase() === categoriaData.nombre.toLowerCase()
    );
    
    if (nombreExistente) {
      throw new Error('Ya existe una categoría con ese nombre');
    }

    const nuevaCategoria = {
      _id: String(Date.now()),
      nombre: categoriaData.nombre
    };
    
    categorias.push(nuevaCategoria);
    // Inicializar su lista de productos como vacía
    productosPorCategoria[nuevaCategoria._id] = [];
    
    return { ...nuevaCategoria };
  },

  // Actualizar categoría
  async update(id, categoriaData) {
    await delay(500);
    
    const index = categorias.findIndex(c => c._id === id);
    if (index === -1) throw new Error('Categoría no encontrada');

    // Validar que el nuevo nombre sea único (excepto para la misma categoría)
    const nombreExistente = categorias.find(
      c => c._id !== id && c.nombre.toLowerCase() === categoriaData.nombre.toLowerCase()
    );
    
    if (nombreExistente) {
      throw new Error('Ya existe otra categoría con ese nombre');
    }

    categorias[index] = {
      ...categorias[index],
      nombre: categoriaData.nombre
    };

    return { ...categorias[index] };
  },

  // Eliminar categoría
  async delete(id) {
    await delay(500);
    
    // Verificar si la categoría tiene productos asociados
    if (productosPorCategoria[id] && productosPorCategoria[id].length > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
    }

    const index = categorias.findIndex(c => c._id === id);
    if (index === -1) throw new Error('Categoría no encontrada');
    
    categorias.splice(index, 1);
    delete productosPorCategoria[id];
    
    return { success: true };
  }
};