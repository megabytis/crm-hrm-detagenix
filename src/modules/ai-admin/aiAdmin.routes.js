const express = require("express");
const router = express.Router();

const { trainConversionModel, runBatchPrediction } = require("./aiAdmin.controller");
const { protect } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");

// Restrict these sensitive AI admin routes strictly to the ADMIN role
router.use(protect);
router.use(authorizeRoles("ADMIN"));

router.post("/train-conversion-model", trainConversionModel);
router.post("/batch-predict", runBatchPrediction);

module.exports = router;
