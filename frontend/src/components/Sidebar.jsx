import { FaUser } from "react-icons/fa6";
import { AiFillShopping } from "react-icons/ai";
import { GiHandBag } from "react-icons/gi";
import { RiRobot2Fill } from "react-icons/ri";
import { IoSettings } from "react-icons/io5";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import logo from "../assets/logo.jpeg";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeadsManagementOpen, setIsLeadsManagementOpen] = useState(false);

  const {
    user,
    isUserManagementOpen,
    isCrmOpen,
    isHrmsOpen,
    toggleUserManagement,
    toggleCrm,
    toggleHrms,
    setIsCrmOpen,
    setIsUserManagementOpen,
    setIsHrmsOpen,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role?.toUpperCase();

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  const menuNavigate = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const crmPages = [
      "/leads-management",
      "/crm/add-lead",
      "/crm/lead-conversion",
      "/sales-activities",
      "/crm/followup-ai",
      "/crm/ai-insights",
      "/crm/client-ltv",
      "/sales-pipeline",
      "/forecast",
      "/customer-management",
      "/crm/ml-stats",
      "/crm/chatbot",
    ];

    if (crmPages.includes(location.pathname)) {
      setIsCrmOpen(true);
      setIsUserManagementOpen(false);
      setIsHrmsOpen(false);
      setIsSettingsOpen(false);
      
      // Auto-expand Leads Management if on its subpages
      if (
        location.pathname === "/leads-management" || 
        location.pathname === "/crm/add-lead" || 
        location.pathname === "/crm/lead-conversion" ||
        location.pathname === "/crm/lead-generation"
      ) {
        setIsLeadsManagementOpen(true);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const hrmsPages = [
      "/hrms/attendance",
      "/hrms/employee-profile",
      "/hrms/employees-onboarding",
      "/hrms/leave-management",
      "/hrms/payroll-management",
      "/hrms/performance-appraisal",
      "/hrms/project-managers",
      "/hrms/attendance-review",
    ];

    if (hrmsPages.includes(location.pathname)) {
      setIsHrmsOpen(true);
      setIsCrmOpen(false);
      setIsUserManagementOpen(false);
      setIsSettingsOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const settingsPages = [
      "/settings/company-profile",
      "/settings/roles-permissions",
      "/settings/security-compliance",
      "/settings/ai-settings",
    ];

    if (settingsPages.includes(location.pathname)) {
      setIsSettingsOpen(true);
      setIsCrmOpen(false);
      setIsUserManagementOpen(false);
      setIsHrmsOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="sidebar">
      <div className="logo">
        <img
          src={logo}
          alt="Logo"
          style={{ width: "120px", height: "auto", marginRight: "10px" }}
        />
      </div>

      <ul className="menu">
        {/* Dashboard */}
        <li
          onClick={handleDashboardClick}
          style={{
            cursor: "pointer",
          }}
        >
          Dashboard
        </li>

        {/* USER MANAGEMENT */}
        {(role === "ADMIN" || role === "HR" || role === "MANAGER") && (
          <>
            <li
              onClick={toggleUserManagement}
              style={{
                backgroundColor: isUserManagementOpen
                  ? "#0ea5e9"
                  : "transparent",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <FaUser size={16} color="#ffffff" />
                <span style={{ marginLeft: "10px" }}>User Management</span>
              </div>

              {isUserManagementOpen ? (
                <FaChevronDown size={12} color="#ffffff" />
              ) : (
                <FaChevronRight size={12} color="#ffffff" />
              )}
            </li>

            {isUserManagementOpen && (
              <>
                <li
                  onClick={() => menuNavigate("/users")}
                  style={{
                    paddingLeft: "45px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Users
                </li>

                <li
                  onClick={() => menuNavigate("/userlist")}
                  style={{
                    paddingLeft: "45px",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  User List
                </li>
              </>
            )}
          </>
        )}

        {/* CRM */}
        {(role === "ADMIN" || role === "MANAGER" || role === "BDE" || role === "HR" || !role) && (
          <>
            <li
              onClick={toggleCrm}
              style={{
                backgroundColor: isCrmOpen ? "#0ea5e9" : "transparent",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <AiFillShopping size={16} color="#ffffff" />
                <span style={{ marginLeft: "10px" }}>CRM</span>
              </div>

              {isCrmOpen ? (
                <FaChevronDown size={12} color="#ffffff" />
              ) : (
                <FaChevronRight size={12} color="#ffffff" />
              )}
            </li>

            {isCrmOpen && (
              <>
                <li
                  onClick={() => {
                    menuNavigate("/leads-management");
                    setIsLeadsManagementOpen(!isLeadsManagementOpen);
                  }}
                  style={{
                    paddingLeft: "45px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Leads Management</span>
                  {isLeadsManagementOpen ? (
                    <FaChevronDown size={10} color="#ffffff" />
                  ) : (
                    <FaChevronRight size={10} color="#ffffff" />
                  )}
                </li>

                {isLeadsManagementOpen && (
                  <>
                    <li
                      onClick={() => menuNavigate("/crm/add-lead")}
                      style={{
                        paddingLeft: "65px",
                        cursor: "pointer",
                        fontSize: "14.5px",
                        fontWeight: isActive("/crm/add-lead") ? "700" : "500",
                        color: isActive("/crm/add-lead") ? "#ffffff" : "#e2e8f0",
                        paddingTop: "6px",
                        paddingBottom: "6px"
                      }}
                    >
                      Add Lead
                    </li>
                    <li
                      onClick={() => menuNavigate("/crm/lead-conversion")}
                      style={{
                        paddingLeft: "65px",
                        cursor: "pointer",
                        fontSize: "14.5px",
                        fontWeight: isActive("/crm/lead-conversion") ? "700" : "500",
                        color: isActive("/crm/lead-conversion") ? "#ffffff" : "#e2e8f0",
                        paddingTop: "6px",
                        paddingBottom: "6px"
                      }}
                    >
                      Lead Conversion
                    </li>
                    <li
                      onClick={() => menuNavigate("/crm/lead-generation")}
                      style={{
                        paddingLeft: "65px",
                        cursor: "pointer",
                        fontSize: "14.5px",
                        fontWeight: isActive("/crm/lead-generation") ? "700" : "500",
                        color: isActive("/crm/lead-generation") ? "#ffffff" : "#e2e8f0",
                        paddingTop: "6px",
                        paddingBottom: "6px"
                      }}
                    >
                      Lead Generation
                    </li>
                  </>
                )}

                <li
                  onClick={() => menuNavigate("/sales-activities")}
                  style={{ 
                    paddingLeft: "45px", 
                    cursor: "pointer",
                  }}
                >
                  Sales Activities
                </li>
                 
                 {/* <li
  onClick={() => menuNavigate("/crm/followup-ai")}
  style={{ 
    paddingLeft: "45px", 
    cursor: "pointer",
    fontWeight: isActive("/crm/followup-ai") ? "700" : "500",
    color: isActive("/crm/followup-ai") ? "#ffffff" : "#e2e8f0"
  }}
>
  Follow-up AI
</li> */}
    <li
  onClick={() => menuNavigate("/crm/ai-insights")}
  style={{ 
    paddingLeft: "45px", 
    cursor: "pointer",
    fontWeight: isActive("/crm/ai-insights") ? "700" : "500",
    color: isActive("/crm/ai-insights") ? "#ffffff" : "#e2e8f0"
  }}
>
  AI Insights
</li>
<li
  onClick={() => menuNavigate("/crm/client-ltv")}
  style={{ 
    paddingLeft: "45px", 
    cursor: "pointer",
    fontWeight: isActive("/crm/client-ltv") ? "700" : "500",
    color: isActive("/crm/client-ltv") ? "#ffffff" : "#e2e8f0"
  }}
>
  Client LTV
</li>
                <li
                  onClick={() => menuNavigate("/sales-pipeline")}
                  style={{ 
                    paddingLeft: "45px", 
                    cursor: "pointer",
                  }}
                >
                  Sales Pipeline & Forecast
                </li>

                <li
                  onClick={() => menuNavigate("/customer-management")}
                  style={{ 
                    paddingLeft: "45px", 
                    cursor: "pointer",
                  }}
                >
                  Customer Management
                </li>
                <li
  onClick={() => menuNavigate("/crm/ml-stats")}
  style={{ 
    paddingLeft: "45px", 
    cursor: "pointer",
    fontWeight: isActive("/crm/ml-stats") ? "700" : "500",
    color: isActive("/crm/ml-stats") ? "#ffffff" : "#e2e8f0"
  }}
>
  ML Stats
</li>
                <li
  onClick={() => menuNavigate("/crm/chatbot")}
  style={{
    paddingLeft: "45px",
    cursor: "pointer",
    fontWeight: isActive("/crm/chatbot") ? "700" : "500",
    color: isActive("/crm/chatbot") ? "#ffffff" : "#e2e8f0",
  }}
>
  Chatbot
</li>
              </>
            )}
          </>
        )}

        {/* HRMS */}
        <li
          onClick={toggleHrms}
          style={{
            backgroundColor: isHrmsOpen ? "#0ea5e9" : "transparent",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <GiHandBag size={16} color="#ffffff" />
            <span style={{ marginLeft: "10px" }}>HRMS</span>
          </div>

          {isHrmsOpen ? (
            <FaChevronDown size={12} color="#ffffff" />
          ) : (
            <FaChevronRight size={12} color="#ffffff" />
          )}
        </li>

        {isHrmsOpen && (
          <>
            {/*  COMMON (sab ke liye) */}
            {role !== "ADMIN" && (
  <li
    onClick={() => menuNavigate("/hrms/attendance")}
    style={{ paddingLeft: "45px", cursor: "pointer" }}
  >
    Attendance Management
  </li>
)}

            <li
              onClick={() => menuNavigate("/hrms/employee-profile")}
              style={{ 
                paddingLeft: "45px", 
                cursor: "pointer",
              }}
            >
              Employee Profile
            </li>

            <li
              onClick={() => menuNavigate("/hrms/leave-management")}
              style={{ 
                paddingLeft: "45px", 
                cursor: "pointer",
              }}
            >
              Leave Management
            </li>
            <li
              onClick={() => navigate("/hrms/project-managers")}
              style={{ 
                paddingLeft: "45px", 
                cursor: "pointer",
              }}
            >
              Project Managers
            </li>

            {/* EXTRA (sirf ADMIN + HR + MANAGER) */}
            {(role === "ADMIN" || role === "HR" || role === "MANAGER") && (
              <>
                <li
                  onClick={() => menuNavigate("/hrms/employees-onboarding")}
                  style={{ 
                    paddingLeft: "45px", 
                    cursor: "pointer",
                  }}
                >
                  Employees Onboarding
                </li>

                <li
                  onClick={() => menuNavigate("/hrms/payroll-management")}
                  style={{ 
                    paddingLeft: "45px", 
                    cursor: "pointer",
                  }}
                >
                  Payroll Management
                </li>

        <li onClick={() => menuNavigate("/hrms/performance-appraisal")} style={{ paddingLeft: "45px", cursor: "pointer" }}>
          Performance Appraisal
        </li>
         <li onClick={() => menuNavigate("/hrms/attendance-review")} style={{ paddingLeft: "45px", cursor: "pointer" }}>
         Attendance Review
        </li>
        
      </>
    )}
  </>
)}
        {/* AI CENTER */}
        <li
          onClick={() => menuNavigate("/ai-center")}
          style={{
            backgroundColor: isActive("/ai-center") ? "#0ea5e9" : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <RiRobot2Fill size={16} color="#ffffff" />
          <span style={{ marginLeft: "10px" }}>AI Center</span>
        </li>

        {/* SETTINGS */}
        <li
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          style={{
            backgroundColor: isSettingsOpen ? "#0ea5e9" : "transparent",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IoSettings size={16} color="#ffffff" />
            <span style={{ marginLeft: "10px" }}>Settings</span>
          </div>
          {isSettingsOpen ? (
            <FaChevronDown size={12} color="#ffffff" />
          ) : (
            <FaChevronRight size={12} color="#ffffff" />
          )}
        </li>

        {isSettingsOpen && (
          <>
            <li
              onClick={() => menuNavigate("/settings/company-profile")}
              style={{ paddingLeft: "45px", cursor: "pointer", fontSize: "14px" }}
            >
              Company Profile
            </li>
            <li
              onClick={() => menuNavigate("/settings/roles-permissions")}
              style={{ paddingLeft: "45px", cursor: "pointer", fontSize: "14px" }}
            >
              Roles & Permissions
            </li>
            <li
              onClick={() => menuNavigate("/settings/security-compliance")}
              style={{ paddingLeft: "45px", cursor: "pointer", fontSize: "14px" }}
            >
              Security & Compliance
            </li>
            <li
              onClick={() => menuNavigate("/settings/ai-settings")}
              style={{ paddingLeft: "45px", cursor: "pointer", fontSize: "14px" }}
            >
              AI Settings
            </li>
          </>
        )}

        {/* LOGOUT */}
        <li
          style={{
            marginTop: "30px",
            color: "#f87171",
            cursor: "pointer",
            padding: "12px",
          }}
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
