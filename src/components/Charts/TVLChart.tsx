import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const TVLChart = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
        {
            label: 'TVL',
            data: [65, 59, 80, 81, 56, 80, 40],
            fill: false,
            backgroundColor: 'rgb(75, 192, 192)',
            borderColor: '#227BED',
            pointRadius: 0,
            tension: 0.1,
          },
    ],
  };

  const options = {
    
    scales: {
      y: {
        display: false,
      },
      x: {
        display: false, 
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default TVLChart
