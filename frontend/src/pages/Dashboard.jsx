import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import AlertCard from "../components/DashboardComponents/AlertCard";
import DashboardLayout from "../components/DashboardComponents/DashboardLayout";
import AttendanceTrend from "../components/DashboardComponents/AttendanceTrend";
import EmployeeGrowthTrend from "../components/DashboardComponents/EmployeeGrowthTrend";
import MonthlyRevenueChart from "../components/DashboardComponents/MonthlyRevenueChart";
import DownloadReports from "../components/DashboardComponents/DownloadReports";

import RiskAnomalyCard from "../components/DashboardComponents/RiskAnomalyCard";
import SecurityAlerts from "../components/DashboardComponents/SecurityAlerts";
import { crmService } from "../services/crmService";
import { userService } from "../services/userService";

export default function Dashboard() {
  // Commented out dummy count fallbacks (CTO compliance)
  // const [totalLeads, setTotalLeads] = useState(8420);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState(null);
  
  // Commented out dummy count fallbacks (CTO compliance)
  // const [totalCustomers, setTotalCustomers] = useState(3265);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState(null);

  // Commented out dummy count fallbacks (CTO compliance)
  // const [totalEmployees, setTotalEmployees] = useState(182);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);

  // Commented out dummy count fallbacks (CTO compliance)
  // const [totalUsers, setTotalUsers] = useState(1024);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // Fetch total leads count
  useEffect(() => {
    const fetchTotalLeads = async () => {
      try {
        setLeadsLoading(true);
        setLeadsError(null);
        
        const response = await crmService.leads.getAll({ limit: 1000 }); // Get all leads for count
        
        if (response.data && Array.isArray(response.data)) {
          // Backend returns { message: "All leads", data: leads }
          const leadsCount = response.data.length;
          setTotalLeads(leadsCount);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Alternative response structure
          const leadsCount = response.data.data.length;
          setTotalLeads(leadsCount);
        } else {
          console.error('Unexpected leads response format:', response);
          // Keep fallback value
        }
      } catch (error) {
        console.error('Error fetching total leads:', error);
        setLeadsError('Failed to fetch leads count');
        // Keep fallback value
      } finally {
        setLeadsLoading(false);
      }
    };

    fetchTotalLeads();
  }, []);

  // Fetch total customers count
  useEffect(() => {
    const fetchTotalCustomers = async () => {
      try {
        setCustomersLoading(true);
        setCustomersError(null);
        
        const response = await crmService.customers.getAll({ limit: 1000 }); // Get all customers for count
        
        if (response.success) {
          // Customer API returns { success: true, data: customers }
          const customersCount = response.data?.length || response.count || 0;
          setTotalCustomers(customersCount);
        } else if (response.data && Array.isArray(response.data)) {
          // Alternative response structure
          const customersCount = response.data.length;
          setTotalCustomers(customersCount);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Another alternative structure
          const customersCount = response.data.data.length;
          setTotalCustomers(customersCount);
        } else {
          console.error('Unexpected customers response format:', response);
          // Keep fallback value
        }
      } catch (error) {
        console.error('Error fetching total customers:', error);
        setCustomersError('Failed to fetch customers count');
        // Keep fallback value
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchTotalCustomers();
  }, []);

  // Fetch total employees count
  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        setEmployeesLoading(true);
        setEmployeesError(null);
        
        const response = await userService.getAll(); // Get all users
        
        if (response.success) {
          // User API returns { success: true, data: users }
          const allUsers = response.data || [];
          // Filter users with EMPLOYEE role
          const employees = allUsers.filter(user => user.role === 'EMPLOYEE');
          const employeesCount = employees.length;
          setTotalEmployees(employeesCount);
        } else if (response.data && Array.isArray(response.data)) {
          // Alternative response structure
          const allUsers = response.data;
          const employees = allUsers.filter(user => user.role === 'EMPLOYEE');
          const employeesCount = employees.length;
          setTotalEmployees(employeesCount);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Another alternative structure
          const allUsers = response.data.data;
          const employees = allUsers.filter(user => user.role === 'EMPLOYEE');
          const employeesCount = employees.length;
          setTotalEmployees(employeesCount);
        } else {
          console.error('Unexpected users response format:', response);
          // Keep fallback value
        }
      } catch (error) {
        console.error('Error fetching total employees:', error);
        setEmployeesError('Failed to fetch employees count');
        // Keep fallback value
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchTotalEmployees();
  }, []);

  // Fetch total users count
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        
        const response = await userService.getAll(); // Get all users
        
        if (response.success) {
          // User API returns { success: true, data: users }
          const allUsers = response.data || [];
          const usersCount = allUsers.length;
          setTotalUsers(usersCount);
        } else if (response.data && Array.isArray(response.data)) {
          // Alternative response structure
          const allUsers = response.data;
          const usersCount = allUsers.length;
          setTotalUsers(usersCount);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Another alternative structure
          const allUsers = response.data.data;
          const usersCount = allUsers.length;
          setTotalUsers(usersCount);
        } else {
          console.error('Unexpected users response format:', response);
          // Keep fallback value
        }
      } catch (error) {
        console.error('Error fetching total users:', error);
        setUsersError('Failed to fetch users count');
        // Keep fallback value
      } finally {
        setUsersLoading(false);
      }
    };

    fetchTotalUsers();
  }, []);
  return (
    <DashboardLayout>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }
