import React, { useState, useEffect } from 'react';
import { categoriaService } from '../services/categoriesService';

const Categories = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('crear'); // 'crear' o 'editar'
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch {
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (type, categoria = null) => {
    setModalType(type);
    setSelectedCategoria(categoria);
    setError('');
    
    if (type === 'crear') {
      setFormData({ nombre: '' });
    } else if (type === 'editar' && categoria) {
      setFormData({ nombre: categoria.nombre });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategoria(null);
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
        const nuevaCategoria = await categoriaService.create(formData);
        setCategorias([...categorias, nuevaCategoria]);
        setSuccess('Categoría creada exitosamente');
      } else if (modalType === 'editar' && selectedCategoria) {
        const categoriaActualizada = await categoriaService.update(selectedCategoria._id, formData);
        setCategorias(categorias.map(c => c._id === selectedCategoria._id ? categoriaActualizada : c));
        setSuccess('Categoría actualizada exitosamente');
      }
      
      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar la categoría "${nombre}"?`)) return;
    
    try {
      await categoriaService.delete(id);
      setCategorias(categorias.filter(c => c._id !== id));
      setSuccess('Categoría eliminada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    }
  };

  const filtrarCategorias = () => {
    return categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const categoriasFiltradas = filtrarCategorias();

  // Modal para crear/editar categoría
  const renderModal = () => {
    if (!showModal) return null;
    
    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseModal}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalType === 'crear' ? 'Nueva Categoría' : 'Editar Categoría'}</h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                
                <div className="mb-3">
                  <label className="form-label">Nombre de la Categoría</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Electrónica, Ropa, Hogar..."
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalType === 'crear' ? 'Crear Categoría' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Categorías</h2>
        <button className="btn btn-primary" onClick={() => handleShowModal('crear')}>
          <i className="bi bi-plus me-2"></i>Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
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
            placeholder="Buscar categoría por nombre..."
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
        <div className="row">
          {categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map((categoria) => (
              <div key={categoria._id} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title mb-1">{categoria.nombre}</h5>
                        <p className="card-text text-muted">
                          <small>
                            <i className="bi bi-tag me-1"></i>
                            ID: {categoria._id}
                          </small>
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-warning"
                          onClick={() => handleShowModal('editar', categoria)}
                          title="Editar categoría"
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Editar
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleEliminar(categoria._id, categoria.nombre)}
                          title="Eliminar categoría"
                        >
                          <i className="bi bi-trash me-2"></i>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center">
                <i className="bi bi-info-circle me-2"></i>
                No se encontraron categorías
              </div>
            </div>
          )}
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default Categories;