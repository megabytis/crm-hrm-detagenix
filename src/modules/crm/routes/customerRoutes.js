const express = require("express");
const router = express.Router();

const {
  createCustomer,
  getCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer
} = require("../controllers/customerController");

const { protect, authorizeRoles } = require("../../../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: CRM Customer APIs
 */

router.post("/", protect, authorizeRoles("ADMIN", "MANAGER", "BDE"), createCustomer);
router.get("/", protect, authorizeRoles("ADMIN", "MANAGER", "BDE"), getCustomers);
router.get("/:id", protect, authorizeRoles("ADMIN", "MANAGER", "BDE"), getSingleCustomer);
router.put("/:id", protect, authorizeRoles("ADMIN", "MANAGER", "BDE"), updateCustomer);
router.delete("/:id", protect, authorizeRoles("ADMIN", "MANAGER", "BDE"), deleteCustomer);


module.exports = router;