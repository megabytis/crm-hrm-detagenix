import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
export default function MonthlyRevenueChart() {
  // Commented out dummy revenue data (CTO compliance)
  /*
  const data = [9500, 10200, 10000, 10800, 11200, 12540, 12100, 13000, 14800];

  const labels = [
    "Sep 1",
    "Sep 5",
    "Sep 9",
    "Sep 13",
    "Sep 17",
    "Sep 21",
    "Sep 25",
    "Sep 29",
    "Oct 3"
  ];
  */
  const data = [];
  const labels = [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Monthly Revenue",
        data,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#0ea5e9",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Revenue: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="revenue-card">
      <div className="revenue-header">
        <h3>Monthly Revenue</h3>
        <select className="revenue-dropdown">
          <option>Monthly</option>
        </select>
      </div>

      <div style={{ height: "300px", marginTop: "20px" }}>
        {data.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
            No monthly revenue records found in the database.
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>

      <style>{`
        .revenue-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .revenue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .revenue-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .revenue-dropdown {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
