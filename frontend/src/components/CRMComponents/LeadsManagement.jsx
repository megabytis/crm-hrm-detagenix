import { useState, useEffect } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import "../../styles/layout.css";
import { crmService } from "../../services/crmService";
import {
  HiOutlineUsers,
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineBolt,
  HiOutlineFire,
} from "react-icons/hi2";

import { WiDayCloudy, WiSnow } from "react-icons/wi";

const LeadsManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newLead, setNewLead] = useState({
    leadId: "",
    name: "",
    email: "",
    phone: "",
    source: "Website",
    status: "New",
     priority: "Warm"
  });
  const [editingLead, setEditingLead] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    source: "Website",
    status: "New",
     priority: "Warm",
     leadId: "",
  });

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await crmService.leads.getAll();
      if (response.success && response.data) {
        setLeads(response.data);
      } else {
        setLeads(response.data || []);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);
  const generateLeadId = () => {
  const companyShort = "DTGNX";
  const year = new Date().getFullYear();

  const nextNumber = String(leads.length + 1).padStart(3, "0");

  return `${companyShort}${year}${nextNumber}`;
};

  // Handle Edit Lead
  const handleEditLead = (lead) => {
    setEditingLead({
      _id: lead._id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
       priority: lead.priority
    });
    setShowEditModal(true);
  };

  // Handle Delete Lead
  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await crmService.leads.delete(leadId);
        // Refresh leads list after deletion
        fetchLeads();
        alert('Lead deleted successfully!');
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
      }
    }
  };

  // Handle Add Lead
  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email || !newLead.phone) {
      alert('Please fill in all required fields: Name, Email, and Phone');
      return;
    }

    try {
      setLoading(true);
      const response = await crmService.leads.create(newLead);
      
      // Show success popup
      setSuccessMessage(`Lead "${newLead.name}" created successfully!`);
      setShowSuccessPopup(true);
      
      // Reset form
      setNewLead({
        name: "",
        email: "",
        phone: "",
        source: "Website",
        status: "New",
        priority: "Warm"
      });
      
      // Close modal
      setShowAddModal(false);
      
      // Refresh leads list
      await fetchLeads();
      
      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating lead:', error);
      alert(`Error creating lead: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Lead
  const handleUpdateLead = async () => {
    if (!editingLead.name || !editingLead.email || !editingLead.phone) {
      alert('Please fill in all required fields: Name, Email, and Phone');
      return;
    }

    try {
      setLoading(true);
      const response = await crmService.leads.update(editingLead._id, {
        name: editingLead.name
      });
      
      // Show success popup
      setSuccessMessage(`Lead "${editingLead.name}" updated successfully!`);
      setShowSuccessPopup(true);
      
      // Close modal
      setShowEditModal(false);
      
      // Refresh leads list
      await fetchLeads();
      
      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error updating lead:', error);
      alert(`Error updating lead: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(6);

  // Pagination logic
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / leadsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const getBadgeStyle = (value) => {
    const styles = {
      New: { bg: "#ecfdf5", color: "#16a34a", border: "#bbf7d0" },
      Contacted: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
      Qualified: { bg: "#dbeafe", color: "#3b82f6", border: "#bfdbfe" },
      Lost: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },

      Website: { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
      Referral: { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
      Email: { bg: "#dbeafe", color: "#3b82f6", border: "#bfdbfe" },
      "Social Media": { bg: "#fce7f3", color: "#ec4899", border: "#fbcfe8" },
      "Cold Call": { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" },
    };

    return (
      styles[value] || {
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
          CRM / Leads Management
        </h2>
        <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div></div>
          <button
            onClick={() => {
  setNewLead({
    ...newLead,
    leadId: generateLeadId(),
  });

  setShowAddModal(true);
}}
            style={{
              background: "#10b981",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              color: "#ffffff",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>+</span>
            Add Lead
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                }}
              >
                Total Leads
              </h3>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HiOutlineUsers size={20} color="#38bdf8" />
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {leads.length}
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "12px",
                color: "#059669",
                fontWeight: "500",
              }}
            >
              0% from last month
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                }}
              >
                New Leads
              </h3>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HiOutlineSparkles size={20} color="#38bdf8" />
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {leads.filter(lead => lead.status === 'New').length}
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "12px",
                color: "#059669",
                fontWeight: "500",
              }}
            >
              0% from last month
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                }}
              >
                Conversion Rate
              </h3>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HiOutlineChartBar size={20} color="#38bdf8" />
              </div>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              0%
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "12px",
                color: "#059669",
                fontWeight: "500",
              }}
            >
              0% from last month
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                }}
              >
                Active Leads
              </h3>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                 backgroundColor: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HiOutlineBolt size={20} color="#38bdf8" />
              </div>

            </div>
            <p
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              0
            </p>
            <p
              style={{
                margin: "8px 0 0 0",
                fontSize: "12px",
                color: "#dc2626",
                fontWeight: "500",
              }}
            >
              0% from last month
            </p>

            
          </div>
          {/* Hot Leads */}
