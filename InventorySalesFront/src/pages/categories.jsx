import React, { useState, useEffect } from 'react';
import { categoriaService } from '../services/categoriesService';
import '../styles/categories.css'; // Importar el CSS

const Categories = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('crear');
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [formData, setFormData] = useState({ nombre: '' });
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
    setFormData({ nombre: categoria ? categoria.nombre : '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategoria(null);
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({ nombre: e.target.value });
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

  const totalCategorias = categorias.length;
  const categoriasConProductos = categorias.filter(c => 
    // Esto debería venir del servicio, pero por ahora lo simulamos
    ['1', '2'].includes(c._id)
  ).length;

  const categoriasFiltradas = filtrarCategorias();

  const getCategoryIcon = (nombre) => {
    const iconos = {
      'Electrónica': 'bi-tv',
      'Ropa': 'bi-hanger',
      'Hogar': 'bi-house-heart',
      'Deportes': 'bi-trophy'
    };
    return iconos[nombre] || 'bi-folder';
  };

  return (
    <div className="categories-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <i className="bi bi-tags"></i>
            Gestión de Categorías
          </h2>
          <button className="btn btn-light" onClick={() => handleShowModal('crear')}>
            <i className="bi bi-plus-lg me-2"></i>
            Nueva Categoría
          </button>
        </div>
      </div>

      <div className="container-fluid px-4">
        {/* Stats Cards */}
        <div className="row stats-row">
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-tags"></i>
              </div>
              <div className="stat-info">
                <h3>{totalCategorias}</h3>
                <p>Total Categorías</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-box"></i>
              </div>
              <div className="stat-info">
                <h3>{categoriasConProductos}</h3>
                <p>Con Productos</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-folder"></i>
              </div>
              <div className="stat-info">
                <h3>{totalCategorias - categoriasConProductos}</h3>
                <p>Sin Productos</p>
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
              placeholder="Buscar categoría por nombre..."
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

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="custom-spinner"></div>
          </div>
        ) : (
          <div className="categories-grid">
            {categoriasFiltradas.length > 0 ? (
              categoriasFiltradas.map((categoria) => (
                <div key={categoria._id} className="category-card">
                  <div className="card-body">
                    <div className="category-header">
                      <div className="category-icon">
                        <i className={getCategoryIcon(categoria.nombre)}></i>
                      </div>
                    </div>
                    
                    <h5 className="category-title">
                      {categoria.nombre}
                    </h5>
                    
                    <div className="category-id">
                      <i className="bi bi-hash"></i>
                      ID: {categoria._id}
                    </div>

                    <div className="category-actions">
                      <button
                        className="btn-category btn-category-edit"
                        onClick={() => handleShowModal('editar', categoria)}
                      >
                        <i className="bi bi-pencil"></i>
                        Editar
                      </button>
                      <button
                        className="btn-category btn-category-delete"
                        onClick={() => handleEliminar(categoria._id, categoria.nombre)}
                      >
                        <i className="bi bi-trash"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="bi bi-folder"></i>
                <p>No se encontraron categorías</p>
                <button className="btn btn-primary" onClick={() => handleShowModal('crear')}>
                  <i className="bi bi-plus me-2"></i>
                  Crear primera categoría
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal fade show category-modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleCloseModal}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalType === 'crear' ? 'Nueva Categoría' : 'Editar Categoría'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit} className="category-form">
                  <div className="modal-body">
                    {error && (
                      <div className="custom-alert custom-alert-danger mb-3">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        {error}
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <label className="form-label">Nombre de la Categoría</label>
                      <input
                        type="text"
                        className="form-control"
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
        )}
      </div>
    </div>
  );
};

export default Categories;