.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

        .layout {
          display: flex;
          height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: 270px;
          background: #000000;
          color: white;
          padding: 20px;
        }

        .logo {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 30px;
        }

        .menu {
          list-style: none;
        }

        .menu li {
          padding: 12px;
          cursor: pointer;
          border-radius: 6px;
          margin-bottom: 5px;
        }

        .menu li:hover,
        .menu .active {
          background: #17A1CB;
        }

        .logout {
          margin-top: 30px;
          color: #f87171;
        }

        /* Main Area */
        .main {
          flex: 1;
          background: #f1f5f9;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          background: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .search {
          padding: 8px;
          width: 250px;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          border-radius: 50%;
        }

        .content {
          padding: 20px;
          overflow-y: auto;
        }

        .page-title {
          margin-bottom: 20px;
        }

        /* Cards Grid */
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .card {
          background: '#ffffff';
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          width:'267px';
          height:'150px';
        }

        .card h4 {
          color: #000000;
          margin-bottom: 15px;
          font-size: 12px;
        }

        .card h2 {
          margin-bottom: 5px;
        }

        .card p {
          font-size: 13px;
          color: #64748b;
        }

        .alert {
          border-left: 4px solid #f87171;
        }

        /* Bottom Section */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .chart-placeholder {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .chart-box {
          height: 220px;
          background: #e2e8f0;
          margin-top: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }
      `}</style>

      <h1 className="page-title">Dashboard</h1>

      {/* Top Stats */}
      <div className="grid">
        <StatCard
          title="Total Leads"
          value={leadsLoading ? "Loading..." : totalLeads.toLocaleString()}
          change={leadsError ? "Error loading data" : "0% from last month"}
          changeType={leadsError ? "negative" : "positive"}
          icon="✓"
          color={leadsError ? "#ef4444" : "#10b981"}
        />
        <StatCard
          title="Total Customers"
          value={customersLoading ? "Loading..." : totalCustomers.toLocaleString()}
          change={customersError ? "Error loading data" : "0% Growth"}
          changeType={customersError ? "negative" : "positive"}
          icon="✓"
          color={customersError ? "#ef4444" : "#10b981"}
        />
        <StatCard
          title="Employees"
          value={employeesLoading ? "Loading..." : totalEmployees.toLocaleString()}
          change={employeesError ? "Error loading data" : "0% new this month"}
          changeType={employeesError ? "negative" : "positive"}
          icon="✓"
          color={employeesError ? "#ef4444" : "#10b981"}
        />
        <StatCard
          title="Users"
          value={usersLoading ? "Loading..." : totalUsers.toLocaleString()}
          change={usersError ? "Error loading data" : "Online right now"}
          changeType={usersError ? "negative" : "neutral"}
          icon="👥"
          color={usersError ? "#ef4444" : "#10b981"}
        />
      </div>

      {/* Alerts */}
      <div className="grid">
        <AlertCard
          title="AI Alerts"
          value="0 New Alerts"
          subtitle="Review Required"
        />
        <AlertCard
          title="AI Credits Usage"
          value="0% Credits Used"
          subtitle="Upgrade Recommended"
        />
        <AlertCard
          title="SLA Breaches"
          value="0 Violations"
          subtitle="Immediate Action Needed"
        />
        <AlertCard
          title="System Health"
          value="0% System Stable"
          subtitle="All Services Running"
        />
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        <MonthlyRevenueChart />

        <div className="chart-placeholder">
          <h3>Sales Funnel</h3>
          <div className="chart-box">Chart Placeholder</div>
        </div>

        {/* <div className="chart-placeholder">
    <h3>Attendance Trend</h3>
    <div className="chart-box">Chart Placeholder</div>
  </div> */}
        <AttendanceTrend />

        <EmployeeGrowthTrend />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "8px",
          marginTop: "20px",
          width: "100%",
        }}
      >
        <RiskAnomalyCard />
        <SecurityAlerts />
      </div>

      {/* Download Reports Section */}
      <div style={{ marginTop: "20px" }}>
        <DownloadReports />
      </div>
    </DashboardLayout>
  );
}
