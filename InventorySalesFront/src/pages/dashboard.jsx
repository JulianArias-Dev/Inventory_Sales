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
      // Simulación de datos mientras el backend no está listo
      const mockData = {
        resumen: {
          totalVentas: 156,
          totalIngresos: 45230,
          productoMasVendido: { nombre: 'Televisor Samsung 55"', cantidad: 28 },
          categoriaMasVendida: { nombre: 'Electrónica', cantidad: 89 }
        },
        ventasPorDia: [
          { fecha: '2024-03-01', cantidad: 5 },
          { fecha: '2024-03-02', cantidad: 7 },
          { fecha: '2024-03-03', cantidad: 4 },
          { fecha: '2024-03-04', cantidad: 8 },
          { fecha: '2024-03-05', cantidad: 6 }
        ],
        productosMasVendidos: [
          { nombre: 'Televisor Samsung 55"', cantidad: 28 },
          { nombre: 'Laptop Dell XPS 13', cantidad: 22 },
          { nombre: 'Silla Gamer', cantidad: 18 },
          { nombre: 'Camisa Manga Larga', cantidad: 15 }
        ],
        ventasPorCategoria: [
          { categoria: 'Electrónica', cantidad: 89 },
          { categoria: 'Hogar', cantidad: 42 },
          { categoria: 'Ropa', cantidad: 38 }
        ]
      };

      setData(mockData);
      // Cuando el backend esté listo, usa:
      // const dashboardData = await dashboardService.getDashboardData();
      // setData(dashboardData);

      setError('');
    } catch (error) {
      setError('Error al cargar los datos del dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Transformar datos para los gráficos
  const ventasPorDiaChart = data.ventasPorDia.map(d => ({
    label: new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
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
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </h2>
          <p className="text-muted">Resumen general de ventas y estadísticas</p>
        </Col>
        <Col xs="auto">
          <button
            className="btn btn-outline-primary"
            onClick={cargarDatos}
          >
            <i className="bi bi-arrow-repeat me-2"></i>
            Actualizar
          </button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
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
          <LineChart
            data={ventasPorDiaChart}
            title="Ventas por Día"
            xAxisTitle="Fecha"
            yAxisTitle="Ventas"
          />
        </Col>

        <Col lg={6}>
          <ColumnChart
            data={productosMasVendidosChart}
            title="Productos Más Vendidos"
            xAxisTitle="Producto"
            yAxisTitle="Unidades"
          />
        </Col>

        <Col lg={6}>
          <BarChart
            data={ventasPorCategoriaChart}
            title="Ventas por Categoría"
            xAxisTitle="Categoría"
            yAxisTitle="Unidades"
          />
        </Col>
      </Row>

      {/* Tabla resumen adicional */}
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
                    const total = data.ventasPorCategoria.reduce((acc, c) => acc + c.cantidad, 0);
                    const porcentaje = ((cat.cantidad / total) * 100).toFixed(1);
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
    </Container>
  );
};

export default Dashboard;