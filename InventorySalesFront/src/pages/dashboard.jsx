import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { KpiCard } from '../components/cards';
import { LineChart, ColumnChart, BarChart } from '../components/charts';
import dashboardService from '../services/dashboardService';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    resumen: {
      totalVentas: 0,
      totalIngresos: 0,
      productoMasVendido: { nombre: 'N/A', cantidad: 0 },
      categoriaMasVendida: { nombre: 'N/A', cantidad: 0 }
    },
    ventasPorDia: [],
    productosMasVendidos: [],
    ventasPorCategoria: []
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Cargando datos del dashboard...');

      // Usar el método flexible del servicio
      const dashboardData = await dashboardService.getDashboardDataFlexible();

      console.log('Datos procesados:', dashboardData);
      setData(dashboardData);

    } catch (error) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error detallado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Transformar datos para los gráficos
  const ventasPorDiaChart = data.ventasPorDia.map(d => ({
    label: new Date(d.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    }),
    value: d.cantidad
  }));

  const productosMasVendidosChart = data.productosMasVendidos.map(p => ({
    label: p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre,
    value: p.cantidad
  }));

  const ventasPorCategoriaChart = data.ventasPorCategoria.map(c => ({
    label: c.categoria,
    value: c.cantidad
  }));

  // Calcular total para porcentajes
  const totalCategorias = data.ventasPorCategoria.reduce((acc, c) => acc + c.cantidad, 0);

  if (loading) {
    return (
      <Container fluid className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Cargando dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="d-flex justify-content-between align-items-center px-4">
          <h2>
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </h2>
          <button
            className="btn btn-light"
            onClick={cargarDatos}
            disabled={loading}
          >
            <i className={`bi bi-arrow-repeat me-2 ${loading ? 'spin' : ''}`}></i>
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="m-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="px-4">
        <Row className="g-4 mb-4">
          <Col md={4}>
            <KpiCard
              icon="cart-check"
              value={data.resumen.totalVentas}
              label="Total de Ventas"
              variant="primary"
            />
          </Col>
          <Col md={4}>
            <KpiCard
              icon="trophy"
              value={data.resumen.productoMasVendido.nombre}
              label={`Producto más vendido (${data.resumen.productoMasVendido.cantidad} und)`}
              variant="success"
            />
          </Col>
          <Col md={4}>
            <KpiCard
              icon="tags"
              value={data.resumen.categoriaMasVendida.nombre}
              label={`Categoría más vendida (${data.resumen.categoriaMasVendida.cantidad} und)`}
              variant="warning"
            />
          </Col>
        </Row>

        {/* Charts */}
        <Row className="g-4">
          <Col lg={12}>
            {ventasPorDiaChart.length > 0 ? (
              <LineChart
                data={ventasPorDiaChart}
                title="Ventas por Día"
                xAxisTitle="Fecha"
                yAxisTitle="Ventas"
              />
            ) : (
              <div className="bg-white p-4 rounded-3 shadow-sm text-center text-muted">
                <i className="bi bi-bar-chart-line fs-1"></i>
                <p className="mt-2">No hay datos de ventas por día</p>
              </div>
            )}
          </Col>

          <Col lg={6}>
            {productosMasVendidosChart.length > 0 ? (
              <ColumnChart
                data={productosMasVendidosChart}
                title="Productos Más Vendidos"
                xAxisTitle="Producto"
                yAxisTitle="Unidades"
              />
            ) : (
              <div className="bg-white p-4 rounded-3 shadow-sm text-center text-muted">
                <i className="bi bi-box fs-1"></i>
                <p className="mt-2">No hay datos de productos</p>
              </div>
            )}
          </Col>

          <Col lg={6}>
            {ventasPorCategoriaChart.length > 0 ? (
              <BarChart
                data={ventasPorCategoriaChart}
                title="Ventas por Categoría"
                xAxisTitle="Categoría"
                yAxisTitle="Unidades"
              />
            ) : (
              <div className="bg-white p-4 rounded-3 shadow-sm text-center text-muted">
                <i className="bi bi-tags fs-1"></i>
                <p className="mt-2">No hay datos de categorías</p>
              </div>
            )}
          </Col>
        </Row>

        {/* Tabla resumen adicional */}
        {ventasPorCategoriaChart.length > 0 && (
          <Row className="mt-4">
            <Col>
              <div className="bg-white p-4 rounded-3 shadow-sm">
                <h5 className="text-primary mb-3">
                  <i className="bi bi-table me-2"></i>
                  Detalle de Ventas por Categoría
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="bg-light">
                      <tr>
                        <th>Categoría</th>
                        <th>Unidades Vendidas</th>
                        <th>% del Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.ventasPorCategoria.map((cat, index) => {
                        const porcentaje = totalCategorias > 0
                          ? ((cat.cantidad / totalCategorias) * 100).toFixed(1)
                          : 0;
                        return (
                          <tr key={index}>
                            <td>{cat.categoria}</td>
                            <td>{cat.cantidad} unidades</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="progress flex-grow-1" style={{ height: '20px' }}>
                                  <div
                                    className="progress-bar bg-primary"
                                    style={{ width: `${porcentaje}%` }}
                                    role="progressbar"
                                    aria-valuenow={porcentaje}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                                <span className="ms-2 text-muted small">{porcentaje}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default Dashboard;