const express = require("express");
const router = express.Router();
const upload = require("../../config/multer");
const { screenResume, evaluateInterview, chatWithHrBot, predictPerformance, predictAttrition, predictAttritionBatch, recommendTeam, balanceWorkload, detectBurnout, benchmarkSalary } = require("./hrmsAi.controller");
const { protect, authorizeRoles } = require("../../middleware/auth.middleware");

// Expose the Smart Resume Screening & Matching API route.
// Restricted to ADMIN and HR roles to ensure candidate privacy.
router.post(
  "/resume/screen",
  protect,
  authorizeRoles("ADMIN", "HR"),
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "jd_file", maxCount: 1 }
  ]),
  screenResume
);

// Expose the AI Interview Assistant route.
// Restricted to ADMIN and HR roles to protect candidate privacy.
router.post(
  "/interview/evaluate",
  protect,
  authorizeRoles("ADMIN", "HR"),
  upload.fields([
    { name: "audio_file", maxCount: 1 }
  ]),
  evaluateInterview
);

// Expose the AI HR Chatbot route.
// Restricted to authenticated users.
router.post(
  "/hr-chatbot/chat",
  protect,
  chatWithHrBot
);

// Expose the Performance Prediction route.
// Restricted to ADMIN and HR roles.
router.post(
  "/performance/predict",
  protect,
  authorizeRoles("ADMIN", "HR"),
  predictPerformance
);

// Expose the Attrition Prediction route (Single).
// Restricted to ADMIN and HR roles.
router.post(
  "/attrition/predict",
  protect,
  authorizeRoles("ADMIN", "HR"),
  predictAttrition
);

// Expose the Attrition Prediction route (Batch).
// Restricted to ADMIN and HR roles.
router.post(
  "/attrition/predict/batch",
  protect,
  authorizeRoles("ADMIN", "HR"),
  predictAttritionBatch
);

// Expose the Intelligent Team Formation route.
// Restricted to ADMIN and HR roles.
router.post(
  "/team/recommend",
  protect,
  authorizeRoles("ADMIN", "HR"),
  recommendTeam
);

// Expose the Workload Balancing Engine route.
// Restricted to ADMIN and HR roles.
router.post(
  "/workload/balance",
  protect,
  authorizeRoles("ADMIN", "HR"),
  balanceWorkload
);

// Expose the Burnout & Engagement Detection route.
// Restricted to ADMIN and HR roles.
router.post(
  "/burnout/detect",
  protect,
  authorizeRoles("ADMIN", "HR"),
  detectBurnout
);

// Expose the AI Salary Benchmarking route.
// Restricted to ADMIN and HR roles.
router.post(
  "/salary/benchmark",
  protect,
  authorizeRoles("ADMIN", "HR"),
  benchmarkSalary
);

module.exports = router;


