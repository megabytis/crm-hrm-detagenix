import React, { useState, useEffect } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { attendanceService } from "../../services/attendanceService";
import { userService } from "../../services/userService";
import { projectService } from "../../services/projectService";


const AttendanceManagement = () => {
  // State for attendance data
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toUpperCase() || "";
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [punchingIn, setPunchingIn] = useState(false);
  const [punchingOut, setPunchingOut] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myLogs, setMyLogs] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 4;
  const [currentPageTop, setCurrentPageTop] = useState(1);
  const rowsPerPageTop = 3;
  const [stats, setStats] = useState({
  present: 0,
  absent: 0,
  presentPercentage: 0,
  absentPercentage: 0,
});

useEffect(() => {
  fetchStats();
  fetchOverview();

  if (["ADMIN", "MANAGER", "HR"].includes(role)) {
    fetchAllAttendance();
  }

  if (["EMPLOYEE", "MANAGER", "HR"].includes(role)) {
    fetchMyAttendance();
  }

}, [role]);

  
// const fetchStats = async () => {
//   try {
//     const res = await attendanceService.getDashboardStats();

//     console.log("STATS:", res);

//     if (!res || typeof res !== "object") {
//       console.log("Stats API empty hai");
//       return;
//     }

//     setStats({
//       present: res.present ?? 0,
//       absent: res.absent ?? 0,
//       late: res.late ?? 0,
//     });

