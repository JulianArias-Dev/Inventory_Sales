import React, { useState, useEffect } from 'react';
import { productoService } from '../services/productService';

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('crear');
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoriaId: ''
  });
  const [stockOperation, setStockOperation] = useState('aumentar');
  const [stockCantidad, setStockCantidad] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await productoService.getAll();
      setProductos(data);
      setCategorias(productoService.getCategorias());
    } catch {
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (type, producto = null) => {
    setModalType(type);
    setSelectedProducto(producto);
    setError('');
    
    if (type === 'crear') {
      setFormData({
        nombre: '',
        precio: '',
        stock: '',
        categoriaId: ''
      });
    } else if (type === 'editar' && producto) {
      setFormData({
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock,
        categoriaId: producto.categoria._id
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
        const nuevoProducto = await productoService.create(formData);
        setProductos([...productos, nuevoProducto]);
        setSuccess('Producto creado exitosamente');
      } else if (modalType === 'editar' && selectedProducto) {
        const productoActualizado = await productoService.update(selectedProducto._id, formData);
        setProductos(productos.map(p => p._id === selectedProducto._id ? productoActualizado : p));
        setSuccess('Producto actualizado exitosamente');
      }
      
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleModificarStock = async () => {
    if (!selectedProducto) return;
    
    try {
      const productoActualizado = await productoService.modificarStock(
        selectedProducto._id, 
        stockCantidad, 
        stockOperation
      );
      
      setProductos(productos.map(p => p._id === selectedProducto._id ? productoActualizado : p));
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
      await productoService.delete(id);
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
    if (stock === 0) return <span className="badge bg-danger">Agotado</span>;
    if (stock < 10) return <span className="badge bg-warning text-dark">Bajo stock</span>;
    return <span className="badge bg-success">Disponible</span>;
  };

  const productosFiltrados = filtrarProductos();

  // Modal para crear/editar producto
  const renderProductoModal = () => {
    if (!showModal || modalType === 'stock') return null;
    
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseModal}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalType === 'crear' ? 'Nuevo Producto' : 'Editar Producto'}</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                
                <div className="mb-3">
                  <label className="form-label">Nombre del Producto</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    name="categoriaId"
                    value={formData.categoriaId}
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
                  <label className="form-label">Precio</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      name="precio"
                      step="0.01"
                      min="0"
                      value={formData.precio}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Stock Inicial</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalType === 'crear' ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Modal para modificar stock
  const renderStockModal = () => {
    if (!showModal || modalType !== 'stock' || !selectedProducto) return null;
    
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseModal}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modificar Stock</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <p><strong>Producto:</strong> {selectedProducto.nombre}</p>
              <p><strong>Stock actual:</strong> {selectedProducto.stock} unidades</p>

              <div className="mb-3">
                <label className="form-label">Operación</label>
                <div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="stockOperation"
                      value="aumentar"
                      checked={stockOperation === 'aumentar'}
                      onChange={(e) => setStockOperation(e.target.value)}
                    />
                    <label className="form-check-label">Aumentar</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="stockOperation"
                      value="disminuir"
                      checked={stockOperation === 'disminuir'}
                      onChange={(e) => setStockOperation(e.target.value)}
                    />
                    <label className="form-check-label">Disminuir</label>
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
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleModificarStock}
                disabled={!stockCantidad || stockCantidad < 1}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Productos</h2>
        <button className="btn btn-primary" onClick={() => handleShowModal('crear')}>
          <i className="bi bi-plus me-2"></i>Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      <div className="mb-4">
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead className="bg-light">
              <tr>
                <th>Nombre</th>
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
                    <td>{producto.nombre}</td>
                    <td>
                      <span className="badge bg-info">{producto.categoria.nombre}</span>
                    </td>
                    <td>${producto.precio.toFixed(2)}</td>
                    <td>{producto.stock} unidades</td>
                    <td>{getStockBadge(producto.stock)}</td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => handleShowModal('stock', producto)}
                      >
                        <i className="bi bi-arrow-up me-1"></i>Stock
                      </button>
                      <button
                        className="btn btn-outline-warning btn-sm me-2"
                        onClick={() => handleShowModal('editar', producto)}
                      >
                        <i className="bi bi-pencil me-1"></i>Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleEliminar(producto._id)}
                      >
                        <i className="bi bi-trash me-1"></i>Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {renderProductoModal()}
      {renderStockModal()}
    </div>
  );
};

export default Products;