<div
  style={{
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "12px",
    }}
  >
    <h3
      style={{
        margin: 0,
        fontSize: "14px",
        fontWeight: "500",
        color: "#6b7280",
      }}
    >
      Hot Leads
    </h3>

    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "8px",
       backgroundColor: "#e0f2fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <HiOutlineFire size={20} color="#38bdf8" />
    </div>
  </div>

  <p
    style={{
      margin: 0,
      fontSize: "32px",
      fontWeight: "700",
      color: "#111827",
    }}
  >
    {leads.filter((lead) => lead.priority === "Hot").length}
  </p>

  <p
    style={{
      margin: "8px 0 0 0",
      fontSize: "12px",
      color: "#ef4444",
      fontWeight: "500",
    }}
  >
    High priority leads
  </p>
</div>

{/* Warm Leads */}
<div
  style={{
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "12px",
    }}
  >
    <h3
      style={{
        margin: 0,
        fontSize: "14px",
        fontWeight: "500",
        color: "#6b7280",
      }}
    >
      Warm Leads
    </h3>

    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "8px",
       backgroundColor: "#e0f2fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <WiDayCloudy size={22} color="#38bdf8" />
    </div>
  </div>

  <p
    style={{
      margin: 0,
      fontSize: "32px",
      fontWeight: "700",
      color: "#111827",
    }}
  >
    {leads.filter((lead) => lead.priority === "Warm").length}
  </p>

  <p
    style={{
      margin: "8px 0 0 0",
      fontSize: "12px",
      color: "#f59e0b",
      fontWeight: "500",
    }}
  >
    Medium priority leads
  </p>
</div>

{/* Cold Leads */}
<div
  style={{
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "12px",
    }}
  >
    <h3
      style={{
        margin: 0,
        fontSize: "14px",
        fontWeight: "500",
        color: "#6b7280",
      }}
    >
      Cold Leads
    </h3>

    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        backgroundColor: "#e0f2fe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <WiSnow size={22} color="#38bdf8" />
    </div>
  </div>

  <p
    style={{
      margin: 0,
      fontSize: "32px",
      fontWeight: "700",
      color: "#111827",
    }}
  >
    {leads.filter((lead) => lead.priority === "Cold").length}
  </p>

  <p
    style={{
      margin: "8px 0 0 0",
      fontSize: "12px",
      color: "#3b82f6",
      fontWeight: "500",
    }}
  >
    Low priority leads
  </p>
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
          {/* TABLE */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                {[
                  "Lead ID",
                  "Name",
                  "Email",
                  "Phone",
                  "Source",
                  "Status",
                  "Lead Priority",
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
                  <td colSpan="7" style={{ 
                    padding: "40px", 
                    textAlign: "center", 
                    color: "#64748b",
                    fontSize: "16px"
                  }}>
                    Loading leads...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" style={{ 
                    padding: "40px", 
                    textAlign: "center", 
                    color: "#ef4444",
                    fontSize: "16px"
                  }}>
                    {error}
                  </td>
                </tr>
              ) : currentLeads.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ 
                    padding: "40px", 
                    textAlign: "center", 
                    color: "#64748b",
                    fontSize: "16px"
                  }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => {
                  const statusStyle = getBadgeStyle(lead.status);
                  const sourceStyle = getBadgeStyle(lead.source);

                  return (
                    <tr
                      key={lead._id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: 600 }}>
  {lead.leadId}
</td>
                      <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                        {lead.name}
                      </td>

                      <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                        {lead.email}
                      </td>

                      <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                        {lead.phone}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: sourceStyle.bg,
                            color: sourceStyle.color,
                            border: `1px solid ${sourceStyle.border}`,
                            fontWeight: 500,
                          }}
                        >
                          {lead.source}
                        </span>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                            fontWeight: 500,
                          }}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
  <span
    style={{
      padding: "4px 10px",
      fontSize: "12px",
      borderRadius: "6px",
      background:
        lead.priority === "Hot"
          ? "#fef2f2"
          : lead.priority === "Warm"
          ? "#fffbeb"
          : "#eff6ff",

      color:
        lead.priority === "Hot"
          ? "#dc2626"
          : lead.priority === "Warm"
          ? "#d97706"
          : "#2563eb",

      border:
        lead.priority === "Hot"
          ? "1px solid #fecaca"
          : lead.priority === "Warm"
          ? "1px solid #fde68a"
          : "1px solid #bfdbfe",

      fontWeight: 500,
    }}
  >
    {lead.priority}
  </span>
