const express = require("express");
const router = express.Router();

const { screenCandidateResume, predictAttrition } = require("./hrAi.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");

// Restrict to ADMIN and HR
router.use(protect);
router.use(authorizeRoles("ADMIN", "HR"));

router.post("/resume-screening", screenCandidateResume);
router.post("/attrition-prediction", predictAttrition);

module.exports = router;
