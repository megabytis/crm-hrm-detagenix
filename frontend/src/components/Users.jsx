import { useState, useEffect } from "react";
import { FaUser, FaEdit, FaTrash, FaPlus, FaSearch, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardComponents/DashboardLayout";
import { userService } from "../services/userService";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    designation: "",
    managerType: "", // 👈 NEW
    techStack: "",
    teamMembers: [], // 👈 NEW
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers(response.data || []);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Remove getAllUsers call as requested
  // useEffect(() => {
  //   fetchUsers();
  // }, [currentPage, usersPerPage]);

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter users based on department, role, and status
  const filteredUsersWithDepartmentRoleStatus = filteredUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      !departmentFilter || user.designation === departmentFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus =
      !statusFilter || (user.isActive ? "Active" : "Inactive") === statusFilter;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const roles = [...new Set(users.map((user) => user.role))];
  const statuses = [
    ...new Set(users.map((user) => (user.isActive ? "Active" : "Inactive"))),
  ];
  const departments = [
    ...new Set(users.map((user) => user.designation).filter(Boolean)),
  ];

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsersWithDepartmentRoleStatus.slice(
    indexOfFirstUser,
    indexOfLastUser,
  );
  const totalPages = Math.ceil(
    filteredUsersWithDepartmentRoleStatus.length / usersPerPage,
  );

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      alert(
        "Please fill in all required fields: Name, Email, Password, and Role",
      );
      return;
    }

    try {
      setLoading(true);

      // Only include techStack if it has a value
      const userDataToSend = { ...newUser };
      if (!userDataToSend.techStack || userDataToSend.techStack.trim() === "") {
        delete userDataToSend.techStack;
      }

      const response = await userService.create(userDataToSend);

      // Show success popup
      setSuccessMessage(`User "${newUser.name}" created successfully!`);
      setShowSuccessPopup(true);

      // Reset form
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
        designation: "",
        techStack: "",
      });

      setShowModal(false);

      // Refresh users list after successful creation
      await fetchUsers();

      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit user handler
  const handleEditUser = (user) => {
    // Populate form with user data for editing
    setNewUser({
      name: user.name,
      email: user.email,
      password: "", // Don't populate password for security
      role: user.role,
      designation: user.designation || "",
      techStack: user.techStack || "",
    });
    setEditingUserId(user._id);
    setIsEditing(true);
    setShowModal(true);
  };

  // Update user handler
  const handleUpdateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      alert("Please fill in all required fields: Name, Email, and Role");
      return;
    }

    try {
      setLoading(true);

      // Only include password if it's provided
      const userDataToSend = { ...newUser };
      if (!userDataToSend.password || userDataToSend.password.trim() === "") {
        delete userDataToSend.password;
      }

      if (!userDataToSend.techStack || userDataToSend.techStack.trim() === "") {
        delete userDataToSend.techStack;
      }

      const response = await userService.update(editingUserId, userDataToSend);

      // Show success popup
      setSuccessMessage(`User "${newUser.name}" updated successfully!`);
      setShowSuccessPopup(true);

      // Reset form
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
        designation: "",
        techStack: "",
      });
      setEditingUserId(null);
      setIsEditing(false);
      setShowModal(false);

      // Refresh users list after successful update
      await fetchUsers();

      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId, userName) => {
    try {
      // Show confirmation dialog
      const confirmDelete = window.confirm(
        `Are you sure you want to delete user "${userName}"?`,
      );
      if (!confirmDelete) return;

      setLoading(true);

      // Call API to delete user
      await userService.deleteUser(userId);

      // Show success popup
      setSuccessMessage(`User "${userName}" deleted successfully!`);
      setShowSuccessPopup(true);

      // Refresh users list after successful deletion
      await fetchUsers();

      // Hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <DashboardLayout>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }
        
        .layout {
          display: flex;
          height: 100vh;
        }

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
      `}</style>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#1e293b",
              fontSize: "24px",
              fontWeight: "600",
            }}
          >
            <FaUser style={{ marginRight: "10px", color: "#0ea5e9" }} />
            Users Management
          </h2>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditingUserId(null);
              setNewUser({
                name: "",
                email: "",
                password: "",
                role: "",
                designation: "",
                techStack: "",
              });
              setShowModal(true);
            }}
            style={{
              backgroundColor: "#0ea5e9",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              transition: "all 0.2s ease",
            }}
          >
            <FaPlus style={{ marginRight: "8px" }} />
            Add User
          </button>
        </div>

        {/* Filters Section */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                handleFilterChange();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#ffffff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1", minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                handleFilterChange();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#ffffff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1", minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "14px",
                backgroundColor: "#ffffff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginBottom: "24px",
            maxWidth: "400px",
          }}
        >
          <FaSearch
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#ffffff",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Designation
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Tech Stack
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Created At
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "16px",
                    }}
                  >
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="8"
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
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "16px",
                    }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#e0f2fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                          }}
                        >
                          <FaUser size={14} color="#0ea5e9" />
                        </div>
                        <span
                          style={{
                            color: "#1e293b",
                            fontSize: "14px",
                            fontWeight: "500",
                          }}
                        >
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        {user.email}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        {user.designation || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        {user.techStack || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ color: "#64748b", fontSize: "14px" }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        style={{
                          color: user.isActive ? "#10b981" : "#ef4444",
                          fontSize: "14px",
                          fontWeight: "500",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: user.isActive
                            ? "#ecfdf5"
                            : "#fef2f2",
                        }}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          onClick={() => handleEditUser(user)}
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#2563eb";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#3b82f6";
                          }}
                          title="Edit user"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#ef4444";
                          }}
                          title="Delete user"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {showModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "24px",
                  borderRadius: "12px",
                  width: "420px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                <h3 style={{ marginBottom: "16px" }}>
                  {isEditing ? "Edit User" : "Add New User"}
                </h3>

                <input
                  name="name"
                  type="text"
                  placeholder="Full Name *"
                  value={newUser.name}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email *"
                  value={newUser.email}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />

                <input
                  name="password"
                  type="password"
                  placeholder={
                    isEditing
                      ? "Password (leave blank to keep current)"
                      : "Password *"
                  }
                  value={newUser.password}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />

                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">Select Role *</option>
                  <option value="HR">HR</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="BDE">Business Development Executive</option>
                </select>

                <select
                  name="designation"
                  value={newUser.designation}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">Select Designation</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Client Relationship Manager">
                    Client Relationship Manager
                  </option>
                  <option value="Developer">Developer</option>
                  <option value="Intern">Intern</option>
                </select>
              

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() => setShowModal(false)}
                    style={{ padding: "8px 12px" }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={isEditing ? handleUpdateUser : handleSaveUser}
                    disabled={loading}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: loading ? "#94a3b8" : "#0ea5e9",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {loading
                      ? isEditing
                        ? "Updating..."
                        : "Creating..."
                      : isEditing
                        ? "Update User"
                        : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          )}</div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "24px",
              gap: "8px",
            }}
          >
            {/* Previous Button */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                backgroundColor: currentPage === 1 ? "#f8fafc" : "#ffffff",
                color: currentPage === 1 ? "#cbd5e1" : "#374151",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
            >
              Previous
            </button>

            {/* Page Numbers */}
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
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      backgroundColor:
                        currentPage === page ? "#0ea5e9" : "#ffffff",
                      color: currentPage === page ? "#ffffff" : "#374151",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {page}
                  </button>
                ),
              );
            })()}

            {/* Next Button */}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                backgroundColor:
                  currentPage === totalPages ? "#f8fafc" : "#ffffff",
                color: currentPage === totalPages ? "#cbd5e1" : "#374151",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
            >
              Next
            </button>
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
              padding: "16px 20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              animation: "slideIn 0.3s ease-out",
            }}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "#ffffff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                Success!
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                {successMessage}
              </div>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#64748b",
            }}
          >
            <FaUser size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <p>No users found. Click "Add User" to create a new user.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;
