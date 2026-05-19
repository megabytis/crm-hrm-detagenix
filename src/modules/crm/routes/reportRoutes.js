const express = require("express");
const router = express.Router();

const {
  dashboardStats,
  getSalesForecast,
} = require("../controllers/reportController");

const { protect } = require("../../../middleware/auth.middleware");
const { authorizeRoles } = require("../../../middleware/role.middleware");

router.get(
  "/dashboard",
  protect,
  authorizeRoles("ADMIN", "MANAGER", "BD"),
  dashboardStats,
);
router.get(
  "/sales-forecast",
  protect,
  authorizeRoles("ADMIN", "MANAGER", "BD"),
  getSalesForecast,
);

module.exports = router;
