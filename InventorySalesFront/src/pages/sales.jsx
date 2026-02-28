import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import salesService from '../services/salesService';
import SalesTable from '../components/tables/SalesTable';
import SaleFormModal from '../components/modals/SaleFormModal';
import SalesDetailsModal from '../components/modals/SaleDetailsModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/sales.css';

const Sales = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedVentaId, setSelectedVentaId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [stats, setStats] = useState({
        totalVentas: 0,
        totalIngresos: 0,
        promedioVentas: 0
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        cargarVentas();
    }, [refreshTrigger]); // Recargar cuando cambie el trigger

    const cargarVentas = async () => {
        try {
            setLoading(true);
            const data = await salesService.getVentas();
            setVentas(data || []);
            calcularStats(data || []);
            setError('');
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            setError('Error al cargar las ventas');
        } finally {
            setLoading(false);
        }
    };

    const calcularStats = (data) => {
        const totalVentas = data.length;
        const totalIngresos = data.reduce((acc, venta) => acc + (venta.totalAmount || 0), 0);
        const promedioVentas = totalVentas > 0 ? totalIngresos / totalVentas : 0;

        setStats({
            totalVentas,
            totalIngresos,
            promedioVentas
        });
    };

    const handleViewDetails = (id) => {
        setSelectedVentaId(id);
        setShowDetailsModal(true);
    };

    const handleCloseDetails = () => {
        setShowDetailsModal(false);
        setSelectedVentaId(null);
    };

    const handleOpenForm = () => {
        setShowModal(true);
    };

    const handleCloseForm = () => {
        setShowModal(false);
    };

    const handleSuccess = () => {
        setShowModal(false);
        setSuccess('Venta registrada exitosamente');
        setRefreshTrigger(prev => prev + 1); // Forzar recarga de la tabla
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="sales-container">
            {/* Header */}
            <div className="sales-header">
                <Container fluid>
                    <Row className="align-items-center">
                        <Col>
                            <h2>
                                <i className="bi bi-cart-check me-2"></i>
                                Gestión de Ventas
                            </h2>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="primary"
                                className="d-flex align-items-center gap-2"
                                onClick={handleOpenForm}
                            >
                                <i className="bi bi-plus-lg"></i>
                                Nueva Venta
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container fluid className="px-4">
                {/* Stats Cards */}
                <Row className="stats-row">
                    <Col md={4}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="bi bi-cart"></i>
                            </div>
                            <div className="stat-info">
                                <h3>{stats.totalVentas}</h3>
                                <p>Total Ventas</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="bi bi-cash-stack"></i>
                            </div>
                            <div className="stat-info">
                                <h3>${stats.totalIngresos.toFixed(2)}</h3>
                                <p>Ingresos Totales</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <i className="bi bi-graph-up"></i>
                            </div>
                            <div className="stat-info">
                                <h3>${stats.promedioVentas.toFixed(2)}</h3>
                                <p>Promedio por Venta</p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Alerts */}
                {error && (
                    <Alert variant="danger" className="custom-alert" onClose={() => setError('')} dismissible>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" className="custom-alert" onClose={() => setSuccess('')} dismissible>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {success}
                    </Alert>
                )}

                {/* Sales Table */}
                <SalesTable
                    ventas={ventas}
                    onViewDetails={handleViewDetails}
                    loading={loading}
                />

                {/* Modal de nueva venta */}
                {showModal && (
                    <SaleFormModal
                        onClose={handleCloseForm}
                        onSuccess={handleSuccess}
                    />
                )}

                {/* Modal de detalles de venta */}
                {showDetailsModal && selectedVentaId && (
                    <SalesDetailsModal
                        ventaId={selectedVentaId}
                        onClose={handleCloseDetails}
                    />
                )}
            </Container>
        </div>
    );
};

export default Sales;