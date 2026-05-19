import React from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";

const SalesDashboard = () => {

  const cards = [
    { title: "Total Leads", value: "245", growth: "+10.5%" },
    { title: "Hot / Warm / Cold", value: "58 / 92 / 95", growth: "+8.4%" },
    { title: "Deals in Pipeline", value: "24", growth: "+6.7%" },
    { title: "Missed Follow-Ups", value: "18", growth: "-4.9%" },
  ];

  const tableData = [
    { name: "Rahul", owner: "Arjun", delay: "2h Late", priority: "Cold", status: "Open" },
    { name: "Neha", owner: "Neha", delay: "1 Day", priority: "Hot", status: "Open" },
    { name: "Pooja", owner: "Pooja", delay: "3 Days", priority: "Hot", status: "Open" },
    { name: "Riya", owner: "Rahul", delay: "5 Days", priority: "Warm", status: "Pending" },
  ];

  const aiItems = [
    "Lead Priority Suggestions",
    "Deal Close Probability",
    "Best Time to Connect",
    "Auto Follow-Up Reminders",
    "Predicted Deal Value",
  ];

  return (
    <DashboardLayout>
      <div style={container}>

        <h2 style={{ marginBottom: "20px" }}>Dashboard</h2>

        {/* Top Cards */}
        <div style={flexRow}>
          {cards.map((card, i) => (
            <div key={i} style={cardStyle}>
              <p style={{ color: "#777", fontSize: "14px" }}>{card.title}</p>
              <h2>{card.value}</h2>
              <p
                style={{
                  color: card.growth.includes("-") ? "red" : "green",
                  fontSize: "13px"
                }}
              >
                {card.growth} last month
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={flexRow}>

          <div style={{ ...cardStyle, flex: 2 }}>
            <h3>Monthly Revenue</h3>
            <div style={chartBox}>Chart</div>
          </div>

          <div style={{ ...cardStyle, flex: 2 }}>
            <h3>Sales Funnel</h3>
            <div style={chartBox}>Funnel</div>
          </div>

        </div>

        {/* Bottom Section */}
        <div style={flexRow}>

          <div style={{ ...cardStyle, flex: 3 }}>
            <h3>Missed Follow-Ups</h3>

            <table style={{ width: "100%", marginTop: "10px" }}>
              <thead>
                <tr>
                  <th align="left">Lead</th>
                  <th align="left">Owner</th>
                  <th align="left">Missed</th>
                  <th align="left">Priority</th>
                  <th align="left">Status</th>
                </tr>
              </thead>

              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>{row.owner}</td>
                    <td>{row.delay}</td>
                    <td>{row.priority}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ ...cardStyle, flex: 1 }}>
            <h3>AI Intelligence</h3>

            {aiItems.map((item, i) => (
              <div key={i} style={aiBox}>
                {item}
              </div>
            ))}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

/* Styles */

const container = {
  padding: "20px",
  background: "#f4f6f9",
  minHeight: "100vh",
};

const flexRow = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
};

const cardStyle = {
  flex: 1,
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const chartBox = {
  height: "200px",
  marginTop: "10px",
  background: "#e0f2fe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const aiBox = {
  padding: "10px",
  border: "1px solid #eee",
  borderRadius: "6px",
  marginTop: "10px",
};

export default SalesDashboard;