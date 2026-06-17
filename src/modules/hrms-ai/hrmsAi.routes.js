const express = require("express");
const router = express.Router();
const upload = require("../../config/multer");
const { screenResume } = require("./hrmsAi.controller");
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

module.exports = router;
