import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card } from 'react-bootstrap';

const LineChart = ({ data, title, xAxisTitle, yAxisTitle, color = '#4299e1' }) => {
  const options = {
    chart: {
      type: 'line',
      backgroundColor: 'white',
      style: { fontFamily: 'Arial, sans-serif' }
    },
    title: {
      text: title,
      style: { color: '#2b6cb0', fontWeight: 'bold' }
    },
    xAxis: {
      categories: data.map(d => d.label),
      title: { text: xAxisTitle }
    },
    yAxis: {
      title: { text: yAxisTitle }
    },
    series: [{
      name: yAxisTitle,
      data: data.map(d => d.value),
      color: color,
      lineWidth: 3,
      marker: {
        enabled: true,
        radius: 5,
        fillColor: '#2b6cb0'
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

export default LineChart;