//   } catch (err) {
//     console.error("Stats error:", err);
//   }
// }; 
const fetchStats = async () => {
  try {
    // attendance data
    const attendanceRes = await attendanceService.getAllAttendance();
    const attendance = attendanceRes?.data || [];

    // users data
    const usersRes = await userService.getAll();
    const users = usersRes?.data || [];

    // total employees
    const totalEmployees = users.length;

    // today date
    const today = new Date().toDateString();

    // today's present count
    const present = attendance.filter((att) => {
      const attDate = new Date(att.date).toDateString();

      return (
        attDate === today &&
        (
          att.status?.toLowerCase() === "present" ||
          att.status?.toLowerCase() === "half day"
        )
      );
    }).length;

    // absent = total - present
    const absent = totalEmployees - present;

    // percentage
    const presentPercentage = totalEmployees
      ? ((present / totalEmployees) * 100).toFixed(1)
      : 0;

    const absentPercentage = totalEmployees
      ? ((absent / totalEmployees) * 100).toFixed(1)
      : 0;

    setStats({
      present,
      absent,
      presentPercentage,
      absentPercentage,
    });

  } catch (err) {
    console.error("Stats error:", err);
  }
};
const [overview, setOverview] = useState({
  totalEmployees: 0,
  activeEmployees: 0,
  onBench: 0
});

  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceService.getAllAttendance();

      if (response?.success) {
        setAttendanceData(response.data || []);
      } else {
        setError(response?.message || "Failed to fetch attendance data");
      }
    } catch (error) {
      console.error("Fetch attendance error:", error);
      setError("Failed to fetch attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };


 const fetchOverview = async () => {
  try {

    // all users
    const usersRes = await userService.getAll();
    console.log("USERS RES:", usersRes);

    const users = usersRes?.data || [];

    // all projects
    const projectsRes = await projectService.getProjectsByRole();
    console.log("PROJECTS RES:", projectsRes);

    const projects = projectsRes || [];

    // total employees
    const totalEmployees = users.length;

    const activeIds = new Set();

    // HR + MANAGER + BDE always active
    users.forEach((u) => {
      const role = u.role?.toUpperCase();

      if (
        role === "HR" ||
        role === "MANAGER" ||
        role === "BDE"
      ) {
        activeIds.add(u._id);
      }
    });

    // assigned employees active
    projects.forEach((project) => {
      project.assignedEmployees?.forEach((emp) => {
        activeIds.add(emp._id || emp);
      });
    });

    const activeEmployees = activeIds.size;

    const onBench = totalEmployees - activeEmployees;

    setOverview({
      totalEmployees,
      activeEmployees,
      onBench,
    });

  } catch (err) {
    console.error("Overview error:", err);
  }
};

const fetchMyAttendance = async () => {
    try {
      const res = await attendanceService.getMyAttendance();

      console.log("MY DATA 👉", res);

      setMyLogs(res || []); 
      // setMyLogs(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };
  const isLateCheckIn = (checkInTime) => {
    if (!checkInTime) return false;

    const checkIn = new Date(checkInTime);

    const officeTime = new Date(checkIn);
    officeTime.setHours(9, 30, 0, 0); 

    return checkIn > officeTime;
  };
 const handlePunchIn = async () => {
  try {
    setPunchingIn(true);

    const res = await attendanceService.punchIn();

    console.log("PUNCH IN RES 👉", res); 

    if (res) {   
      await fetchMyAttendance();

      try {
        await fetchStats(); 
      } catch (e) {
        console.log("Stats error ignore:", e);
      }

      alert("Punched in successfully!");
    }

  } catch (err) {
    alert(err.message);
  } finally {
    setPunchingIn(false);
  }
};

  
  const handlePunchOut = async () => {
  try {
    setPunchingOut(true);

    const res = await attendanceService.punchOut();

    console.log("PUNCH OUT RES 👉", res); 

    if (res) {   
      await fetchMyAttendance();

      try {
        await fetchStats(); 
      } catch (e) {
        console.log("Stats error ignore:", e);
      }

      alert("Punched out successfully!");
    }

  } catch (error) {
    alert(error.message);
  } finally {
    setPunchingOut(false);
  }
};

  // Calculate statistics from fetched data
  const calculateStats = () => {
    const present = attendanceData.filter(
      (att) => att.status === "Present",
    ).length;
    const absent = attendanceData.filter(
      (att) => att.status === "Absent",
    ).length;
    const late = attendanceData.filter((att) => att.status === "Late").length;

    return { present, absent, late };
  };

  // const stats = calculateStats();

  // Pagination calculations
  const totalPages = Math.ceil(attendanceData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = attendanceData.slice(indexOfFirstRow, indexOfLastRow);

  const topData = ["EMPLOYEE", "MANAGER", "HR"].includes(role)
    ? myLogs
    : attendanceData;

  const totalPagesTop = Math.ceil(topData.length / rowsPerPageTop);
  console.log("rowsPerPage 👉", rowsPerPage);

  const indexOfLastTop = currentPageTop * rowsPerPageTop;
  const indexOfFirstTop = indexOfLastTop - rowsPerPageTop;

  const currentTopRows = topData.slice(indexOfFirstTop, indexOfLastTop);
  console.log("myLogs length 👉", myLogs.length);
  console.log("totalPagesTop 👉", totalPagesTop);
  // Format date and time for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const time = new Date(timeString);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return presentBadge;
      case "Absent":
        return absentBadge;
      case "Late":
        return lateBadge;
      default:
        return presentBadge;
    }
  };

  // Generate employee ID from email or name
  const getEmployeeId = (employee) => {
    if (!employee) return "N/A";
    // Generate ID from email (first part before @) or use a default format
    if (employee.email) {
      return employee.email.split("@")[0].toUpperCase();
    }
    if (employee.name) {
      return employee.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    }
    return "EMP-" + employee._id?.slice(-6) || "UNKNOWN";
  };

  return (
    <DashboardLayout>
      <div
        style={{ padding: "20px", background: "#f5f6fa", minHeight: "100vh" }}
      >
        <h2 style={{ marginBottom: "20px", fontWeight: "600" }}>
          HRMS / Attendance Management
        </h2>

        {/* Top Section */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
          {/* Left Cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              width: "250px",
            }}
          >
            <div style={cardStyle}>
              <h4 style={{ margin: 0, color: "#555" }}>Present</h4>
              <h2 style={{ margin: "10px 0", color: "#000" }}>
                {stats.presentPercentage}
              </h2>
              <span style={{ color: "green", fontSize: "14px" }}>
                % this week
              </span>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, color: "#555" }}>Absent</h4>
              <h2 style={{ margin: "10px 0", color: "#000" }}>
               {stats.absentPercentage}
              </h2>
              <span style={{ color: "red", fontSize: "14px" }}>
                % this week
              </span>
            </div>

           
          </div>

         <div style={cardStyleFlex}>
  <h4 style={{ marginBottom: "20px" }}>Employee Overview</h4>

  <div
    style={{
      display: "flex",
      gap: "20px",
      flexWrap: "wrap",
    }}
  >
    {/* Total Employees */}
    {/* Total Employees */}
<div style={{ ...cardStyle, flex: "1", minWidth: "180px" }}>
  <h4 style={{ margin: 0, color: "#555" }}>Total Employees</h4>
  <h2 style={{ margin: "10px 0", color: "#000" }}>
    {overview.totalEmployees}
  </h2>
  <span style={{ color: "#888", fontSize: "13px" }}>
    Overall workforce
  </span>
</div>

{/* Active Employees */}
<div style={{ ...cardStyle, flex: "1", minWidth: "180px" }}>
  <h4 style={{ margin: 0, color: "#555" }}>Active Employees</h4>
  <h2 style={{ margin: "10px 0", color: "green" }}>
    {overview.activeEmployees}
  </h2>
  <span style={{ color: "green", fontSize: "13px" }}>
    Currently working
  </span>
</div>

{/* Bench Employees */}
<div style={{ ...cardStyle, flex: "1", minWidth: "180px" }}>
  <h4 style={{ margin: 0, color: "#555" }}>On Bench</h4>
  <h2 style={{ margin: "10px 0", color: "orange" }}>
    {overview.onBench}
  </h2>
  <span style={{ color: "orange", fontSize: "13px" }}>
    No active project
  </span>
</div>
  </div>
</div>
        </div>

        {/* Attendance Table Section */}
        {["ADMIN", "HR", "MANAGER"].includes(role) && (
          // ye pura table
          <div style={cardStyle}>
            {/* Table Header with Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ margin: 0, color: "#333" }}>
                All Employees Attendance
              </h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  // onClick={fetchAllAttendance}
                  onClick={async () => {
  await fetchAllAttendance();
  await fetchStats();
  await fetchOverview();
}}
                  disabled={loading}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    background: loading ? "#f5f5f5" : "#fff",
                    color: loading ? "#999" : "#333",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  🔄 Refresh
                </button>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: "#e3f2fd",
                    color: "#1976d2",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {attendanceData.length} Records
                </span>
              </div>
            </div>
            {/* Loading State */}
            {loading && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div
                  style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #3498db",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  Loading attendance data...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ color: "#e74c3c", marginBottom: "10px" }}>
                  {error}
                </div>
                <button
                  onClick={fetchAllAttendance}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#3498db",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Data Table */}
            {!loading && !error && (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fb", textAlign: "left" }}>
                      <th style={thStyle}>Employee ID</th>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Check-in</th>
                      <th style={thStyle}>Check-out</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.length > 0 ? (
                      currentRows.map((attendance) => (
                        <tr key={attendance._id}>
                          <td style={tdStyle}>
                            {getEmployeeId(attendance.employee)}
                          </td>
                          <td style={tdStyle}>
                            {attendance.employee?.name || "N/A"}
                          </td>
                          <td style={tdStyle}>{formatDate(attendance.date)}</td>
                          <td style={tdStyle}>
                            {formatTime(attendance.checkIn)}
                          </td>
                          <td style={tdStyle}>
                            {formatTime(attendance.checkOut)}
                          </td>
                          <td style={tdStyle}>
                            <span style={getStatusBadge(attendance.status)}>
                              {attendance.status}
                            </span>
                          </td>
                          <td style={tdStyle}>{attendance.remark}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#666",
                            fontStyle: "italic",
                          }}
                        >
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (num) => (
                        <button
                          key={num}
                          onClick={() => setCurrentPage(num)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            background:
                              currentPage === num ? "#00bcd4" : "#fff",
                            color: currentPage === num ? "#fff" : "#000",
                            cursor: "pointer",
                          }}
                        >
                          {num}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {showTaskModal && (
        <div style={overlayStyle}>
          <div style={modalCard}>
            <h2 style={{ marginBottom: "10px" }}>Today's Task</h2>

            <p style={{ marginBottom: "10px", color: "#555" }}>
              <strong>Description:</strong> Complete UI for Attendance Dashboard
              and fix API integration issues.
            </p>

            <p style={{ marginBottom: "20px", color: "#555" }}>
              <strong>Deadline:</strong> End of the day
            </p>

            <button onClick={() => setShowTaskModal(false)} style={closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalCard = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "350px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};

const closeBtn = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  background: "#00bcd4",
  color: "#fff",
  cursor: "pointer",
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const cardStyleFlex = {
  flex: 1,
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const thStyle = {
  padding: "12px",
  fontSize: "14px",
  color: "#666",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
};

const reviewBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#e0f7fa",
  color: "#00796b",
  cursor: "pointer",
};

const presentBadge = {
  padding: "4px 10px",
  borderRadius: "20px",
  background: "#e8f5e9",
  color: "green",
  fontSize: "12px",
};

const absentBadge = {
  padding: "4px 10px",
  borderRadius: "20px",
  background: "#ffebee",
  color: "red",
  fontSize: "12px",
};

const lateBadge = {
  padding: "4px 10px",
  borderRadius: "20px",
  background: "#fff3e0",
  color: "#ff9800",
  fontSize: "12px",
};

export default AttendanceManagement;
