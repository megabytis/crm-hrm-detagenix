import React from "react";
import { FaUser, FaExclamationTriangle, FaShieldAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
export default function SecurityAlerts() {
  // Commented out dummy alerts (CTO compliance)
  /*
  const alerts = [
    { user: "Arjun", activity: "Failed Login", risk: "Low", time: "2 mins ago", status: "Resolved" },
    { user: "Neha", activity: "Data Export", risk: "High", time: "5 mins ago", status: "Active"},
    { user: "Pooja", activity: "Role Change", risk: "Low", time: "12 mins ago", status: "Resolved"},
    { user: "Rahul", activity: "API Abuse", risk: "Medium", time: "18 mins ago", status: "Active"},
  ];
  */
  const alerts = [];

  const getRiskColor = (level) => {
    switch (level) {
      case "High":
        return "#ef4444"; 
      case "Medium":
        return "#f59e0b"; 
      case "Low":
        return "#10b981"; 
      default:
        return "#6b7280"; 
    }
  };

  const getRiskBgColor = (level) => {
    switch (level) {
      case "High":
        return "#fef2f2"; 
      case "Medium":
        return "#fffbeb"; 
      case "Low":
        return "#f0fdf4"; 
      default:
        return "#f9fafb"; 
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
    tableContainer: {
      overflow: 'hidden'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      backgroundColor: '#f8fafc',
      color: '#6b7280',
      fontWeight: '600',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '1px solid #e2e8f0'
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #f1f5f9',
      color: '#374151'
    },
    userCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    userIcon: {
      fontSize: '14px',
      color: '#6b7280',
      backgroundColor: '#f1f5f9',
      padding: '4px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    userName: {
      fontWeight: '500',
      color: '#000000'
    },
    riskBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-block'
    },
    timeCell: {
      color: '#6b7280',
      fontSize: '12px'
    },
    statusCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    statusIcon: {
      fontSize: '12px'
    },
    statusText: {
      fontSize: '12px',
      fontWeight: '500'
    },
    statusActive: {
      color: '#ef4444'
    },
    statusResolved: {
      color: '#10b981'
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Real-Time Security Alerts</h3>
        <p style={styles.date}>Live</p>
      </div>
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Activity</th>
              <th style={styles.th}>Risk</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{...styles.td, textAlign: 'center', color: '#6b7280', padding: '24px'}}>
                  No real-time security alerts found in the database.
                </td>
              </tr>
            ) : (
              alerts.map((alert, index) => (
                <tr key={index}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <span style={styles.userName}>{alert.user}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{alert.activity}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.riskBadge,
                        color: getRiskColor(alert.risk),
                        backgroundColor: getRiskBgColor(alert.risk)
                      }}
                    >
                      {alert.risk}
                    </span>
                  </td>
                  <td style={{...styles.td, ...styles.timeCell}}>
                    {alert.time}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.statusCell}>
                      {alert.status === 'Active' ? (
                        <FaTimesCircle style={{...styles.statusIcon, ...styles.statusActive}} />
                      ) : (
                        <FaCheckCircle style={{...styles.statusIcon, ...styles.statusResolved}} />
                      )}
                      <span 
                        style={{
                          ...styles.statusText,
                          ...(alert.status === 'Active' ? styles.statusActive : styles.statusResolved)
                        }}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
