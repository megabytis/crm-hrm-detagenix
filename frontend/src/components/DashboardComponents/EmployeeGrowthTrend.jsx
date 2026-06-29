import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EmployeeGrowthTrend = () => {
  
  // Commented out dummy growth data (CTO compliance)
  /*
  const employeeGrowthData = {
    current: 182,
    previous: 173,
    growth: 9,
    growthPercentage: 5.2,
    stages: [
      { label: "Applications", value: 450 },
      { label: "Screened", value: 280 },
      { label: "Interviewed", value: 120 },
      { label: "Selected", value: 45 },
      { label: "Onboarded", value: 182 },
    ]
  };
  */
  const employeeGrowthData = {
    current: 0,
    previous: 0,
    growth: 0,
    growthPercentage: 0,
    stages: []
  };

  const chartData = {
    labels: employeeGrowthData.stages.map(stage => stage.label),
    datasets: [
      {
        label: 'Candidates',
        data: employeeGrowthData.stages.map(stage => stage.value),
        backgroundColor: [
          '#0ea5e9', 
          '#38bdf8', 
          '#7dd3fc', 
          '#bae6fd',
          '#e0f2fe' 
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Recruitment Funnel',
        font: {
          size: 16,
          weight: '600'
        },
        color: '#000000',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#0ea5e9',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Candidates: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  const styles = {
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      width: '100%',
      maxWidth: '800px',
      height: '100%',
      height: '500px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#000000',
      margin: 0
    },
    date: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    statItem: {
      textAlign: 'center',
      flex: 1
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#000000',
      margin: '0 0 4px 0'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0
    },
    chartContainer: {
      position: 'relative',
      height: '300px',
      width: '100%'
    },
    growthIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#f0fdf4',
      borderRadius: '8px',
      border: '1px solid #bbf7d0'
    },
    growthText: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#16a34a'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Employee Growth Trend</h3>
        <p style={styles.date}>February 2025</p>
      </div>
      
      {/* Stats Summary */}
      <div style={styles.statsContainer}>
        <div style={styles.statItem}>
          <p style={styles.statValue}>{employeeGrowthData.current}</p>
          <p style={styles.statLabel}>Current</p>
        </div>
        <div style={styles.statItem}>
          <p style={styles.statValue}>{employeeGrowthData.previous}</p>
          <p style={styles.statLabel}>Previous</p>
        </div>
        <div style={styles.statItem}>
          <div style={styles.growthIndicator}>
            <span style={styles.growthText}>+{employeeGrowthData.growth} ({employeeGrowthData.growthPercentage}%)</span>
          </div>
          <p style={styles.statLabel}>Growth</p>
        </div>
      </div>

        {/* Funnel Chart */}
        <div style={styles.chartContainer}>
          {employeeGrowthData.stages.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
              No employee recruitment data found in the database.
            </div>
          ) : (
            <Bar data={chartData} options={options} />
          )}
        </div>
      </div>
    );
  };
  
  export default EmployeeGrowthTrend;
