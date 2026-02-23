import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card } from 'react-bootstrap';

const ColumnChart = ({ data, title, xAxisTitle, yAxisTitle, color = '#4299e1' }) => {
    const options = {
        chart: {
            type: 'column',
            backgroundColor: 'white',
            style: { fontFamily: 'Arial, sans-serif' }
        },
        title: {
            text: title,
            style: { color: '#2b6cb0', fontWeight: 'bold' }
        },
        xAxis: {
            categories: data.map(d => d.label),
            title: { text: xAxisTitle },
            labels: { rotation: -45, style: { fontSize: '12px' } }
        },
        yAxis: {
            title: { text: yAxisTitle }
        },
        series: [{
            name: yAxisTitle,
            data: data.map(d => d.value),
            color: color,
            dataLabels: {
                enabled: true,
                format: `{y} ${yAxisTitle.toLowerCase()}`
            }
        }],
        credits: { enabled: false }
    };

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <HighchartsReact highcharts={Highcharts} options={options} />
            </Card.Body>
        </Card>
    );
};

export default ColumnChart;