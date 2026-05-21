import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { crmService } from "../../services/crmService";

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    assignedTo: null
  });

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await crmService.customers.getAll({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (response.success) {
        setCustomers(response.data || []);
      } else {
        setError(response.message || "Failed to fetch customers");
      }
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError("Failed to fetch customers. Please try again.");

      // Fallback to mock data if API fails
      setCustomers([
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
          company: "Tech Corp",
          status: "new",
          assignedTo: { name: "Admin User", email: "admin@example.com" },
          createdBy: { name: "Admin User", email: "admin@example.com" },
          createdAt: "2024-01-05T10:30:00.000Z",
          updatedAt: "2024-01-05T10:30:00.000Z"
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+0987654321",
          company: "Design Inc",
          status: "contacted",
          assignedTo: { name: "Mike Wilson", email: "mike@company.com" },
          createdBy: { name: "Admin User" },
          createdAt: "2024-01-10T09:15:00.000Z",
          updatedAt: "2024-01-18T16:45:00.000Z",
        },
        {
          _id: "3",
          name: "Robert Chen",
          email: "robert@global.com",
          phone: "+1 456-789-0123",
          company: "Global Tech",
          status: "new",
          assignedTo: { name: "Sarah Davis", email: "sarah@company.com" },
          createdBy: { name: "Admin User" },
          createdAt: "2024-01-08T11:20:00.000Z",
          updatedAt: "2024-01-08T11:20:00.000Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Name is required');
        return;
      }

      // Clean the form data before sending
      const cleanedData = {
        ...formData,
        assignedTo: formData.assignedTo && formData.assignedTo.trim() ? formData.assignedTo.trim() : null
      };

      const response = await crmService.customers.create(cleanedData);
      
      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        fetchCustomers(); // Refresh the list
        alert("Customer created successfully!");
      } else {
        alert(response.message || "Failed to create customer");
      }
    } catch (error) {
      console.error('Create customer error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        alert('Network error: Unable to connect to the server. Please check if the backend server is running on localhost:5000');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        alert('Authentication error: Please log in again');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        alert('Permission denied: You do not have permission to create customers');
      } else if (error.message.includes('ValidationError') || error.message.includes('Cast to ObjectId failed')) {
        alert('Validation error: Please check all required fields and ensure assigned user is selected or left empty');
      } else {
        alert(`Failed to create customer: ${error.message}`);
      }
      console.error("Create customer error:", error);
      alert("Failed to create customer. Please try again.");
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      const response = await crmService.customers.update(
        selectedCustomer._id,
        formData,
      );

      if (response.success) {
        setShowEditModal(false);
        resetForm();
        fetchCustomers(); // Refresh the list
        alert("Customer updated successfully!");
      } else {
        alert(response.message || "Failed to update customer");
      }
    } catch (error) {
      console.error("Update customer error:", error);
      alert("Failed to update customer. Please try again.");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this customer? This action cannot be undone.",
      )
    ) {
      try {
        const response = await crmService.customers.delete(customerId);

        if (response.success) {
          fetchCustomers(); // Refresh the list
          alert("Customer deleted successfully!");
        } else {
          alert(response.message || "Failed to delete customer");
        }
      } catch (error) {
        console.error("Delete customer error:", error);
        alert("Failed to delete customer. Please try again.");
      }
    }
  };

  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      status: customer.status || "new",
      assignedTo: customer.assignedTo?._id || "",
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "new",
      assignedTo: "",
    });
    setSelectedCustomer(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = customers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#10b981";
      case "contacted":
        return "#3b82f6";
      case "qualified":
        return "#8b5cf6";
      case "lost":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div
        style={{ padding: "24px", background: "#f3f4f6", minHeight: "100vh" }}
      >
        {/* PAGE TITLE */}
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
          CRM / Customer Management
        </h2>

        {/* HEADER WITH ACTIONS */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {["All Customers", "New Leads", "Active Deals"].map(
              (btn, index) => (
                <button
                  key={index}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    background: index === 0 ? "#0ea5e9" : "#f9fafb",
                    color: index === 0 ? "#ffffff" : "#374151",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {btn}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#10b981",
              color: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            + Add Customer
          </button>
        </div>

        {/* TABLE */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #0ea5e9",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "10px",
                }}
              ></div>
              <div>Loading customers...</div>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#dc2626",
              }}
            >
              <div style={{ marginBottom: "10px" }}>Error: {error}</div>
              <button
                onClick={fetchCustomers}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#0ea5e9",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f9fafb" }}>
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Phone",
                      "Company",
                      "Status",
                      "Assigned To",
                      "Created Date",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "14px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: 600,
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
                  {currentItems.length > 0 ? (
                    currentItems.map((customer) => (
                      <tr
                        key={customer._id}
                        style={{ borderBottom: "1px solid #f3f4f6" }}
                      >
                        <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                          {customer.name}
                        </td>

                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                          {customer.email || "N/A"}
                        </td>

                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                          {customer.phone || "N/A"}
                        </td>

                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                          {customer.company || "N/A"}
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                              background: `${getStatusColor(customer.status)}20`,
                              color: getStatusColor(customer.status),
                            }}
                          >
                            {customer.status}
                          </span>
                        </td>

                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                          {customer.assignedTo?.name || "Unassigned"}
                        </td>

                        <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                          {formatDate(customer.createdAt)}
                        </td>

                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleEditClick(customer)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #e5e7eb",
                                background: "#ffffff",
                                color: "#6b7280",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer._id)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #ef4444",
                                background: "#ffffff",
                                color: "#ef4444",
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              {totalPages > 1 && (
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
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
                    )}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: "#ffffff",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                      fontSize: "13px",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* CREATE CUSTOMER MODAL */}
        {showCreateModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "12px",
                width: "500px",
                maxWidth: "90%",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Add New Customer
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Assigned To (User ID)
                  </label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Employee ID (Optional)"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#6b7280",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomer}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#10b981",
                    color: "#ffffff",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Create Customer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT CUSTOMER MODAL */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                padding: "24px",
                borderRadius: "12px",
                width: "500px",
                maxWidth: "90%",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                Edit Customer
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    Assigned To (User ID)
                  </label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo || ""}
                    onChange={handleInputChange}
                    placeholder="Enter Employee ID (Optional)"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#6b7280",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCustomer}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#0ea5e9",
                    color: "#ffffff",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Update Customer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerManagement;
