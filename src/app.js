const express = require("express");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const leadRoutes = require("./modules/crm/routes/leadRoutes");
const customerRoutes = require("./modules/crm/routes/customerRoutes");
const activityRoutes = require("./modules/crm/routes/activityRoutes");
const dealRoutes = require("./modules/crm/routes/dealRoutes");
const reportRoutes = require("./modules/crm/routes/reportRoutes");
const chatbotRoutes = require("./modules/crm/routes/chatbotRoutes");
const leadGenerationRoutes = require("./modules/crm/routes/leadGenerationRoutes");
const engagementRoutes = require("./modules/crm/routes/engagementRoutes");
const conversationIntelligenceRoutes = require("./modules/crm/routes/conversationIntelligenceRoutes");
const leaveRoutes = require("./modules/leave/leave.routes");
const attendanceRoutes = require("./modules/attendance/attendance.routes");
const payrollRoutes = require("./modules/payroll/payroll.routes");
const reviewRoutes = require("./modules/performance/performance.routes");
const profileRoutes = require("./modules/profile/profile.routes");
const managerDashboardRoutes = require("./modules/dashboard/manager/manager.dashboard.routes");
const projectRoutes = require("./modules/project/project.routes");
const requestRoutes = require("./modules/request/request.routes");
const onboardingRoutes = require("./modules/onboarding/onboarding.routes");
const salaryRoutes = require("./modules/salaryStructure/salaryStructure.routes");
const aiAdminRoutes = require("./modules/ai-admin/aiAdmin.routes");
const app = express();

// ========================================
// 🌍 GLOBAL MIDDLEWARES
// ========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// SWAGGER DOCS
// ========================================
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// ========================================
// 🔐 AUTH & USERS
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin/ai", aiAdminRoutes);

// ========================================
// 📊 DASHBOARD
// ========================================
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/manager/dashboard", managerDashboardRoutes);

// ========================================
// 📈 CRM MODULE
// ========================================
app.use("/api/crm/leads", leadRoutes);
app.use("/api/crm/customers", customerRoutes);
app.use("/api/crm/activities", activityRoutes);
app.use("/api/crm/deals", dealRoutes);
app.use("/api/crm/reports", reportRoutes);
app.use("/api/crm/chatbot", chatbotRoutes);
app.use("/api/crm/lead-generation", leadGenerationRoutes);
app.use("/api/crm/engagement", engagementRoutes);
app.use("/api/crm/conversation-intelligence", conversationIntelligenceRoutes);

// ========================================
// 🏢 HRM MODULE
// ========================================
app.use("/api/hrm/leaves", leaveRoutes);
app.use("/api/hrm/attendance", attendanceRoutes);
app.use("/api/hrm/payroll", payrollRoutes);
app.use("/api/hrm/review", reviewRoutes);
app.use("/api/hrm/profile", profileRoutes);
app.use("/api/hrm/request", requestRoutes);
app.use("/api/hrm/onboarding", onboardingRoutes);
app.use("/api/hrm/salary-structure", salaryRoutes);
app.use("/api/hrm/ai", hrAiRoutes);

// ========================================
// 🛑 HEALTH CHECK (Optional but Recommended)
// ========================================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM + HRM API running successfully",
  });
});

// ========================================
// 🚫 404 HANDLER
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// ========================================
// 💥 GLOBAL ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;














































































































































































