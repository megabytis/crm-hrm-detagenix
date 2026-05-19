import React, { useState, useEffect } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { leaveService } from "../../services/leaveService";

const LeaveManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // State for API data
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  // const user = JSON.parse(localStorage.getItem("user") || "{}"); // get user from localstorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

const user = storedUser.user || storedUser;

console.log("USER:", user);
console.log("USER ID:", user?._id);
  const role = user?.role?.toUpperCase() || "";

  // Default view
  const getDefaultView = () => {
    if (role === "ADMIN") return "ALL";
    return "MY";
  };

  const [view, setView] = useState(getDefaultView());

  // Form state for apply leave
  const [newLeave, setNewLeave] = useState({
    leaveType: "Sick",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [leaveStats, setLeaveStats] = useState({
  totalLeaves: 4,
  usedLeaves: 0,
  remainingLeaves: 4
});

  // Fetch all leaves (Admin/HR view)
  // const fetchAllLeaves = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await leaveService.getAllLeaves();
  //     setLeaveData(response|| []); // Response is directly an array
  //     setError(null);
  //   } catch (error) {
  //     console.error('Error fetching leaves:', error);
  //     setError(error?.message || 'Failed to fetch leave data');
  //     setLeaveData([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchLeaves = async () => {
    try {
      setLoading(true);

      let response;

      if (view === "ALL") {
        response = await leaveService.getAllLeaves();
      } else {
        response = await leaveService.getMyLeaves();
      }

      // console.log("LEAVE RESPONSE:", response);

      setLeaveData(Array.isArray(response) ? response : response?.leaves || []);

      setError(null);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setError(error?.message || "Failed to fetch leave data");
      setLeaveData([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchLeaveStats = async () => {
  try {

   const response = await leaveService.getLeaveStats(user.id);
    console.log("LEAVE STATS RESPONSE:", response);

    // setLeaveStats(response);
    setLeaveStats(response);

  } catch (error) {
    console.error("Error fetching leave stats:", error);
  }
};

  // Apply for leave
  const handleApplyLeave = async () => {
    try {
      const response = await leaveService.applyLeave(newLeave);

      // Show success popup
      setSuccessMessage("Leave application submitted successfully!");
      setShowSuccessPopup(true);

      // Reset form and close modal
      setShowApplyModal(false);
      setNewLeave({
        leaveType: "Sick",
        fromDate: "",
        toDate: "",
        reason: "",
      });

      // Refresh data
      await fetchLeaves();
    } catch (error) {
      console.error("Error applying leave:", error);
      alert("Failed to apply for leave. Please try again.");
    }
  };

  const handleUpdateStatus = async (leaveId, newStatus) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [leaveId]: true }));

      await leaveService.updateLeaveStatus(leaveId, newStatus);

      setSuccessMessage(`Leave ${newStatus} successfully!`);
      setShowSuccessPopup(true);

      await fetchLeaves();
    } catch (error) {
      console.error("Error updating leave status:", error);
      alert("Error updating leave status");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [leaveId]: false }));
    }
  };
  // Calculate statistics
  const calculateStats = () => {
    const pending = leaveData.filter(
      (leave) => leave.status === "Pending",
    ).length;
    const approved = leaveData.filter(
      (leave) => leave.status === "Approved",
    ).length;
    const rejected = leaveData.filter(
      (leave) => leave.status === "Rejected",
    ).length;

    return { pending, approved, rejected, total: leaveData.length };
  };
  const stats = calculateStats();

  // const stats = calculateStats();

  // Fetch data on component mount
  // useEffect(() => {
  //   fetchAllLeaves();
  // }, []);
  useEffect(() => {
  fetchLeaves();
  fetchLeaveStats();
}, [view]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date Error";
    }
  };

  // Calculate duration
  const calculateDuration = (fromDate, toDate) => {
    if (!fromDate || !toDate) return "N/A";
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  const totalPages = Math.ceil(leaveData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = leaveData.slice(indexOfFirst, indexOfLast);

  return (
    <DashboardLayout>
      <div
        style={{ padding: "20px", background: "#f4f6f9", minHeight: "100vh" }}
      >
        <h2 style={{ marginBottom: "20px" }}>HRMS / Leave Management</h2>

        {(role === "HR" || role === "MANAGER") && (
          <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setView("MY")}
              style={{
                padding: "8px 14px",
                background: view === "MY" ? "#00bcd4" : "#eee",
                color: view === "MY" ? "#fff" : "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              My Leaves
            </button>

            <button
              onClick={() => setView("ALL")}
              style={{
                padding: "8px 14px",
                background: view === "ALL" ? "#00bcd4" : "#eee",
                color: view === "ALL" ? "#fff" : "#000",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              All Employees
            </button>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowApplyModal(true)}
            style={{
              padding: "10px 20px",
              background: "#00bcd4",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Apply for Leave
          </button>
        </div>

        {/* Top Section */}
        {/* <div style={topGrid}>
         
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <StatCard
              title="New Requests"
              value={stats.pending}
              growth="0% this week"
              color="green"
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              growth="0% this week"
              color="red"
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              growth="0% this week"
              color="green"
            />
          </div>

        
          <div style={card}>
            <h4 style={{ marginBottom: "10px" }}>AI Recommendation</h4>

            <p
              style={{
                fontSize: "13px",
                color: "#777",
                marginBottom: "15px",
                lineHeight: "20px",
              }}
            >
              AI-powered leave approval suggestions based on employee behavior
              and leave history.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[
                "--",
                "--",
                "--",
                "--",
              ].map((name, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    background: "#f8f9fb",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <p
                      style={{ margin: 0, fontSize: "14px", fontWeight: "500" }}
                    >
                      {name}
                    </p>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      0 Days Leave
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#28a745",
                      background: "#e8f5e9",
                      padding: "4px 10px",
                      borderRadius: "20px",
                    }}
                  >
                    Recommended
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button style={primaryBtn}>Review</button>
            </div>
          </div>
        </div> */}
        {role === "ADMIN" || view === "ALL" ? (
          // 🔴 ADMIN CARDS (ALL VIEW)
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "20px",
              marginBottom: "20px",
              maxWidth: "750px",
            }}
          >
            <StatCard title="New Requests" value={stats.pending} />
            <StatCard title="Pending" value={stats.pending} />
            <StatCard title="Approved" value={stats.approved} />
          </div>
        ) : (
          // 🟢 EMPLOYEE CARDS (MY VIEW)
          <div style={{ display: "flex", gap: "20px" }}>
            <StatCard
  title="Total Leaves"
  value={leaveStats.totalLeaves}
/>

<StatCard
  title="Used Leaves"
  value={leaveStats.usedLeaves}
/>

<StatCard
  title="Remaining Leaves"
  value={leaveStats.remainingLeaves}
/>
            <StatCard title="WFH Days" value={2} />
          </div>
        )}

        {/* Leave Table */}
        <div style={{ ...card, marginTop: "20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f3f6" }}>
                <th style={th}>Employee ID</th>
                <th style={th}>Name</th>
                <th style={th}>From Date</th>
                <th style={th}>Leave Type</th>
                <th style={th}>Duration</th>
                <th style={th}>Status</th>
                {view === "ALL" &&
                  (role === "ADMIN" || role === "HR" || role === "MANAGER") && (
                    <th style={th}>Action</th>
                  )}
              </tr>
            </thead>
            <tbody>
              {/* Simple Test: Show data directly */}
              {leaveData.length > 0 ? (
                leaveData.map((leave, index) => (
                  <tr key={leave._id || index}>
                    <td style={td}>{leave.employee?._id || "N/A"}</td>
                    <td style={td}>{leave.employee?.name || "Unknown"}</td>
                    <td style={td}>{formatDate(leave.fromDate)}</td>
                    <td style={td}>{leave.leaveType}</td>
                    <td style={td}>
                      {calculateDuration(leave.fromDate, leave.toDate)}
                    </td>
                    <td style={td}>
                      <span style={getStatusStyle(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                    {view === "ALL" &&
                      (role === "ADMIN" ||
                        role === "HR" ||
                        role === "MANAGER") && (
                        <td style={td}>
                          {leave.status === "Pending" && (
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(leave._id, "Approved")
                                }
                                disabled={updatingStatus[leave._id]}
                                style={{
                                  padding: "4px 8px",
                                  background: updatingStatus[leave._id]
                                    ? "#ccc"
                                    : "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: updatingStatus[leave._id]
                                    ? "not-allowed"
                                    : "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                {updatingStatus[leave._id] ? "..." : "Approve"}
                              </button>

                              <button
                                onClick={() =>
                                  handleUpdateStatus(leave._id, "Rejected")
                                }
                                disabled={updatingStatus[leave._id]}
                                style={{
                                  padding: "4px 8px",
                                  background: updatingStatus[leave._id]
                                    ? "#ccc"
                                    : "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: updatingStatus[leave._id]
                                    ? "not-allowed"
                                    : "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                {updatingStatus[leave._id] ? "..." : "Reject"}
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                  </tr>
                ))
              ) : loading ? (
                <tr>
                  <td
                    colSpan={
                      view === "ALL" &&
                      (role === "ADMIN" || role === "HR" || role === "MANAGER")
                        ? 7
                        : 6
                    }
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    Loading leave data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={
                      view === "ALL" &&
                      (role === "ADMIN" || role === "HR" || role === "MANAGER")
                        ? 7
                        : 6
                    }
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "red",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={
                      view === "ALL" &&
                      (role === "ADMIN" || role === "HR" || role === "MANAGER")
                        ? 7
                        : 6
                    }
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={pagination}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={pageBtn}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  ...pageBtn,
                  background: currentPage === num ? "#00bcd4" : "#fff",
                  color: currentPage === num ? "#fff" : "#000",
                }}
              >
                {num}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={pageBtn}
            >
              Next
            </button>
          </div>
        </div>

        {/* Apply Leave Modal */}
        {showApplyModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                width: "500px",
                maxWidth: "90%",
              }}
            >
              <h3 style={{ marginBottom: "20px" }}>Apply for Leave</h3>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                  }}
                >
                  Leave Type
                </label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) =>
                    setNewLeave({ ...newLeave, leaveType: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <option value="Sick">Sick Leave</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Earned">Earned Leave</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                  }}
                >
                  From Date
                </label>
                <input
                  type="date"
                  value={newLeave.fromDate}
                  onChange={(e) =>
                    setNewLeave({ ...newLeave, fromDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                  }}
                >
                  To Date
                </label>
                <input
                  type="date"
                  value={newLeave.toDate}
                  onChange={(e) =>
                    setNewLeave({ ...newLeave, toDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                  }}
                >
                  Reason
                </label>
                <textarea
                  value={newLeave.reason}
                  onChange={(e) =>
                    setNewLeave({ ...newLeave, reason: e.target.value })
                  }
                  placeholder="Enter reason for leave..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setNewLeave({
                      leaveType: "Sick",
                      fromDate: "",
                      toDate: "",
                      reason: "",
                    });
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyLeave}
                  disabled={
                    !newLeave.fromDate || !newLeave.toDate || !newLeave.reason
                  }
                  style={{
                    padding: "8px 16px",
                    background:
                      !newLeave.fromDate || !newLeave.toDate || !newLeave.reason
                        ? "#ccc"
                        : "#00bcd4",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      !newLeave.fromDate || !newLeave.toDate || !newLeave.reason
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Apply Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: "1000",
            }}
            onClick={() => setShowSuccessPopup(false)}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                maxWidth: "400px",
                width: "90%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#e8f5e9",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="green"
                  strokeWidth="2"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 style={{ margin: "0 0 10px", color: "#333" }}>Success!</h3>

              <p
                style={{ margin: "0 0 20px", color: "#666", fontSize: "14px" }}
              >
                {successMessage}
              </p>

              <button
                style={{
                  padding: "10px 20px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onClick={() => setShowSuccessPopup(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

/* Components */

const StatCard = ({ title, value, growth, color }) => (
  <div style={card}>
    <p style={{ fontSize: "14px", color: "#666" }}>{title}</p>
    <h3 style={{ margin: "5px 0" }}>{value}</h3>
    <p style={{ fontSize: "12px", color }}>{growth}</p>
  </div>
);

/* Styles */

const topGrid = {
  display: "grid",
  gridTemplateColumns: "250px 1fr",
  gap: "20px",
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const primaryBtn = {
  padding: "8px 14px",
  background: "#00bcd4",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
};

const th = {
  padding: "10px",
  textAlign: "left",
  color: "#666",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const getStatusStyle = (status) => {
  if (status === "Approved")
    return {
      padding: "4px 10px",
      background: "#e8f5e9",
      color: "green",
      borderRadius: "20px",
      fontSize: "12px",
    };
  if (status === "Pending")
    return {
      padding: "4px 10px",
      background: "#fff3cd",
      color: "#856404",
      borderRadius: "20px",
      fontSize: "12px",
    };
  return {
    padding: "4px 10px",
    background: "#ffebee",
    color: "red",
    borderRadius: "20px",
    fontSize: "12px",
  };
};

const pagination = {
  marginTop: "15px",
  display: "flex",
  justifyContent: "center",
  gap: "8px",
};

const pageBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

export default LeaveManagement;
