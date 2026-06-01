const express = require("express");
const router = express.Router();

const { predictClientLTV, optimizeFollowupStrategy, predictLeadConversion, trainConversionModel } = require("../controllers/engagementController");
const { protect } = require("../../../middleware/auth.middleware");
const { authorizeRoles } = require("../../../middleware/role.middleware");
const upload = require("../../../config/multer"); // Added to support document file uploads

// Restrict routes to authenticated users with appropriate roles
router.post( "/clv/predict", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), predictClientLTV );
router.post( "/followup/optimize", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), optimizeFollowupStrategy );

/*
 * Added by Pairing AI: Lead Conversion Engine Routes
 * Connects the conversion forecast and retrain triggers.
 */
// ==============================================================================
// LEGACY JSON-BASED PREDICT ROUTE
// Kept for reference. Do not delete.
// ------------------------------------------------------------------------------
// router.post( "/conversion/predict", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), predictLeadConversion );
// ==============================================================================

// UPDATED MULTIPART FORM-DATA PREDICT ROUTE (CTO SPEC)
router.post( "/conversion/predict", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), upload.single("document"), predictLeadConversion );

router.post( "/conversion/train", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), trainConversionModel );

module.exports = router;
