const express = require("express");
const router = express.Router();

const {
  punchIn,
  punchOut,
  getMyAttendance,
  getAllAttendance,
  getTodayAttendanceStats,
  getEmployeeOverview 
} = require("./attendance.controller");

const { protect, authorizeRoles } = require("../../middleware/auth.middleware");

router.post("/punch-in", protect, authorizeRoles("EMPLOYEE", "MANAGER", "HR"), punchIn);
router.post("/punch-out", protect, authorizeRoles("EMPLOYEE", "MANAGER", "HR"), punchOut);

// Employee + Manager + HR → own attendance dekh sakte hain
router.get("/my", protect, authorizeRoles("EMPLOYEE", "MANAGER", "HR"), getMyAttendance);

// HR + ADMIN + MANAGER → sabka data dekh sakte hain
router.get("/all", protect, authorizeRoles("HR", "ADMIN", "MANAGER"), getAllAttendance);
router.get("/dashboard-stats", getTodayAttendanceStats); // 
router.get("/employee-overview", getEmployeeOverview);
module.exports = router;