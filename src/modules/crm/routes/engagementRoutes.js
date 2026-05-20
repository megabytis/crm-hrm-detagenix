const express = require("express");
const router = express.Router();

const { predictClientLTV, optimizeFollowupStrategy } = require("../controllers/engagementController");
const { protect } = require("../../../middleware/auth.middleware");
const { authorizeRoles } = require("../../../middleware/role.middleware");

// Restrict routes to authenticated users with appropriate roles
router.post( "/clv/predict", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), predictClientLTV );
router.post( "/followup/optimize", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), optimizeFollowupStrategy );

module.exports = router;
