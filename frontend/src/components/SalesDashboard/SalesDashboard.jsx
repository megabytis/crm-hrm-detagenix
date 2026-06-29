import React, { useState, useEffect } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { crmService } from "../../services/crmService";

const SalesDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from database (CTO Compliance: no dummy fallbacks)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all leads
        const leadsRes = await crmService.leads.getAll({ limit: 1000 });
        const fetchedLeads = leadsRes.data || leadsRes.data?.data || [];
        setLeads(Array.isArray(fetchedLeads) ? fetchedLeads : []);

        // Fetch all deals
        const dealsRes = await crmService.deals.getAll({ limit: 1000 });
        const fetchedDeals = dealsRes.data || dealsRes.data?.data || [];
        setDeals(Array.isArray(fetchedDeals) ? fetchedDeals : []);

        // Fetch all activities
        const activitiesRes = await crmService.activities.getAll({ limit: 1000 });
        const fetchedActivities = activitiesRes.data || activitiesRes.data?.data || [];
        setActivities(Array.isArray(fetchedActivities) ? fetchedActivities : []);

      } catch (err) {
        console.error("Error fetching sales dashboard data:", err);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute metrics from fetched Mongoose records
  const totalLeadsCount = leads.length;
  
  const hotCount = leads.filter(l => l.priority?.toUpperCase() === 'HOT').length;
  const warmCount = leads.filter(l => l.priority?.toUpperCase() === 'WARM').length;
  const coldCount = leads.filter(l => l.priority?.toUpperCase() === 'COLD').length;
  const temperatureBreakdown = `${hotCount} / ${warmCount} / ${coldCount}`;

  const dealsCount = deals.length;
  const followupsCount = activities.filter(a => a.type === "Follow-up").length;

  // Commented out dummy cards fallback dataset (CTO compliance)
  /*
  const cards = [
    { title: "Total Leads", value: "245", growth: "+10.5%" },
    { title: "Hot / Warm / Cold", value: "58 / 92 / 95", growth: "+8.4%" },
    { title: "Deals in Pipeline", value: "24", growth: "+6.7%" },
    { title: "Missed Follow-Ups", value: "18", growth: "-4.9%" },
  ];
  */

  const cards = [
    { title: "Total Leads", value: loading ? "Loading..." : totalLeadsCount.toLocaleString(), growth: "0% from last month" },
    { title: "Hot / Warm / Cold", value: loading ? "Loading..." : temperatureBreakdown, growth: "0% Growth" },
    { title: "Deals in Pipeline", value: loading ? "Loading..." : dealsCount.toLocaleString(), growth: "0% change" },
    { title: "Follow-Up Activities", value: loading ? "Loading..." : followupsCount.toLocaleString(), growth: "0% change" },
  ];

  // Filter real leads with "New" or "Contacted" status as pending follow-ups
  const pendingFollowups = leads
    .filter(l => l.status === "New" || l.status === "Contacted")
    .slice(0, 10); // Display top 10

  // Commented out dummy tableData dataset (CTO compliance)
  /*
  const tableData = [
    { name: "Rahul", owner: "Arjun", delay: "2h Late", priority: "Cold", status: "Open" },
    { name: "Neha", owner: "Neha", delay: "1 Day", priority: "Hot", status: "Open" },
    { name: "Pooja", owner: "Pooja", delay: "3 Days", priority: "Hot", status: "Open" },
    { name: "Riya", owner: "Rahul", delay: "5 Days", priority: "Warm", status: "Pending" },
  ];
  */

  // Commented out dummy AI items dataset (CTO compliance)
  /*
  const aiItems = [
    "Lead Priority Suggestions",
    "Deal Close Probability",
    "Best Time to Connect",
    "Auto Follow-Up Reminders",
    "Predicted Deal Value",
  ];
  */
  const aiItems = [];

  return (
    <DashboardLayout>
      <div style={container}>

        <h2 style={{ marginBottom: "20px" }}>Sales Dashboard</h2>

        {error && (
          <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#ef4444", borderRadius: "8px", marginBottom: "20px", border: "1px solid #fee2e2", fontSize: "14px" }}>
            {error}
          </div>
        )}

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
                {card.growth}
              </p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={flexRow}>

          <div style={{ ...cardStyle, flex: 2 }}>
            <h3>Monthly Revenue</h3>
            <div style={chartBox}>
              <p style={{ color: "#6b7280" }}>No monthly revenue records found in the database.</p>
            </div>
          </div>

          <div style={{ ...cardStyle, flex: 2 }}>
            <h3>Sales Funnel</h3>
            <div style={chartBox}>
              <p style={{ color: "#6b7280" }}>No funnel metrics available.</p>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div style={flexRow}>

          <div style={{ ...cardStyle, flex: 3 }}>
            <h3>Missed Follow-Ups & Pending Leads</h3>

            <table style={{ width: "100%", marginTop: "10px", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left" style={thStyle}>Lead</th>
                  <th align="left" style={thStyle}>Source</th>
                  <th align="left" style={thStyle}>Created At</th>
                  <th align="left" style={thStyle}>Priority</th>
                  <th align="left" style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {pendingFollowups.length === 0 ? (
                  <tr>
                    <td colSpan="5" align="center" style={{ padding: "24px", color: "#6b7280", borderBottom: "1px solid #eee" }}>
                      No pending follow-ups or leads found in the database.
                    </td>
                  </tr>
                ) : (
                  pendingFollowups.map((lead, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{lead.name}</td>
                      <td style={tdStyle}>{lead.source || "Other"}</td>
                      <td style={tdStyle}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td style={tdStyle}>{lead.priority || "Warm"}</td>
                      <td style={tdStyle}>{lead.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ ...cardStyle, flex: 1 }}>
            <h3>AI Intelligence Suggestions</h3>

            {aiItems.length === 0 ? (
              <div style={{ padding: '20px', color: '#6b7280', textAlign: 'center', fontSize: '14px', border: '1px dashed #e2e8f0', borderRadius: '8px', marginTop: '15px' }}>
                No AI recommendations available.
              </div>
            ) : (
              aiItems.map((item, i) => (
                <div key={i} style={aiBox}>
                  {item}
                </div>
              ))
            )}
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
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px dashed #e2e8f0",
  borderRadius: "8px",
};

const aiBox = {
  padding: "10px",
  border: "1px solid #eee",
  borderRadius: "6px",
  marginTop: "10px",
};

const thStyle = {
  padding: "10px 5px",
  borderBottom: "2px solid #e2e8f0",
  color: "#475569",
  fontSize: "13px",
  textTransform: "uppercase"
};

const tdStyle = {
  padding: "12px 5px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
  fontSize: "14px"
};

export default SalesDashboard;