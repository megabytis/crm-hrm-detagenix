const express = require("express");
const router = express.Router();

const { chat } = require("../controllers/chatbotController");
const { protect } = require("../../../middleware/auth.middleware");
const { authorizeRoles } = require("../../../middleware/role.middleware");

// Depending on requirements, we can restrict who has access to the Chatbot
router.post("/chat", protect, authorizeRoles("ADMIN", "MANAGER", "BD"), chat);

module.exports = router;
