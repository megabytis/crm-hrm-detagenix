import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import SalesActivityCard from "./SalesActivityCard";
import { crmService } from "../../services/crmService";
import "../../styles/layout.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const SalesActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Call',
    description: '',
    date: new Date().toISOString().split('T')[0],
    ipAddress: ''
  });

  // Delete activity handler
  const handleDeleteActivity = async (activityId) => {
    try {
      // Show confirmation dialog
      const confirmDelete = window.confirm("Are you sure you want to delete this activity?");
      if (!confirmDelete) return;

      // Call API to delete activity
      await crmService.activities.delete(activityId);
      
      // Update local state to remove the deleted activity
      setActivities(prevActivities => 
        prevActivities.filter(activity => activity._id !== activityId)
      );
      
      // Show success message
      alert("Activity deleted successfully!");
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity. Please try again.");
    }
  };

  // Add activity handler
  const handleAddActivity = async () => {
    try {
      setAddLoading(true);
      
      // Validate form
      if (!formData.description.trim()) {
        alert("Please enter a description for the activity.");
        return;
      }

      // Call API to create activity
      const response = await crmService.activities.create(formData);
      
      // Update local state to add the new activity
      if (response.data) {
        setActivities(prevActivities => [response.data, ...prevActivities]);
      }
      
      // Reset form and close modal
      setFormData({
        type: 'Call',
        description: '',
        date: new Date().toISOString().split('T')[0],
        ipAddress: ''
      });
      setShowAddModal(false);
      
      // Show success message
      alert("Activity added successfully!");
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to add activity. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'Call',
      description: '',
      date: new Date().toISOString().split('T')[0],
      ipAddress: ''
    });
    setShowAddModal(false);
  };

  // Fetch activities from API
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await crmService.activities.getAll();
      if (response.success && response.data) {
        setActivities(response.data);
      } else {
        setActivities(response.data || []);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError("Failed to fetch activities");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getActivityCounts = () => {
    const counts = {
      Call: 0,
      WhatsApp: 0,
      Meeting: 0,
      Email: 0,
      Other: 0,
    };

    activities.forEach((activity) => {
      const type = activity.type?.toLowerCase();
      if (type === "call") {
        counts.Call++;
      } else if (type === "whatsapp") {
        counts.WhatsApp++;
      } else if (type === "meeting") {
        counts.Meeting++;
      } else if (type === "email") {
        counts.Email++;
      } else {
        counts.Other++;
      }
    });

    return counts;
  };

  const counts = getActivityCounts();

  const [currentPage, setCurrentPage] = useState(1);
  const [activitiesPerPage] = useState(6);

  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = activities.slice(
    indexOfFirstActivity,
    indexOfLastActivity,
  );
  const totalPages = Math.ceil(activities.length / activitiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Get badge style for activity type
  const getActivityTypeStyle = (type) => {
    const styles = {
      Call: { bg: "#dbeafe", color: "#3b82f6", border: "#bfdbfe" },
      WhatsApp: { bg: "#d1fae5", color: "#10b981", border: "#a7f3d0" },
      Meeting: { bg: "#fef3c7", color: "#f59e0b", border: "#fde68a" },
      Email: { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
      Other: { bg: "#fce7f3", color: "#ec4899", border: "#fbcfe8" },
    };

    return (
      styles[type] || {
        bg: "#f3f4f6",
        color: "#6b7280",
        border: "#e5e7eb",
      }
    );
  };

  const getBadgeStyle = (status) => {
    const styles = {
      Completed: { bg: "#ecfdf5", color: "#16a34a", border: "#bbf7d0" },
      Pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
      "In Progress": { bg: "#dbeafe", color: "#2563eb", border: "#93c5fd" },
    };

    return (
      styles[status] || {
        bg: "#f3f4f6",
        color: "#6b7280",
        border: "#e5e7eb",
      }
    );
  };

  return (
    <DashboardLayout>
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f3f4f6",
          minHeight: "100vh",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
          CRM / Sales Activities
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <SalesActivityCard
            title="Calls"
            value={counts.Call}
            change="+18% this week"
            changeType="positive"
            icon="phone"
            color="#3b82f6"
          />

          <SalesActivityCard
            title="Emails"
            value={counts.Email}
            change="+12% last week"
            changeType="positive"
            icon="email"
            color="#22c55e"
          />

          <SalesActivityCard
            title="Whatsapp"
            value={counts.WhatsApp}
            change="+5% last week"
            changeType="positive"
            icon="whatsapp"
            color="#f59e0b"
          />

          <SalesActivityCard
            title="Meetings"
            value={counts.Meeting}
            change="-3% last week"
            changeType="negative"
            icon="calendar"
            color="#ec4899"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: "24px",
            marginTop: "24px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "16px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Interaction Analysis
            </h3>

            <div style={{ height: "220px" }}>
              <Pie
                data={{
                  labels: ["Calls", "Emails", "WhatsApp", "Meetings"],
                  datasets: [
                    {
                      data: [38, 31, 18, 13],
                      backgroundColor: [
                        "#0ea5e9",
                        "#93c5fd",
                        "#38bdf8",
                        "#e0f2fe",
                      ],
                      borderWidth: 0,
                      cutout: "60%",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        boxWidth: 10,
                        padding: 16,
                        font: {
                          size: 12,
                        },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.label} ${context.parsed}%`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3
              style={{
                margin: "0",
                fontSize: "16px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              AI Enhancements
            </h3>

            <div
              style={{
                background: "#e0f2fe",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "14px" }}>
                Follow-Up Reminders
              </div>
              <div
                style={{ fontSize: "12px", color: "#475569", marginTop: "6px" }}
              >
                3 Scheduled reminders
              </div>
            </div>

            <div
              style={{
                background: "#fce7f3",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "14px" }}>
                Interaction Insights
              </div>
              <div
                style={{ fontSize: "12px", color: "#475569", marginTop: "6px" }}
              >
                120+ points analyzed
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(14, 165, 233, 0.2)",
                width: "100%",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#0284c7";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#0ea5e9";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <span style={{ fontSize: "16px" }}>+</span>
              Add Activity
            </button>
          </div>
        </div>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                {[
                  "Type",
                  "Description",
                  "Date",
                  "IP Address",
                  "Created At",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "16px",
                    }}
                  >
                    Loading activities...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#ef4444",
                      fontSize: "16px",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : currentActivities.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "16px",
                    }}
                  >
                    No activities found
                  </td>
                </tr>
              ) : (
                currentActivities.map((activity) => {
                  const typeStyle = getActivityTypeStyle(activity.type);

                  return (
                    <tr
                      key={activity._id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: typeStyle.bg,
                            color: typeStyle.color,
                            border: `1px solid ${typeStyle.border}`,
                            fontWeight: 500,
                          }}
                        >
                          {activity.type}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                        {activity.description}
                      </td>

                      <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                        {new Date(activity.date).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                        {activity.ipAddress || "N/A"}
                      </td>

                      <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "18px",
                              cursor: "pointer",
                              color: "#9ca3af",
                              padding: "4px",
                              borderRadius: "4px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = "#f3f4f6";
                              e.target.style.color = "#6b7280";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = "none";
                              e.target.style.color = "#9ca3af";
                            }}
                            title="More options"
                          >
                            ⋯
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity._id)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "16px",
                              cursor: "pointer",
                              color: "#ef4444",
                              padding: "4px",
                              borderRadius: "4px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = "#fee2e2";
                              e.target.style.color = "#dc2626";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = "none";
                              e.target.style.color = "#ef4444";
                            }}
                            title="Delete activity"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              background: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "13px",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>

            <div style={{ display: "flex", gap: "6px" }}>
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;

                if (totalPages <= maxVisiblePages) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                      pages.push(i);
                    }
                    pages.push("...");
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push("...");
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    pages.push("...");
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push("...");
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      style={{
                        padding: "8px 4px",
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      style={{
                        minWidth: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        border:
                          page === currentPage
                            ? "1px solid #0ea5e9"
                            : "1px solid #e5e7eb",
                        background:
                          page === currentPage ? "#e0f2fe" : "#ffffff",
                        fontSize: "13px",
                        cursor: "pointer",
                        color: page === currentPage ? "#0ea5e9" : "#374151",
                        fontWeight: page === currentPage ? "500" : "400",
                      }}
                    >
                      {page}
                    </button>
                  ),
                );
              })()}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "13px",
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px",
              width: "500px",
              maxWidth: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Add New Activity
            </h3>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Activity Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#ffffff",
                }}
              >
                {/* Aligned frontend activity types strictly with backend Activity schema */}
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter activity description"
                rows="3"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                IP Address (Auto-detected by server)
              </label>
              <input
                type="text"
                name="ipAddress"
                value="Captured automatically by backend"
                readOnly
                disabled
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#f3f4f6", // visually disabled
                  color: "#9ca3af"
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
                onClick={resetForm}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = "#4b5563";
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = "#6b7280";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddActivity}
                disabled={addLoading || !formData.description.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: addLoading ? "#9ca3af" : "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: addLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s ease",
                  opacity: addLoading || !formData.description.trim() ? 0.7 : 1,
                }}
              >
                {addLoading ? "Adding..." : "Add Activity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SalesActivities;
