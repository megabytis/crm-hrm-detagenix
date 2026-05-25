const express = require("express");
const router = express.Router();

const controller = require(
  "../controllers/leadConversion.controller"
);

const upload = require("../../../config/multer");

router.post(
  "/predict",
  upload.single("document"),
  controller.createPrediction
);

router.get(
  "/",
  controller.getPredictions
);

router.get(
  "/stats",
  controller.getStats
);

module.exports = router;