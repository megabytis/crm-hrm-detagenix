import React, { useState, useEffect } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { dashboardService } from "../../services/dashboardService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer
} from "recharts";

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceChart, setAttendanceChart] = useState([]);
  const [earningsChart, setEarningsChart] = useState([]); // Placeholder for earnings since we don't have revenue route yet

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // Fire parallel requests
        const [dashRes, graphRes] = await Promise.all([
          dashboardService.getManagerDashboard(),
          dashboardService.getManagerGraph()
        ]);

        if (dashRes.success) {
          setDashboardData(dashRes.data);
        }

        if (graphRes.success && graphRes.data) {
          // Process graph data for Recharts: { date: "May 1", present: X, absent: Y }
          const groupedByDate = {};
          
          graphRes.data.forEach(entry => {
            const dateStr = new Date(entry._id.date).toLocaleDateString('en-US', { weekday: 'short' });
            if (!groupedByDate[dateStr]) {
              groupedByDate[dateStr] = { day: dateStr, present: 0, absent: 0, leave: 0 };
            }
            if (entry._id.status === 'present') groupedByDate[dateStr].present += entry.count;
            if (entry._id.status === 'absent') groupedByDate[dateStr].absent += entry.count;
            if (entry._id.status === 'leave') groupedByDate[dateStr].leave += entry.count;
          });

          setAttendanceChart(Object.values(groupedByDate));
        }

        // Temporary Earnings Placeholder until revenue module is ready
        setEarningsChart([
          { day: "Mon", earning: 40 },
          { day: "Tue", earning: 65 },
          { day: "Wed", earning: 60 },
          { day: "Thu", earning: 70 },
          { day: "Fri", earning: 62 }
        ]);

      } catch (err) {
        console.error("Failed to load manager dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: "40px", textAlign: "center" }}>Loading Dashboard Data...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div style={{ padding: "40px", textAlign: "center", color: "red" }}>{error}</div>
      </DashboardLayout>
    );
  }

  const { teamSummary, taskSummary, pendingApprovals, productivity, riskLevel } = dashboardData;

  return (
    <DashboardLayout>
      <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
        
        <h2 style={{ marginBottom: "20px", fontWeight: "600" }}>Manager Dashboard</h2>

        {/* Top Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          
          {[
            { title: "Team Members", value: teamSummary?.totalMembers || 0, sub: "Total Active" },
            { title: "Present / Absent Today", value: `${teamSummary?.present || 0} / ${teamSummary?.absent || 0}`, sub: `${teamSummary?.leave || 0} on leave` },
            { title: "Pending Approvals", value: pendingApprovals || 0, sub: "Leave & Expenses" },
            { title: "Completed Tasks", value: taskSummary?.completed || 0, sub: `${taskSummary?.overdueTasks || 0} overdue` }
          ].map((card, index) => (
            <div key={index} style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}>
              <h4 style={{ marginBottom: "10px", color: "#555" }}>{card.title}</h4>
              <h2 style={{ marginBottom: "5px" }}>{card.value}</h2>
              <p style={{ fontSize: "13px", color: "#4caf50" }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginTop: "20px" }}>
          
          {/* Attendance Chart */}
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <h4>Attendance Statistic</h4>

            <div style={{ height: "250px", marginTop: "15px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceChart.length ? attendanceChart : [{day: 'Mon', present: 0, absent: 0}]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke="#4caf50" strokeWidth={3} />
                  <Line type="monotone" dataKey="absent" stroke="#f44336" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Earnings Chart */}
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <h4>Total Earnings</h4>

            <div style={{ height: "250px", marginTop: "15px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="earning"
                    stroke="#2196f3"
                    fill="#bbdefb"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Tables Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
          
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <h4 style={{ marginBottom: "15px" }}>Team Tasks Outline</h4>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: "14px", color: "#777" }}>
                  <th>Category</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Completed", count: taskSummary?.completed || 0, status: "Completed" },
                  { name: "In Progress", count: taskSummary?.inProgress || 0, status: "In Progress" },
                  { name: "Pending", count: taskSummary?.pending || 0, status: "Pending" },
                  { name: "Overdue", count: taskSummary?.overdueTasks || 0, status: "Overdue" }
                ].map((row, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #eee", fontSize: "14px" }}>
                    <td style={{ padding: "10px 0" }}>{row.name}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <h4>Approvals Action Required</h4>
            <p style={{ color: "#777", marginTop: "10px" }}>
              You have {pendingApprovals || 0} pending request(s) awaiting your decision.
            </p>
          </div>

        </div>

        {/* AI Alerts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
          
          <div style={{
            background: productivity?.level === "Low" ? "#fdecea" : "#e8f5e9",
            padding: "15px",
            borderRadius: "10px"
          }}>
            <h4>AI Productivity Insights</h4>
            <p style={{ fontSize: "14px" }}>Productivity Level: {productivity?.level || "Unknown"} (Score: {productivity?.score || 0})</p>
          </div>

          <div style={{
            background: riskLevel !== "Low Risk" ? "#fdecea" : "#e8f5e9",
            padding: "15px",
            borderRadius: "10px"
          }}>
            <h4>AI Risk Alert</h4>
            <p style={{ fontSize: "14px" }}>{riskLevel || "No immediate risks detected."}</p>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;