</td>

                      <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => handleDeleteLead(lead._id)}
                          style={{
                            background: "#ef4444",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                            color: "#ffffff",
                            fontWeight: "500",
                          }}
                        >
                          Delete
                        </button>
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
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} style={{ 
                      padding: '8px 4px',
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
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
                        background: page === currentPage ? "#e0f2fe" : "#ffffff",
                        fontSize: "13px",
                        cursor: "pointer",
                        color: page === currentPage ? "#0ea5e9" : "#374151",
                        fontWeight: page === currentPage ? "500" : "400",
                      }}
                    >
                      {page}
                    </button>
                  )
                ));
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

      {/* Add Lead Modal */}
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
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "600" }}>
              Add New Lead
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
  <label
    style={{
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "500",
    }}
  >
    Lead ID
  </label>

  <input
    type="text"
    value={newLead.leadId}
    readOnly
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      background: "#f9fafb",
      color: "#374151",
      fontWeight: "600",
    }}
  />
</div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="Enter lead name"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Source
                </label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Cold Call">Cold Call</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Status
                </label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
  <label
    style={{
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "500",
    }}
  >
    Lead Priority
  </label>

  <select
    value={newLead.priority}
    onChange={(e) =>
      setNewLead({ ...newLead, priority: e.target.value })
    }
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
    }}
  >
    <option value="Hot">Hot</option>
    <option value="Warm">Warm</option>
    <option value="Cold">Cold</option>
  </select>
</div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "#6b7280",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#ffffff",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddLead}
                disabled={loading}
                style={{
                  background: loading ? "#9ca3af" : "#10b981",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  color: "#ffffff",
                  fontWeight: "500",
                }}
              >
                {loading ? "Creating..." : "Create Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "32px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 24px 0", fontSize: "20px", fontWeight: "600" }}>
              Edit Lead
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={editingLead.name}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="Enter lead name"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={editingLead.email}
                  onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  value={editingLead.phone}
                  onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Source
                </label>
                <select
                  value={editingLead.source}
                  onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Email">Email</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Cold Call">Cold Call</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Status
                </label>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div>
  <label
    style={{
      display: "block",
      marginBottom: "8px",
      fontSize: "14px",
      fontWeight: "500",
    }}
  >
    Lead Priority
  </label>

  <select
    value={editingLead.priority}
    onChange={(e) =>
      setEditingLead({
        ...editingLead,
        priority: e.target.value,
      })
    }
    style={{
      width: "100%",
      padding: "12px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
    }}
  >
    <option value="Hot">Hot</option>
    <option value="Warm">Warm</option>
    <option value="Cold">Cold</option>
  </select>
</div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "#6b7280",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#ffffff",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLead}
                disabled={loading}
                style={{
                  background: loading ? "#9ca3af" : "#3b82f6",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  color: "#ffffff",
                  fontWeight: "500",
                }}
              >
                {loading ? "Updating..." : "Update Lead"}
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
            top: "20px",
            right: "20px",
            backgroundColor: "#10b981",
            color: "#ffffff",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            zIndex: 1001,
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "18px" }}>✓</span>
          {successMessage}
        </div>
      )}
    </DashboardLayout>
  );
};

export default LeadsManagement;
