import React from "react";
import { FaCheckCircle } from "react-icons/fa";
export default function RiskAnomalyCard() {
  // Commented out dummy risks (CTO compliance)
  /*
  const risks = [
    { text: "User Login Spike Detected", level: "High", checked: true },
    { text: "Multiple Failed Attempts", level: "Medium", checked: true },
    { text: "Unusual Data Export", level: "High", checked: true },
    { text: "Location Mismatch Access", level: "Low", checked: true },
  ];
  */
  const risks = [];

  const getRiskColor = (level) => {
    switch (level) {
      case "High":
        return "#ef4444"; // Red
      case "Medium":
        return "#f59e0b"; // Orange
      case "Low":
        return "#10b981"; // Green
      default:
        return "#6b7280"; // Gray
    }
  };

  const getRiskBgColor = (level) => {
    switch (level) {
      case "High":
        return "#fef2f2"; // Light red
      case "Medium":
        return "#fffbeb"; // Light orange
      case "Low":
        return "#f0fdf4"; // Light green
      default:
        return "#f9fafb"; // Light gray
    }
  };

  const styles = {
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      width: '100%',
      height: '100%'
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
    riskList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    riskItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease'
    },
    riskItemHover: {
      backgroundColor: '#f1f5f9',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    },
    riskContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    checkIcon: {
      fontSize: '16px',
      color: '#10b981',
      flexShrink: 0
    },
    riskText: {
      fontSize: '14px',
      color: '#374151',
      margin: 0
    },
    riskBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>AI Risk & Anomaly Detection</h3>
        <p style={styles.date}>Real-time</p>
      </div>
      
      <div style={styles.riskList}>
        {risks.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
            No active AI risks or anomaly logs found in the database.
          </div>
        ) : (
          risks.map((risk, index) => (
            <div
              key={index}
              style={styles.riskItem}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, styles.riskItemHover);
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={styles.riskContent}>
                {risk.checked && (
                  <FaCheckCircle 
                    style={{
                      fontSize: '16px',
                      color: getRiskColor(risk.level),
                      flexShrink: 0
                    }} 
                  />
                )}
                <p style={styles.riskText}>{risk.text}</p>
              </div>
              
              <span
                style={{
                  ...styles.riskBadge,
                  color: getRiskColor(risk.level),
                  backgroundColor: getRiskBgColor(risk.level)
                }}
              >
                {risk.level}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
