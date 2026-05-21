const express = require("express");
const router = express.Router();

const { predictClientLTV, optimizeFollowupStrategy, predictLeadConversion, trainConversionModel } = require("../controllers/engagementController");
const { protect } = require("../../../middleware/auth.middleware");
const { authorizeRoles } = require("../../../middleware/role.middleware");

// Restrict routes to authenticated users with appropriate roles
router.post( "/clv/predict", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), predictClientLTV );
router.post( "/followup/optimize", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), optimizeFollowupStrategy );

/*
 * Added by Pairing AI: Lead Conversion Engine Routes
 * Connects the conversion forecast and retrain triggers.
 */
router.post( "/conversion/predict", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), predictLeadConversion );
router.post( "/conversion/train", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), trainConversionModel );

module.exports = router;
