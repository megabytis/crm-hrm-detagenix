import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PublicRoutes from "./components/routes/PublicRoutes";
import PrivateRoutes from "./components/routes/PrivateRoutes";
import Home from "./pages/Home";
import Login from "./pages/Login";
import OTPVerification from "./pages/OTPVerification";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import NewPassword from "./pages/NewPassword";
import DashboardRouter from "./components/DashboardRouter";
import Users from "./components/Users";
import LeadsManagement from "./components/CRMComponents/LeadsManagement";
import SalesActivities from "./components/CRMComponents/SalesActivities";
import SalesPipeline from "./components/CRMComponents/SalesPipeline";
import AttendanceManagement from "./components/HRMSComponents/AttendanceManagement";
import EmployeeProfile from "./components/HRMSComponents/EmployeesProfile";
import LeaveManagement from "./components/HRMSComponents/LeaveManagement";
import PayrollManagement from "./components/HRMSComponents/PayrollManagement";
import CustomerManagement from "./components/CRMComponents/CustomerManagement";
import EmployeesOnboarding from "./components/HRMSComponents/EmployeesOnboarding";
import PerformanceAppraisal from "./components/HRMSComponents/PerformanceAppraisal";
import EmployeeSelfService from "./components/HRMSComponents/EmployeeSelfService";
import ManagerDashboard from "./components/ManagerDashboard/ManagerDashboard"
import EmployeeDashboard from "./components/EmployeeDashboard/EmployeeDashboard";
import HRDashboard from "./components/HRDashboard/HRDashboard"
import BDEDashboard from "./components/SalesDashboard/SalesDashboard";
import UserList from "./components/UserList"
import ProjectManagers from "./components/HRMSComponents/ProjectManagers";
import AttendanceReview from "./components/HRMSComponents/AttendanceReview";
import AddLead from "./components/CRMComponents/CRMSubPage/AddLead";
import LeadConversion from "./components/CRMComponents/CRMSubPage/LeadConversion";
import LeadGeneration from "./components/CRMComponents/CRMSubPage/LeadGeneration";
import FollowUpAI from "./components/CRMComponents/FollowUpAI";
import ClientLTV from "./components/CRMComponents/ClientLTV";
import AIInsights from "./components/CRMComponents/AIInsights";
import MlStats from "./components/CRMComponents/MlStats";
import CRMChatbot from "./components/CRMComponents/CRMChatbot";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoutes>
                <Home />
              </PublicRoutes>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoutes>
                <Login />
              </PublicRoutes>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoutes>
                <ForgotPassword />
              </PublicRoutes>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoutes>
                <ResetPassword />
              </PublicRoutes>
            }
          />
          <Route
            path="/otp-verification"
            element={
              <PublicRoutes>
                <OTPVerification />
              </PublicRoutes>
            }
          />
          <Route
            path="/new-password"
            element={
              <PublicRoutes>
                <NewPassword />
              </PublicRoutes>
            }
          />

          {/* Private Routes */}
          <Route

path="/dashboard"
  element={
    <PrivateRoutes>
      <DashboardRouter />
    </PrivateRoutes>
  }
/>
        

<Route
  path="/manager-dashboard"
  element={
    <PrivateRoutes>
      <ManagerDashboard />   
    </PrivateRoutes>
  }
/>
<Route
 path="/hrms/project-managers" 
 element={
  <PrivateRoutes>
 <ProjectManagers />
 </PrivateRoutes>
 } 
 />
<Route
  path="/sales-dashboard"
  element={
    <PrivateRoutes>
      <BDEDashboard />   
    </PrivateRoutes>
  }
/>
<Route 
path="/userlist" 
element={
 <PrivateRoutes> 
<UserList />
</PrivateRoutes>
}
 />
    <Route 
    path="/employee-dashboard" 
    element={
      <PrivateRoutes>
    <EmployeeDashboard />
    </PrivateRoutes>
    } />
    <Route 
    path="/hr-dashboard" 
    element={
      <PrivateRoutes>
    <HRDashboard />
    </PrivateRoutes>
    } />

          <Route
            path="/users"
            element={
              <PrivateRoutes>
                <Users />
              </PrivateRoutes>
            }
          />
          <Route
            path="/leads-management"
            element={
              <PrivateRoutes>
                <LeadsManagement />
              </PrivateRoutes>
            }
          />
            <Route
            path="/crm/add-lead"
            element={
              <PrivateRoutes>
                <AddLead />
              </PrivateRoutes>
            }
          />
          <Route
            path="/crm/lead-conversion"
            element={
              <PrivateRoutes>
                <LeadConversion />
              </PrivateRoutes>
            }
          />
          <Route
            path="/crm/lead-generation"
            element={
              <PrivateRoutes>
                <LeadGeneration />
              </PrivateRoutes>
            }
          />
          <Route
            path="/sales-activities"
            element={
              <PrivateRoutes>
                <SalesActivities />
              </PrivateRoutes>
            }
          />
          <Route
  path="/crm/followup-ai"
  element={
    <PrivateRoutes>
      <FollowUpAI />
    </PrivateRoutes>
  }
/>
<Route 
path="/crm/ai-insights" 
element={

 <PrivateRoutes>
      <AIInsights />
    </PrivateRoutes>
} 
/>
<Route
  path="/crm/client-ltv"
  element={
    <PrivateRoutes>
      <ClientLTV />
    </PrivateRoutes>
  }
/>
<Route
  path="/crm/ml-stats"
  element={
    <PrivateRoutes>
      <MlStats />
    </PrivateRoutes>
  }
/>
<Route 
path="/crm/chatbot" 
element={
  <PrivateRoutes>
<CRMChatbot />
</PrivateRoutes>
}
 />
          <Route
          
            path="/sales-pipeline"
            element={
              <PrivateRoutes>
                <SalesPipeline />
              </PrivateRoutes>
            }
          />
          <Route
            path="/customer-management"
            element={
              <PrivateRoutes>
                <CustomerManagement />
              </PrivateRoutes>
            }
          />
          <Route
            path="/hrms/attendance"
            element={
              <PrivateRoutes>
                <AttendanceManagement />
              </PrivateRoutes>
            }
          />
          <Route
            path="/hrms/attendance-review"
            element={
              <PrivateRoutes>
                <AttendanceReview />
              </PrivateRoutes>
            }
          />
          <Route
  path="/hrms/employees-onboarding"
  element={
    <PrivateRoutes>
      <EmployeesOnboarding />
    </PrivateRoutes>
  }
/>
<Route
  path="/hrms/employee-profile"
  element={
    <PrivateRoutes>
      <EmployeeProfile />
    </PrivateRoutes>
  }
/>
<Route
    path="/hrms/payroll-management"
    element={
      <PrivateRoutes>
        <PayrollManagement />
      </PrivateRoutes>
    }
  />
  <Route
  path="/hrms/leave-management"
  element={
    <PrivateRoutes>
      <LeaveManagement />
    </PrivateRoutes>
  }
/>
<Route
  path="/hrms/performance-appraisal"
  element={
    <PrivateRoutes>
      <PerformanceAppraisal />
    </PrivateRoutes>
  }
/>
  <Route
  path="/hrms/EmployeeSelfService"
  element={
    <PrivateRoutes>
      <EmployeeSelfService />
    </PrivateRoutes>
  }
/>
  
  {/* EmployeeSelfService */}
          {/* Catch all route */}
          <Route
            path="*"
            element={
              <div className="text-center mt-20 text-2xl">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
