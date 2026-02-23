import React from 'react';
import { Card } from 'react-bootstrap';

const KpiCard = ({ icon, value, label, variant = 'primary', onClick }) => {
    const variantStyles = {
        primary: { bg: 'bg-primary', icon: 'text-white' },
        success: { bg: 'bg-success', icon: 'text-white' },
        warning: { bg: 'bg-warning', icon: 'text-white' },
        danger: { bg: 'bg-danger', icon: 'text-white' },
        info: { bg: 'bg-info', icon: 'text-white' }
    };

    return (
        <Card
            className={`shadow-sm h-100 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <Card.Body className="d-flex align-items-center">
                <div className={`${variantStyles[variant].bg} rounded-3 p-3 me-3`}>
                    <i className={`bi bi-${icon} fs-3 ${variantStyles[variant].icon}`}></i>
                </div>
                <div>
                    <h3 className="h2 mb-0 fw-bold">{value}</h3>
                    <p className="text-muted mb-0">{label}</p>
                </div>
            </Card.Body>
        </Card>
    );
};

export default KpiCard;