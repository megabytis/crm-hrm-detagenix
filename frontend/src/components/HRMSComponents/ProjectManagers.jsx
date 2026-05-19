import { useEffect, useState } from "react";
import DashboardLayout from "../DashboardComponents/DashboardLayout";
import { FaUsers, FaProjectDiagram, FaUserPlus, FaUser } from "react-icons/fa";
import { projectService } from "../../services/projectService";
import { userService } from "../../services/userService";

const ProjectManagers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [openTeamId, setOpenTeamId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectManager: "",
  });
  const openAssignModal = (projectId) => {
    setSelectedProject(projectId);
    setSelectedEmployees([]); // Clear previous selections
    setAssignModal(true);
    fetchEmployees(); // API call
  };

  // Get user role and fetch data
  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   setUserRole(user?.role || "");

  //   if (user?.role === "MANAGER") {
  //     fetchMyTeam();
  //   } else if (user?.role === "ADMIN" || user?.role === "HR") {
  //     fetchAllProjects();
  //   }
  // }, []);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUserRole(user?.role || "");

    fetchProjects(); // 🔥 sab ke liye same API
  }, []);

  const fetchMyTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getMyTeam();
      setData(response || []);
    } catch (error) {
      console.error("Error fetching team:", error);
      setError(error.message || "Failed to fetch team");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getAllProjects();
      setData(response || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.message || "Failed to fetch projects");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch managers for project creation
  const fetchManagers = async () => {
    try {
      const response = await userService.getAll();

      // Handle different response formats
      const users = Array.isArray(response) ? response : response.data || [];
      const managerList = users.filter((user) => user.role === "MANAGER");

      setManagers(managerList || []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setManagers([]);
    }
  };
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await projectService.getProjectsByRole();
      setData(response || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.message || "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Open create project modal and fetch managers
  const openCreateProjectModal = () => {
    setShowModal(true);
    fetchManagers();
    setSelectedManager(null);
    setFormData({
      title: "",
      description: "",
      projectManager: "",
    });
  };

  // Handle manager selection
  const handleManagerSelect = (manager) => {
    setSelectedManager(manager);
    setFormData({
      ...formData,
      projectManager: manager._id,
    });
    setShowManagerModal(false);
  };

  const handleCreateProject = async () => {
    try {
      await projectService.createProject(formData);
      setShowModal(false);
      fetchAllProjects(); // refresh list
      setFormData({
        title: "",
        description: "",
        projectManager: "",
      });
      setSelectedManager(null);
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log("Fetching all employees...");
      const response = await userService.getAll();
      console.log("All users response:", response);

      // Handle different response formats
      const users = Array.isArray(response) ? response : response.data || [];
      console.log("Extracted users array:", users);

      // Filter for employees (exclude managers, admins, hr if needed)
      const employees = users.filter((user) => user.role === "EMPLOYEE");
      console.log("Filtered employees:", employees);

      setEmployees(employees || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  };

  const handleAssignTeam = async () => {
    try {
      if (!selectedProject || selectedEmployees.length === 0) {
        alert("Please select at least one employee to assign");
        return;
      }

      // Assign each selected employee
      for (const employeeId of selectedEmployees) {
        await projectService.assignTeam(selectedProject, employeeId);
      }

      alert("Team members assigned successfully!");
      setAssignModal(false);
      setSelectedEmployees([]);
      fetchAllProjects(); // Refresh projects list
    } catch (error) {
      console.error("Error assigning team:", error);
      alert("Failed to assign team members");
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {userRole === "MANAGER" ? (
              <>
                <FaUsers style={{ marginRight: "10px" }} />
                My Project Team
              </>
            ) : (
              <>
                <FaProjectDiagram style={{ marginRight: "10px" }} />
                All Projects
              </>
            )}
          </h2>

          {(userRole === "ADMIN" || userRole === "HR") && (
            <button
              onClick={openCreateProjectModal}
              style={{
                background: "#0ea5e9",
                color: "#fff",
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              + Create Project
            </button>
          )}
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
                borderTop: "4px solid #0ea5e9",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ marginTop: "10px", color: "#666" }}>
              {userRole === "MANAGER"
                ? "Loading team members..."
                : "Loading projects..."}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ color: "#e74c3c", marginBottom: "10px" }}>
              {error}
            </div>
            <button
              onClick={fetchProjects}
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
        )}

        {/* Data Display */}
        {!loading && !error && (
          <>
            {data.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                {userRole === "MANAGER" ? (
                  <>
                    <FaUsers
                      size={48}
                      style={{ marginBottom: "10px", opacity: 0.5 }}
                    />
                    <p>No team members found</p>
                    <p style={{ fontSize: "14px" }}>
                      You haven't been assigned any team members yet.
                    </p>
                  </>
                ) : (
                  <>
                    <FaProjectDiagram
                      size={48}
                      style={{ marginBottom: "10px", opacity: 0.5 }}
                    />
                    <p>No projects found</p>
                    <p style={{ fontSize: "14px" }}>
                      No projects have been created yet.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {userRole === "MANAGER"
                  ? // Display Team Members for Managers with detailed info
                    data.map((member) => (
                      <div
                        key={member._id}
                        style={{
                          background: "#f8fafc",
                          borderRadius: "12px",
                          padding: "24px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          border: "1px solid #e2e8f0",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.05)";
                        }}
                      >
                        {/* Member Avatar */}
                        <div
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "50%",
                            background: "#0ea5e9",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            fontSize: "24px",
                            fontWeight: "bold",
                          }}
                        >
                          {member.name
                            ? member.name.charAt(0).toUpperCase()
                            : "U"}
                        </div>

                        {/* Member Name */}
                        <h3
                          style={{
                            marginBottom: "6px",
                            textAlign: "center",
                            fontSize: "18px",
                          }}
                        >
                          {member.name || "Unknown"}
                        </h3>

                        {/* Email */}
                        <p
                          style={{
                            color: "#64748b",
                            marginBottom: "12px",
                            textAlign: "center",
                            fontSize: "14px",
                            wordBreak: "break-word",
                          }}
                        >
                          {member.email || "No email"}
                        </p>

                        {/* Role & Designation */}
                        <div
                          style={{ textAlign: "center", marginBottom: "12px" }}
                        >
                          <span
                            style={{
                              background: "#10b981",
                              color: "#fff",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                              marginRight: "6px",
                              display: "inline-block",
                              marginBottom: "4px",
                            }}
                          >
                            {member.role || "Employee"}
                          </span>
                          {member.designation && (
                            <span
                              style={{
                                background: "#6366f1",
                                color: "#fff",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "500",
                                display: "inline-block",
                                marginBottom: "4px",
                              }}
                            >
                              {member.designation}
                            </span>
                          )}
                        </div>

                        {/* Tech Stack */}
                        {member.techStack && (
                          <div
                            style={{
                              textAlign: "center",
                              marginBottom: "12px",
                            }}
                          >
                            <span
                              style={{
                                background: "#f59e0b",
                                color: "#fff",
                                padding: "4px 12px",
                                borderRadius: "16px",
                                fontSize: "11px",
                                fontWeight: "500",
                              }}
                            >
                              🛠️ {member.techStack}
                            </span>
                          </div>
                        )}

                        {/* Status */}
                        <div
                          style={{ textAlign: "center", marginBottom: "12px" }}
                        >
                          <span
                            style={{
                              background: member.isActive
                                ? "#ecfdf5"
                                : "#fef2f2",
                              color: member.isActive ? "#10b981" : "#ef4444",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {member.isActive ? "✅ Active" : "❌ Inactive"}
                          </span>
                        </div>

                        {/* Divider */}
                        <div
                          style={{
                            height: "1px",
                            background: "#e2e8f0",
                            margin: "16px 0",
                          }}
                        ></div>

                        {/* Additional Details */}
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          {/* Employee ID */}
                          <div
                            style={{
                              marginBottom: "8px",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ fontWeight: "500" }}>
                              Employee ID:
                            </span>
                            <span>
                              {member._id
                                ? member._id.slice(-8).toUpperCase()
                                : "N/A"}
                            </span>
                          </div>

                          {/* Joining Date */}
                          {member.createdAt && (
                            <div
                              style={{
                                marginBottom: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span style={{ fontWeight: "500" }}>Joined:</span>
                              <span>
                                {new Date(
                                  member.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          {/* Created By */}
                          {member.createdByRole && (
                            <div
                              style={{
                                marginBottom: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span style={{ fontWeight: "500" }}>
                                Added by:
                              </span>
                              <span>{member.createdByRole}</span>
                            </div>
                          )}

                          {/* Last Updated */}
                          {member.updatedAt && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span style={{ fontWeight: "500" }}>
                                Updated:
                              </span>
                              <span>
                                {new Date(
                                  member.updatedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  : // Display Projects for Admin/HR
                    data.map((project) => (
                      <div
                        key={project._id}
                        style={{
                          background: "#f8fafc",
                          borderRadius: "12px",
                          padding: "20px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          border: "1px solid #e2e8f0",
                          transition: "all 0.2s ease",
                          position: "relative", // 👈 important
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.05)";
                        }}
                      >
                        {/* Project Icon */}
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "#10b981",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 15px",
                            fontSize: "20px",
                          }}
                        >
                          <FaProjectDiagram />
                        </div>

                        {/* Project Title */}
                        <h3
                          style={{ marginBottom: "8px", textAlign: "center" }}
                        >
                          {project.title || "Untitled Project"}
                        </h3>

                        {/* Description */}
                        <p
                          style={{
                            color: "#64748b",
                            marginBottom: "12px",
                            textAlign: "center",
                            fontSize: "14px",
                            minHeight: "40px",
                          }}
                        >
                          {project.description || "No description available"}
                        </p>

                        {/* Team Size */}
                        <div
                          style={{ textAlign: "center", marginBottom: "10px" }}
                        >
                          <span
  onClick={() =>
    setOpenTeamId(openTeamId === project._id ? null : project._id)
  }
  style={{
    background: "#0ea5e9",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer", // 👈 important
    display: "inline-block"
  }}
>
  Team: {project.team?.length || 0} members
</span>
                        </div>
                        {openTeamId === project._id && (
  <div style={{ marginTop: "10px", textAlign: "center" }}>
    <strong>Team Members:</strong>

    {project.team?.length > 0 ? (
      project.team.map((member) => (
        <div
          key={member._id}
          style={{ fontSize: "13px", color: "#555" }}
        >
          👤 {member.name} ({member.role})
        </div>
      ))
    ) : (
      <p style={{ fontSize: "12px", color: "#999" }}>
        No team members
      </p>
    )}
  </div>
)}

                        {/* Created Date */}
                        <div
                          style={{
                            textAlign: "center",
                            fontSize: "12px",
                            color: "#94a3b8",
                          }}
                        >
                          Created:{" "}
                          {project.createdAt
                            ? new Date(project.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </div>
                        <button
                          onClick={() => openAssignModal(project._id)}
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            padding: "5px",
                            borderRadius: "50%",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#eef2ff")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <FaUserPlus size={22} color="#6366f1" />
                        </button>
                      </div>
                    ))}
              </div>
            )}
          </>
        )}
      </div>
      {showModal && (
        <div
          style={{
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
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
              maxWidth: "90%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "16px", textAlign: "center" }}>
              Create Project
            </h3>

            <input
              placeholder="Project Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />

            {/* Manager Selection */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Project Manager
              </label>
              {selectedManager ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    border: "1px solid #0ea5e9",
                    borderRadius: "8px",
                    background: "#f0f9ff",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500", color: "#1e293b" }}>
                      {selectedManager.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {selectedManager.email}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowManagerModal(true)}
                    style={{
                      background: "#0ea5e9",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowManagerModal(true)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#64748b",
                  }}
                >
                  + Select Project Manager
                </button>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={handleCreateProject}
                style={{
                  background: "#0ea5e9",
                  color: "#fff",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "48%",
                }}
              >
                Create
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "#e5e7eb",
                  color: "#111",
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "48%",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {assignModal && (
        <div
          style={{
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
          }}
          onClick={() => setAssignModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              width: "600px",
              maxWidth: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#1e293b",
              }}
            >
              <FaUserPlus style={{ marginRight: "8px", color: "#0ea5e9" }} />
              Select Team Members
            </h3>

            {/* Selection Summary */}
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: "#f0f9ff",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <span style={{ color: "#64748b", fontSize: "14px" }}>
                Selected:
              </span>
              <span
                style={{
                  color: "#0ea5e9",
                  fontWeight: "bold",
                  marginLeft: "8px",
                  fontSize: "16px",
                }}
              >
                {selectedEmployees.length} employee
                {selectedEmployees.length !== 1 ? "s" : ""}
              </span>
            </div>

            {employees.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <FaUsers
                  size={48}
                  style={{ marginBottom: "10px", opacity: 0.5 }}
                />
                <p>No employees found</p>
                <p style={{ fontSize: "14px" }}>
                  Please create employee accounts first.
                </p>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "20px",
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {employees.map((emp) => (
                  <div
                    key={emp._id}
                    style={{
                      padding: "16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      marginBottom: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: selectedEmployees.includes(emp._id)
                        ? "#f0f9ff"
                        : "#fff",
                      borderColor: selectedEmployees.includes(emp._id)
                        ? "#0ea5e9"
                        : "#e2e8f0",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => {
                      if (selectedEmployees.includes(emp._id)) {
                        setSelectedEmployees(
                          selectedEmployees.filter((id) => id !== emp._id),
                        );
                      } else {
                        setSelectedEmployees([...selectedEmployees, emp._id]);
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "4px",
                          border: "2px solid #d1d5db",
                          background: selectedEmployees.includes(emp._id)
                            ? "#0ea5e9"
                            : "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {selectedEmployees.includes(emp._id) && (
                          <span
                            style={{
                              color: "#fff",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Employee Avatar */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#10b981",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {emp.name ? emp.name.charAt(0).toUpperCase() : "E"}
                      </div>

                      {/* Employee Info */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "500",
                            color: "#1e293b",
                            marginBottom: "4px",
                          }}
                        >
                          {emp.name || "Unknown Employee"}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            marginBottom: "4px",
                          }}
                        >
                          {emp.email || "No email"}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              background: "#10b981",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "500",
                            }}
                          >
                            {emp.role || "EMPLOYEE"}
                          </span>
                          {emp.designation && (
                            <span
                              style={{
                                background: "#6366f1",
                                color: "#fff",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "500",
                              }}
                            >
                              {emp.designation}
                            </span>
                          )}
                          {emp.techStack && (
                            <span
                              style={{
                                background: "#f59e0b",
                                color: "#fff",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "500",
                              }}
                            >
                              🛠️ {emp.techStack}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleAssignTeam}
                disabled={selectedEmployees.length === 0}
                style={{
                  flex: 1,
                  padding: "12px",
                  background:
                    selectedEmployees.length > 0 ? "#10b981" : "#e5e7eb",
                  color: selectedEmployees.length > 0 ? "#fff" : "#9ca3af",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    selectedEmployees.length > 0 ? "pointer" : "not-allowed",
                  fontWeight: "500",
                }}
              >
                Assign{" "}
                {selectedEmployees.length > 0
                  ? `${selectedEmployees.length} Employee${selectedEmployees.length !== 1 ? "s" : ""}`
                  : "Employees"}
              </button>

              <button
                onClick={() => {
                  setAssignModal(false);
                  setSelectedEmployees([]);
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e5e7eb",
                  color: "#111",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Selection Modal */}
      {showManagerModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              width: "500px",
              maxWidth: "90%",
              maxHeight: "70vh",
              overflow: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
              Select Project Manager
            </h3>

            {managers.length === 0 ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <FaUsers
                  size={48}
                  style={{ marginBottom: "10px", opacity: 0.5 }}
                />
                <p>No managers found</p>
                <p style={{ fontSize: "14px" }}>
                  Please create manager accounts first.
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                {managers.map((manager) => (
                  <div
                    key={manager._id}
                    onClick={() => handleManagerSelect(manager)}
                    style={{
                      padding: "15px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background:
                        selectedManager?._id === manager._id
                          ? "#f0f9ff"
                          : "#fff",
                      borderColor:
                        selectedManager?._id === manager._id
                          ? "#0ea5e9"
                          : "#e2e8f0",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#0ea5e9",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {manager.name
                          ? manager.name.charAt(0).toUpperCase()
                          : "M"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: "500",
                            color: "#1e293b",
                            marginBottom: "4px",
                          }}
                        >
                          {manager.name || "Unknown Manager"}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#64748b",
                            marginBottom: "4px",
                          }}
                        >
                          {manager.email || "No email"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          ID:{" "}
                          {manager._id
                            ? manager._id.slice(-8).toUpperCase()
                            : "N/A"}
                        </div>
                      </div>
                      {selectedManager?._id === manager._id && (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "#10b981",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setShowManagerModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#e5e7eb",
                  color: "#111",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProjectManagers;
