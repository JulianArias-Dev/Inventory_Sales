// Datos estáticos de prueba
const categorias = [
  { _id: '1', nombre: 'Electrónica' },
  { _id: '2', nombre: 'Ropa' },
  { _id: '3', nombre: 'Hogar' },
  { _id: '4', nombre: 'Deportes' }
];

const productos = [
  {
    _id: '1',
    nombre: 'Smart TV 55"',
    precio: 599.99,
    stock: 15,
    categoria: { _id: '1', nombre: 'Electrónica' }
  },
  {
    _id: '2',
    nombre: 'Camisa Polo',
    precio: 29.99,
    stock: 50,
    categoria: { _id: '2', nombre: 'Ropa' }
  },
  {
    _id: '3',
    nombre: 'Juego de Sábanas',
    precio: 45.50,
    stock: 30,
    categoria: { _id: '3', nombre: 'Hogar' }
  },
  {
    _id: '4',
    nombre: 'Laptop Gaming',
    precio: 1299.99,
    stock: 8,
    categoria: { _id: '1', nombre: 'Electrónica' }
  },
  {
    _id: '5',
    nombre: 'Balón de Fútbol',
    precio: 25.99,
    stock: 20,
    categoria: { _id: '4', nombre: 'Deportes' }
  }
];

// Simular operaciones asíncronas
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productoService = {
  // Obtener todos los productos
  async getAll() {
    await delay(500);
    return [...productos];
  },

  // Obtener producto por ID
  async getById(id) {
    await delay(300);
    const producto = productos.find(p => p._id === id);
    if (!producto) throw new Error('Producto no encontrado');
    return { ...producto };
  },

  // Crear nuevo producto
  async create(productoData) {
    await delay(500);
    const nuevoProducto = {
      _id: String(Date.now()),
      ...productoData,
      categoria: categorias.find(c => c._id === productoData.categoriaId) || productoData.categoria
    };
    productos.push(nuevoProducto);
    return { ...nuevoProducto };
  },

  // Actualizar producto
  async update(id, productoData) {
    await delay(500);
    const index = productos.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    
    productos[index] = {
      ...productos[index],
      ...productoData,
      categoria: productoData.categoriaId 
        ? categorias.find(c => c._id === productoData.categoriaId)
        : productoData.categoria || productos[index].categoria
    };
    return { ...productos[index] };
  },

  // Modificar stock (aumentar o disminuir)
  async modificarStock(id, cantidad, operacion = 'aumentar') {
    await delay(300);
    const index = productos.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    
    if (operacion === 'aumentar') {
      productos[index].stock += cantidad;
    } else {
      if (productos[index].stock - cantidad < 0) {
        throw new Error('Stock insuficiente');
      }
      productos[index].stock -= cantidad;
    }
    
    return { ...productos[index] };
  },

  // Eliminar producto
  async delete(id) {
    await delay(500);
    // Simular que no se puede eliminar si tiene ventas
    // Por ahora, solo permitimos eliminar productos sin ventas (IDs 3 y 5 como ejemplo)
    if (id === '1' || id === '2' || id === '4') {
      throw new Error('No se puede eliminar el producto porque tiene ventas asociadas');
    }
    
    const index = productos.findIndex(p => p._id === id);
    if (index === -1) throw new Error('Producto no encontrado');
    
    productos.splice(index, 1);
    return { success: true };
  },

  // Obtener categorías para el selector
  getCategorias() {
    return [...categorias];
  }
};