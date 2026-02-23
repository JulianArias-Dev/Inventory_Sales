import React, { useState, useEffect } from 'react';
import productService from '../services/productService';
import '../styles/products.css';

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('crear'); // 'crear', 'editar', 'stock'
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    categoria: ''
  });
  const [stockOperation, setStockOperation] = useState('aumentar');
  const [stockCantidad, setStockCantidad] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar categorías predefinidas
  useEffect(() => {
    const categoriasPredefinidas = [
      { _id: '1', nombre: 'Electrónica' },
      { _id: '2', nombre: 'Ropa' },
      { _id: '3', nombre: 'Hogar' },
      { _id: '4', nombre: 'Deportes' }
    ];
    setCategorias(categoriasPredefinidas);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      // Transformar los datos para mantener compatibilidad con el formato anterior
      const productosTransformados = data.map(producto => ({
        _id: producto.id,
        nombre: producto.name,
        precio: producto.price,
        stock: producto.stock,
        categoria: {
          _id: producto.categoria,
          nombre: getNombreCategoria(producto.categoria)
        }
      }));
      setProductos(productosTransformados);
    } catch (error) {
      setError('Error al cargar los productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getNombreCategoria = (categoriaId) => {
    const categoriasMap = {
      '1': 'Electrónica',
      '2': 'Ropa',
      '3': 'Hogar',
      '4': 'Deportes'
    };
    return categoriasMap[categoriaId] || 'Sin categoría';
  };

  const handleShowModal = (type, producto = null) => {
    setModalType(type);
    setSelectedProducto(producto);
    setError('');

    if (type === 'crear') {
      setFormData({
        name: '',
        price: '',
        stock: '',
        categoria: ''
      });
    } else if (type === 'editar' && producto) {
      setFormData({
        name: producto.nombre,
        price: producto.precio,
        stock: producto.stock,
        categoria: producto.categoria._id
      });
    } else if (type === 'stock' && producto) {
      setSelectedProducto(producto);
      setStockOperation('aumentar');
      setStockCantidad(1);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProducto(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (modalType === 'crear') {
        const nuevoProducto = await productService.create(formData);
        // Transformar respuesta
        const productoTransformado = {
          _id: nuevoProducto.id,
          nombre: nuevoProducto.name,
          precio: nuevoProducto.price,
          stock: nuevoProducto.stock,
          categoria: {
            _id: nuevoProducto.categoria,
            nombre: getNombreCategoria(nuevoProducto.categoria)
          }
        };
        setProductos([...productos, productoTransformado]);
        setSuccess('Producto creado exitosamente');
      } else if (modalType === 'editar' && selectedProducto) {
        const productoActualizado = await productService.update(selectedProducto._id, formData);
        // Transformar respuesta
        const productoTransformado = {
          _id: productoActualizado.id,
          nombre: productoActualizado.name,
          precio: productoActualizado.price,
          stock: productoActualizado.stock,
          categoria: {
            _id: productoActualizado.categoria,
            nombre: getNombreCategoria(productoActualizado.categoria)
          }
        };
        setProductos(productos.map(p => p._id === selectedProducto._id ? productoTransformado : p));
        setSuccess('Producto actualizado exitosamente');
      }

      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Error al guardar el producto');
    }
  };

  const handleModificarStock = async () => {
    if (!selectedProducto) return;

    try {
      const nuevoStock = stockOperation === 'aumentar'
        ? selectedProducto.stock + stockCantidad
        : Math.max(0, selectedProducto.stock - stockCantidad);

      const productoActualizado = await productService.update(selectedProducto._id, {
        name: selectedProducto.nombre,
        price: selectedProducto.precio,
        stock: nuevoStock,
        categoria: selectedProducto.categoria._id
      });

      const productoTransformado = {
        _id: productoActualizado.id,
        nombre: productoActualizado.name,
        precio: productoActualizado.price,
        stock: productoActualizado.stock,
        categoria: {
          _id: productoActualizado.categoria,
          nombre: getNombreCategoria(productoActualizado.categoria)
        }
      };

      setProductos(productos.map(p => p._id === selectedProducto._id ? productoTransformado : p));
      setSuccess(`Stock ${stockOperation === 'aumentar' ? 'aumentado' : 'disminuido'} exitosamente`);
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este producto?')) return;

    try {
      await productService.delete(id);
      setProductos(productos.filter(p => p._id !== id));
      setSuccess('Producto eliminado exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const filtrarProductos = () => {
    return productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="stock-badge agotado">Agotado</span>;
    if (stock < 10) return <span className="stock-badge low">Bajo stock</span>;
    return <span className="stock-badge available">Disponible</span>;
  };

  const getProductIcon = (categoria) => {
    const iconos = {
      'Electrónica': 'bi-tv',
      'Ropa': 'bi-hanger',
      'Hogar': 'bi-house-heart',
      'Deportes': 'bi-trophy'
    };
    return iconos[categoria.nombre] || 'bi-box';
  };

  const totalProductos = productos.length;
  const stockTotal = productos.reduce((acc, p) => acc + p.stock, 0);
  const productosBajoStock = productos.filter(p => p.stock < 10 && p.stock > 0).length;
  const productosAgotados = productos.filter(p => p.stock === 0).length;

  const productosFiltrados = filtrarProductos();

  // Modal para Crear/Editar Producto
  const renderProductoModal = () => {
    if (!showModal || modalType === 'stock') return null;

    return (
      <div className="modal fade show custom-modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseModal}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${modalType === 'crear' ? 'bi-plus-circle' : 'bi-pencil-square'} me-2`}></i>
                {modalType === 'crear' ? 'Nuevo Producto' : 'Editar Producto'}
              </h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <form onSubmit={handleSubmit} className="custom-form">
              <div className="modal-body">
                {error && (
                  <div className="custom-alert custom-alert-danger">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-tag me-2"></i>
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ej: Smart TV 55, Laptop Gaming..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-folder me-2"></i>
                    Categoría
                  </label>
                  <select
                    className="form-select"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Precio
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-box-seam me-2"></i>
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className={`bi ${modalType === 'crear' ? 'bi-save' : 'bi-check-lg'} me-2`}></i>
                  {modalType === 'crear' ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Modal para Modificar Stock
  const renderStockModal = () => {
    if (!showModal || modalType !== 'stock' || !selectedProducto) return null;

    return (
      <div className="modal fade show custom-modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseModal}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-arrow-up-down me-2"></i>
                Modificar Stock
              </h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="custom-alert custom-alert-danger">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {error}
                </div>
              )}

              <div className="product-info mb-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center gap-3">
                  <div className="product-icon">
                    <i className={`bi ${getProductIcon(selectedProducto.categoria)}`}></i>
                  </div>
                  <div>
                    <h6 className="mb-1">{selectedProducto.nombre}</h6>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-folder me-1"></i>
                      {selectedProducto.categoria.nombre}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <strong>Stock actual:</strong>
                  <span className="ms-2 badge bg-info">{selectedProducto.stock} unidades</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Operación</label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="stockOperation"
                      value="aumentar"
                      checked={stockOperation === 'aumentar'}
                      onChange={(e) => setStockOperation(e.target.value)}
                      id="aumentar"
                    />
                    <label className="form-check-label" htmlFor="aumentar">
                      <i className="bi bi-arrow-up-circle-fill text-success me-1"></i>
                      Aumentar
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="stockOperation"
                      value="disminuir"
                      checked={stockOperation === 'disminuir'}
                      onChange={(e) => setStockOperation(e.target.value)}
                      id="disminuir"
                    />
                    <label className="form-check-label" htmlFor="disminuir">
                      <i className="bi bi-arrow-down-circle-fill text-danger me-1"></i>
                      Disminuir
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={stockCantidad}
                  onChange={(e) => setStockCantidad(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                <i className="bi bi-x-lg me-2"></i>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleModificarStock}
                disabled={!stockCantidad || stockCantidad < 1}
              >
                <i className="bi bi-check-lg me-2"></i>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="products-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <i className="bi bi-box-seam"></i>
            Gestión de Productos
          </h2>
          <button className="btn btn-light" onClick={() => handleShowModal('crear')}>
            <i className="bi bi-plus-lg me-2"></i>
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="container-fluid px-4">
        {/* Stats Cards */}
        <div className="row stats-row">
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-boxes"></i>
              </div>
              <div className="stat-info">
                <h3>{totalProductos}</h3>
                <p>Total Productos</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-box"></i>
              </div>
              <div className="stat-info">
                <h3>{stockTotal}</h3>
                <p>Stock Total</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-exclamation-triangle"></i>
              </div>
              <div className="stat-info">
                <h3>{productosBajoStock}</h3>
                <p>Bajo Stock</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-x-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{productosAgotados}</h3>
                <p>Agotados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="search-box mb-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="custom-alert custom-alert-danger">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="custom-alert custom-alert-success">
            <i className="bi bi-check-circle-fill"></i>
            {success}
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-5">
            <div className="custom-spinner"></div>
          </div>
        ) : (
          <div className="table-wrapper">
            <div className="table-responsive">
              <table className="table custom-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((producto) => (
                      <tr key={producto._id}>
                        <td data-label="Producto">
                          <div className="d-flex align-items-center gap-2">
                            <div className="product-icon">
                              <i className={`bi ${getProductIcon(producto.categoria)}`}></i>
                            </div>
                            <span className="product-name">{producto.nombre}</span>
                          </div>
                        </td>
                        <td data-label="Categoría">
                          <span className="category-badge">
                            <i className="bi bi-folder me-1"></i>
                            {producto.categoria.nombre}
                          </span>
                        </td>
                        <td data-label="Precio" className="price-cell">
                          ${Number(producto.precio).toFixed(2)}
                        </td>
                        <td data-label="Stock" className="stock-cell">
                          {producto.stock} unidades
                        </td>
                        <td data-label="Estado">
                          {getStockBadge(producto.stock)}
                        </td>
                        <td data-label="Acciones">
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-stock"
                              onClick={() => handleShowModal('stock', producto)}
                              title="Modificar stock"
                            >
                              <i className="bi bi-arrow-up"></i>
                              Stock
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleShowModal('editar', producto)}
                              title="Editar producto"
                            >
                              <i className="bi bi-pencil"></i>
                              Editar
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleEliminar(producto._id)}
                              title="Eliminar producto"
                            >
                              <i className="bi bi-trash"></i>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
                        <div className="empty-state">
                          <i className="bi bi-box"></i>
                          <p>No se encontraron productos</p>
                          <button className="btn btn-primary" onClick={() => handleShowModal('crear')}>
                            <i className="bi bi-plus me-2"></i>
                            Crear primer producto
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {renderProductoModal()}
        {renderStockModal()}
      </div>
    </div>
  );
};

export default Products;