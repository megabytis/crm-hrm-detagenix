const express = require("express");
const router = express.Router();

const {
  getEmployeeProfile,
  updateEmployeeProfile,
   resetPassword
} = require("./profile.controller");

const { protect, authorizeRoles } = require("../../middleware/auth.middleware");

// Get Profile
router.get(
  "/:id",
  protect,
  authorizeRoles("ADMIN", "HR", "EMPLOYEE","MANAGER"),
  getEmployeeProfile
);

// ✅ Update Profile
router.put(
  "/update/:id",
  protect,
  authorizeRoles("ADMIN","HR","EMPLOYEE","MANAGER"),
  updateEmployeeProfile
);
router.put(
  "/reset-password/:id",
  protect,
  authorizeRoles("ADMIN", "HR","EMPLOYEE","MANAGER"), // 🔥 important (employee ko allow mat karo)
  resetPassword
);
module.exports = router;