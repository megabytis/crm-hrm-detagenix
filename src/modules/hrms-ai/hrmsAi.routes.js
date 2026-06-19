const express = require("express");
const router = express.Router();
const upload = require("../../config/multer");
const { screenResume, evaluateInterview, chatWithHrBot } = require("./hrmsAi.controller");
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

module.exports = router;


