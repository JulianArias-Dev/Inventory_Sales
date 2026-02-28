import React, { useState, useEffect } from 'react';
import { categoriaService } from '../services/categoriesService';
import { productService } from '../services/productService';
import '../styles/categories.css';

const Categories = () => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
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

      // Cargar categorías y productos en paralelo
      const [categoriasData, productosData] = await Promise.all([
        categoriaService.getAll(),
        productService.getAll()
      ]);

      console.log('Categorías recibidas:', categoriasData);
      console.log('Productos recibidos:', productosData);

      // Transformar categorías - AHORA _id es número
      const categoriasTransformadas = categoriasData.map(cat => ({
        _id: cat.id,  // Número directo
        nombre: cat.nombre
      }));

      // Transformar productos - también con IDs como números
      const productosTransformados = productosData.map(prod => ({
        _id: prod.id,
        nombre: prod.name,
        precio: prod.price,
        stock: prod.stock,
        categoria: prod.categoria  // Número (ID de categoría)
      }));

      setCategorias(categoriasTransformadas);
      setProductos(productosTransformados);

    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar si una categoría tiene productos
  const categoriaTieneProductos = (categoriaId) => {
    return productos.some(producto =>
      Number(producto.categoria) === Number(categoriaId)
    );
  };

  // Obtener cantidad de productos por categoría
  const getCantidadProductos = (categoriaId) => {
    return productos.filter(producto =>
      Number(producto.categoria) === Number(categoriaId)
    ).length;
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
        console.log('Categoría creada:', nuevaCategoria);

        const categoriaTransformada = {
          _id: nuevaCategoria.id,  // Número directo
          nombre: nuevaCategoria.nombre
        };

        setCategorias([...categorias, categoriaTransformada]);
        setSuccess('Categoría creada exitosamente');

      } else if (modalType === 'editar' && selectedCategoria) {
        const categoriaActualizada = await categoriaService.update(selectedCategoria._id, formData);
        console.log('Categoría actualizada:', categoriaActualizada);

        const categoriaTransformada = {
          _id: categoriaActualizada.id,  // Número directo
          nombre: categoriaActualizada.nombre
        };

        setCategorias(categorias.map(c => c._id === selectedCategoria._id ? categoriaTransformada : c));
        setSuccess('Categoría actualizada exitosamente');
      }

      handleCloseModal();
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error en submit:', error);
      setError(error.message);
    }
  };

  const handleEliminar = async (id, nombre) => {
    // Verificar si tiene productos antes de eliminar
    if (categoriaTieneProductos(id)) {
      setError(`No se puede eliminar la categoría "${nombre}" porque tiene ${getCantidadProductos(id)} producto(s) asociado(s)`);
      return;
    }

    if (!window.confirm(`¿Está seguro de eliminar la categoría "${nombre}"?`)) return;

    try {
      await categoriaService.delete(id);
      setCategorias(categorias.filter(c => c._id !== id));
      setSuccess('Categoría eliminada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error eliminando:', error);
      setError(error.message);
    }
  };

  const filtrarCategorias = () => {
    return categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Calcular estadísticas
  const totalCategorias = categorias.length;
  const categoriasConProductos = categorias.filter(c =>
    categoriaTieneProductos(c._id)
  ).length;
  const categoriasSinProductos = totalCategorias - categoriasConProductos;

  const categoriasFiltradas = filtrarCategorias();

  const getCategoryIcon = (nombre) => {
    const iconos = {
      'Electrónica': 'bi-tv',
      'Electronica': 'bi-tv',
      'Ropa': 'bi-hanger',
      'Hogar': 'bi-house-heart',
      'Deportes': 'bi-trophy',
      'Comida': 'bi-cup-straw',
      'Mascota': 'bi-github'  // Cambiar por bi-dog cuando exista
    };

    // Buscar por coincidencia parcial
    for (let key in iconos) {
      if (nombre.toLowerCase().includes(key.toLowerCase())) {
        return iconos[key];
      }
    }
    return 'bi-folder';
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
                <h3>{categoriasSinProductos}</h3>
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
              categoriasFiltradas.map((categoria) => {
                const tieneProductos = categoriaTieneProductos(categoria._id);
                const cantidadProductos = getCantidadProductos(categoria._id);

                return (
                  <div key={categoria._id} className={`category-card ${tieneProductos ? 'has-products' : ''}`}>
                    <div className="card-body">
                      <div className="category-header">
                        <div className="category-icon">
                          <i className={getCategoryIcon(categoria.nombre)}></i>
                        </div>
                        {tieneProductos && (
                          <span className="badge bg-info" title="Tiene productos asociados">
                            <i className="bi bi-box me-1"></i>
                            {cantidadProductos}
                          </span>
                        )}
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
                          disabled={tieneProductos}
                          title={tieneProductos ? "No se puede eliminar porque tiene productos asociados" : "Eliminar categoría"}
                        >
                          <i className="bi bi-trash"></i>
                          Eliminar
                        </button>
                      </div>

                      {tieneProductos && (
                        <div className="mt-2 text-muted small">
                          <i className="bi bi-info-circle me-1"></i>
                          {cantidadProductos} producto(s) asociado(s)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
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