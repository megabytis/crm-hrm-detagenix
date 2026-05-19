import React, { useState, useEffect } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { attendanceService } from "../../services/attendanceService";
import { leaveService } from "../../services/leaveService";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

  const [leaveStats, setLeaveStats] = useState({
    totalLeaves: 4,
    usedLeaves: 0,
    remainingLeaves: 4,
  });

  // Fetch all employees attendance on component mount
  useEffect(() => {
    if (["EMPLOYEE", "MANAGER", "HR"].includes(role)) {
      fetchMyAttendance();
    }
  }, [role]);
  useEffect(() => {
    fetchLeaveStats();
  }, []);

  useEffect(() => {
  if (["ADMIN", "SUPERADMIN"].includes(role)) {
    fetchAllAttendance();
  }
}, [role]);

  const fetchLeaveStats = async () => {
    try {
     const response = await leaveService.getLeaveStats(user.id);

      setLeaveStats(response);
    } catch (error) {
      console.error(error);
    }
  };
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
  const TOTAL_LEAVES = 4;

  const data = ["EMPLOYEE", "MANAGER", "HR"].includes(role)
    ? myLogs
    : attendanceData;

  // sirf current month ka data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyData = data.filter((att) => {
    const d = new Date(att.date || att.checkIn);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // leaves count
  const leavesTaken = monthlyData.filter(
    (att) => att.status === "Absent",
  ).length;

  const remainingLeaves = TOTAL_LEAVES - leavesTaken;

  // extra leaves (negative case)
  const extraLeaves =
    leavesTaken > TOTAL_LEAVES ? leavesTaken - TOTAL_LEAVES : 0;
  // const fetchMyAttendance = async () => {
  //   try {
  //     const res = await attendanceService.getMyAttendance();

  //     console.log("MY DATA 👉", res);

  //     setMyLogs(res || []); // 👈 yahi fix hai
  //     // setMyLogs(res?.data || []);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  
  const fetchMyAttendance = async () => {
  try {
    setLoading(true);
    setError(null);

    const res = await attendanceService.getMyAttendance();

    console.log("MY DATA 👉", res);

    setMyLogs(res || []);
  } catch (err) {
    console.error(err);
    setError("Failed to fetch attendance");
  } finally {
    setLoading(false);
  }
};

  const isLateCheckIn = (checkInTime) => {
    if (!checkInTime) return false;

    const checkIn = new Date(checkInTime);

    const officeTime = new Date(checkIn);
    officeTime.setHours(9, 30, 0, 0); // 9:30 AM

    return checkIn > officeTime;
  };
  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);

    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };
  const handlePunchIn = async () => {
    try {
      setPunchingIn(true);

      const res = await attendanceService.punchIn();

      if (res?.success) {
        await fetchMyAttendance(); // 👈 important
        alert("Punched in successfully!");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setPunchingIn(false);
    }
  };

  // Handle Punch Out
  const handlePunchOut = async () => {
    try {
      setPunchingOut(true);

      const res = await attendanceService.punchOut();

      if (res?.success) {
        await fetchMyAttendance(); // 👈 refresh real data
        alert("Punched out successfully!");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setPunchingOut(false);
    }
  };

  // Current week data
const getWeeklyStats = () => {
  const today = new Date();

  const weeklyData = data.filter((att) => {
    const attDate = new Date(att.checkIn || att.date);

    // difference in days
    const diffTime = today - attDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // sirf last 7 days ka data
    return diffDays >= 0 && diffDays <= 7;
  });

  console.log("Weekly Data 👉", weeklyData);

 const presentCount = weeklyData.filter(
  (att) =>
    att.status?.toLowerCase() === "present" ||
    att.status?.toLowerCase() === "half day"
).length;

  const absentCount = weeklyData.filter(
    (att) => att.status?.toLowerCase() === "absent"
  ).length;

  const total = presentCount + absentCount;

  return {
    presentPercentage:
      total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0,

    absentPercentage:
      total > 0 ? ((absentCount / total) * 100).toFixed(1) : 0,
  };
};

const weeklyStats = getWeeklyStats();

  // Calculate statistics from fetched data
  // const calculateStats = () => {
  //   const present = attendanceData.filter(
  //     (att) => att.status === "Present",
  //   ).length;
  //   const absent = attendanceData.filter(
  //     (att) => att.status === "Absent",
  //   ).length;
  //   const late = attendanceData.filter((att) => att.status === "Late").length;

  //   return { present, absent, late };
  // };

  // const stats = calculateStats();
 const calculateStats = () => {
  const statsData = ["EMPLOYEE", "MANAGER", "HR"].includes(role)
    ? myLogs
    : attendanceData;

  let present = 0;
  let absent = 0;
  let late = 0;

  statsData.forEach((att) => {
    const status = att.status?.toLowerCase();

    if (status === "present") {
      present += 1;
    } 
    else if (status === "absent") {
      absent += 1;
    } 
    else if (status === "half day") {
      present += 0.5;
      absent += 0.5;
    } 
    else if (status === "late") {
      late += 1;
    }
  });

  return { present, absent, late };
};
const stats = calculateStats();

  // Pagination calculations
  const totalPages = Math.ceil(myLogs.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = myLogs.slice(indexOfFirstRow, indexOfLastRow);

  const topData = ["EMPLOYEE", "MANAGER", "HR"].includes(role)
    ? myLogs.filter((log) => isToday(log.checkIn))
    : attendanceData.filter((att) => isToday(att.date));

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
                {stats.present}
              </h2>
              <span style={{ color: "green", fontSize: "14px" }}>
  {weeklyStats.presentPercentage}% this week
</span>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, color: "#555" }}>Absent</h4>
              <h2 style={{ margin: "10px 0", color: "#000" }}>
                {stats.absent}
              </h2>
              <span style={{ color: "red", fontSize: "14px" }}>
  {weeklyStats.absentPercentage}% this week
</span>
            </div>

            <div style={cardStyle}>
              <h4 style={{ margin: 0, color: "#555", marginBottom: "15px" }}>
                Today's Status
              </h4>
              <p style={{ margin: "10px 0", fontSize: "14px", color: "#666" }}>
                Use Punch In/Out buttons to mark attendance
              </p>

              {["EMPLOYEE", "MANAGER", "HR"].includes(role) && (
                <div
                  style={{ marginTop: "15px", display: "flex", gap: "10px" }}
                >
                  <button
                    onClick={handlePunchIn}
                    disabled={punchingIn}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: punchingIn ? "#ccc" : "#4caf50",
                      color: "white",
                      cursor: punchingIn ? "not-allowed" : "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {punchingIn ? "Punching In..." : "Punch In"}
                  </button>

                  <button
                    onClick={handlePunchOut}
                    disabled={punchingOut}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      background: punchingOut ? "#ccc" : "#f44336",
                      color: "white",
                      cursor: punchingOut ? "not-allowed" : "pointer",
                      fontSize: "14px",
                    }}
                  >
                    {punchingOut ? "Punching Out..." : "Punch Out"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={cardStyleFlex}>
            {/* <h4 style={{ marginBottom: "15px" }}>Anomalies detected</h4> */}
            <h4 style={{ marginBottom: "15px" }}>
              {["EMPLOYEE", "MANAGER", "HR"].includes(role)
                ? "Today's Activity"
                : "Anomalies detected"}
            </h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
             
              <thead>
                {["EMPLOYEE", "MANAGER", "HR"].includes(role) ? (
                  <tr style={{ background: "#f8f9fb", textAlign: "left" }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Punch In</th>
                    <th style={thStyle}>Punch Out</th>
                    <th style={thStyle}>Task</th>
                    <th style={thStyle}>Submit Report</th>
                  </tr>
                ) : (
                  <tr>
                    <th style={thStyle}>Employee</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Description</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {["EMPLOYEE", "MANAGER", "HR"].includes(role) ? (
                  currentTopRows.length > 0 ? (
                    currentTopRows.map((log, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{log.employee?.name || "You"}</td>

                        <td style={tdStyle}>
                          {log.checkIn
                            ? new Date(log.checkIn).toLocaleTimeString()
                            : "—"}
                        </td>

                        <td style={tdStyle}>
                          {log.checkOut
                            ? new Date(log.checkOut).toLocaleTimeString()
                            : "—"}
                        </td>

                        <td style={tdStyle}>
                          <button
                            style={reviewBtn}
                            onClick={() => setShowTaskModal(true)}
                          >
                            Task
                          </button>
                        </td>
                        <td style={tdStyle}>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => handleFileUpload(e, log)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        No activity yet
                      </td>
                    </tr>
                  )
                ) : currentTopRows.length > 0 ? (
                  currentTopRows.map((item) => (
                    <tr key={item._id}>
                      <td style={tdStyle}>{item.employee?.name}</td>
                      <td style={tdStyle}>{formatDate(item.date)}</td>
                      <td style={tdStyle}>{item.status}</td>
                      <td style={tdStyle}>
                        <button style={reviewBtn}>Review</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPagesTop > 1 && (
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {Array.from({ length: totalPagesTop }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentPageTop(num)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "5px",
                        border: "1px solid #ddd",
                        background: currentPageTop === num ? "#00bcd4" : "#fff",
                        color: currentPageTop === num ? "#fff" : "#000",
                        cursor: "pointer",
                      }}
                    >
                      {num}
                    </button>
                  ),
                )}
              </div>
            )}
            <div style={{ marginTop: "30px" }}>
              {/* ✅ Inline CSS (JSX ke andar hi) */}
              <style>
                {`
      .present-day {
        background: #4caf50 !important;
        color: white !important;
        border-radius: 50%;
      }

      .absent-day {
        background: #f44336 !important;
        color: white !important;
        border-radius: 50%;
      }

      .late-day {
        background: #ff9800 !important;
        color: white !important;
        border-radius: 50%;
      }

      .weekend {
        background: #e0e0e0 !important;
        color: #555 !important;
        border-radius: 50%;
      }
    `}
              </style>

              <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
                {/* 📅 Calendar */}
                <div style={{ flex: 2 }}>
                  <style>
                    {`
 
 
    /* sirf shape fix */
.react-calendar__tile {
width: 20px !important;
  height: 35px !important;
  border-radius: 250% !important;
  aspect-ratio: 2 / 2;
}
  .react-calendar__tile {
  padding: 6px !important;
}
  
  .present-day { background: #4caf50 !important; }
.absent-day { background: #f44336 !important; }
.late-day { background: #ff9800 !important; }
.weekend { background: #e0e0e0 !important; }
`}
                  </style>
                  <Calendar
                    tileClassName={({ date, view }) => {
                      if (view === "month") {
                        const data = ["EMPLOYEE", "MANAGER", "HR"].includes(
                          role,
                        )
                          ? myLogs
                          : attendanceData;

                        const record = data.find(
                          (att) =>
                            att.checkIn &&
                            new Date(att.checkIn).toDateString() ===
                              date.toDateString(),
                        );
                        if (record?.status === "Present") return "present-day";
                        if (record?.status === "Absent") return "absent-day";
                        if (record?.status === "Late") return "late-day";

                        if (date.getDay() === 0 || date.getDay() === 6) {
                          return "weekend";
                        }
                      }
                    }}
                  />

                  {/* Legend */}
                  <div style={{ marginTop: "10px", fontSize: "14px" }}>
                    🟢 Present &nbsp; 🔴 Absent &nbsp; 🟠 Late &nbsp; ⚪ Weekend
                  </div>
                </div>

                {/*  Leave Cards */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <div style={cardStyle}>
                    <h4>Total Leaves</h4>
                    <h2>{leaveStats.totalLeaves}</h2>
                  </div>

                  <div style={cardStyle}>
                    <h4>Leaves Taken</h4>
                    <h2 style={{ color: "red" }}>
  {leaveStats.usedLeaves}
</h2>
                  </div>

                  <div style={cardStyle}>
                    <h4>Remaining</h4>
                    <h2
                      style={{ color: remainingLeaves < 0 ? "red" : "green" }}
                    >
                     {leaveStats.remainingLeaves}
                    </h2>
                  </div>

                  {extraLeaves > 0 && (
                    <div style={cardStyle}>
                      <h4>Extra Leaves</h4>
                      <h2 style={{ color: "orange" }}>{extraLeaves}</h2>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table Section */}
        {["EMPLOYEE", "HR", "MANAGER"].includes(role) && (
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
              <h4 style={{ margin: 0, color: "#333" }}>My Attendance</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
  onClick={async () => {
    await fetchMyAttendance();
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
  {loading ? "Refreshing..." : "🔄 Refresh"}
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
                  {myLogs.length} Records
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
                  onClick={fetchMyAttendance}
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
                  {/* <thead>
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
                  </tbody> */}
                  <thead>
                    <tr style={{ background: "#f8f9fb", textAlign: "left" }}>
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
                          <td style={tdStyle}>{attendance.remark || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center" }}>
                          No attendance found
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
