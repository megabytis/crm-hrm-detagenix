const express = require("express");
const router = express.Router();
const controller = require("./user.controller");
const { protect, authorizeRoles } = require("../../middleware/auth.middleware");



/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user (HR → Employee / BDE)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [EMPLOYEE, BDE, MANAGER]
 *     responses: 
 *       201:
 *         description : User created successfully
 */
router.post(
  "/",
  protect,
  authorizeRoles("ADMIN", "HR"),
  controller.createUser
);


module.exports = router;
  