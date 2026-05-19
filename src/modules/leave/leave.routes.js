const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  getLeaveStats
} = require("./leave.controller");

const { protect, authorizeRoles } = require("../../middleware/auth.middleware");

// Employee apply leave
router.post(
  "/apply",
  protect,
  authorizeRoles("EMPLOYEE","MANAGER","HR"),
  applyLeave
);

// Employee view own leaves
router.get(
  "/my",
  protect,
  authorizeRoles("EMPLOYEE","MANAGER","HR"),
  getMyLeaves
);

// Admin / HR view all leaves
router.get(
  "/all",
  protect,
  authorizeRoles("ADMIN", "HR","MANAGER"),
  getAllLeaves
);

// Approve / Reject leave
router.put(
  "/update/:id",
  protect,
  authorizeRoles("ADMIN", "HR"),
  updateLeaveStatus
);
// Get leave statistics
router.get(
  "/leave-stats/:employeeId",
  protect,
  getLeaveStats
);

module.exports = router;
