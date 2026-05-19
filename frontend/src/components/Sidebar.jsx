import { FaUser } from "react-icons/fa6";
import { AiFillShopping } from "react-icons/ai";
import { GiHandBag } from "react-icons/gi";
import { RiRobot2Fill } from "react-icons/ri";
import { IoSettings } from "react-icons/io5";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import logo from "../assets/logo.jpeg";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

const Sidebar = () => {
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
      "/sales-activities",
      "/sales-pipeline",
      "/forecast",
      "/customer-management",
    ];

    if (crmPages.includes(location.pathname)) {
      setIsCrmOpen(true);
      setIsUserManagementOpen(false);
      setIsHrmsOpen(false);
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
        {(role === "ADMIN" || role === "MANAGER" || role === "BDE") && (
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
                  onClick={() => menuNavigate("/leads-management")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Leads Management
                </li>

                <li
                  onClick={() => menuNavigate("/sales-activities")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Sales Activities
                </li>

                <li
                  onClick={() => menuNavigate("/sales-pipeline")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Sales Pipeline & Forecast
                </li>

                <li
                  onClick={() => menuNavigate("/customer-management")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Customer Management
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
              style={{ paddingLeft: "45px", cursor: "pointer" }}
            >
              My Profile
            </li>

            <li
              onClick={() => menuNavigate("/hrms/leave-management")}
              style={{ paddingLeft: "45px", cursor: "pointer" }}
            >
              Leave Management
            </li>
            <li
              onClick={() => navigate("/hrms/project-managers")}
              style={{ paddingLeft: "45px", cursor: "pointer" }}
            >
              Project Managers
            </li>

            {/* EXTRA (sirf ADMIN + HR + MANAGER) */}
            {(role === "ADMIN" || role === "HR" || role === "MANAGER") && (
              <>
                <li
                  onClick={() => menuNavigate("/hrms/employees-onboarding")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Employees Onboarding
                </li>

                <li
                  onClick={() => menuNavigate("/hrms/payroll-management")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Payroll Management
                </li>

                <li
                  onClick={() => menuNavigate("/hrms/performance-appraisal")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Performance Appraisal
                </li>
                <li
                  onClick={() => menuNavigate("/hrms/attendance-review")}
                  style={{ paddingLeft: "45px", cursor: "pointer" }}
                >
                  Attendance Review
                </li>
              </>
            )}
          </>
        )}
        {/* AI CENTER */}
        <li>
          <RiRobot2Fill size={16} color="#ffffff" /> AI Center
        </li>

        {/* SETTINGS */}
        <li>
          <IoSettings size={16} color="#ffffff" /> Settings
        </li>

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
