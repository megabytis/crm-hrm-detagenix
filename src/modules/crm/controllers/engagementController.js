const aiService = require("../../../utils/aiService");

exports.predictClientLTV = async (req, res) => {
  try {
    const { customer_id, industry_type, engagement_level, purchase_behavior } = req.body;

    if (!customer_id || !industry_type || !engagement_level || !purchase_behavior) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: customer_id, industry_type, engagement_level, and purchase_behavior.",
      });
    }

    const prediction = await aiService.predictClv({
      customer_id,
      industry_type,
      engagement_level,
      purchase_behavior
    });

    if (!prediction) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate Client LTV prediction. AI service may be unavailable.",
      });
    }

    res.status(200).json(prediction);
  } catch (error) {
    console.error("Predict Client LTV Error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while generating LTV prediction.",
      error: error.message,
    });
  }
};

exports.optimizeFollowupStrategy = async (req, res) => {
  try {
    const { lead_id, interactions } = req.body;

    if (!lead_id || !interactions || !Array.isArray(interactions) || interactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lead_id and interactions array.",
      });
    }

    const optimization = await aiService.optimizeFollowup({
      lead_id,
      interactions
    });

    if (!optimization) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate Follow-up Optimization. AI service may be unavailable.",
      });
    }

    res.status(200).json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error("Optimize Followup Strategy Error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while optimizing follow-up strategy.",
      error: error.message,
    });
  }
};

/**
 * Invokes the Python RandomForest calibrated model for real-time lead conversion forecast.
 * Performs dual-layer type coercion, parameter fallback (mapping camelCase to snake_case),
 * and sanitization to defend the AI server against invalid inputs or Pydantic validation errors.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Prediction fields containing industry, budget, response_speed, etc.
 * @param {Object} res - Express response object.
 */
exports.predictLeadConversion = async (req, res) => {
  try {
    // Robustly extract parameters, supporting both standard snake_case and client camelCase keys
    const rawIndustry = req.body.industry !== undefined ? req.body.industry : "SaaS";
    const rawBudget = req.body.budget !== undefined ? req.body.budget : 0;
    const rawResponseSpeed = req.body.response_speed !== undefined ? req.body.response_speed : req.body.responseSpeed;
    const rawMeetingCount = req.body.meeting_count !== undefined ? req.body.meeting_count : req.body.meetingCount;
    const rawEmailOpenRate = req.body.email_open_rate !== undefined ? req.body.email_open_rate : req.body.emailOpenRate;
    const rawWebsiteVisits = req.body.website_visits !== undefined ? req.body.website_visits : req.body.websiteVisits;

    // Coerce inputs to numbers and handle empty strings, nulls, or undefined values safely
    const parsedBudget = (rawBudget === "" || rawBudget === null || rawBudget === undefined) ? 0 : Number(rawBudget);
    const parsedResponseSpeed = (rawResponseSpeed === "" || rawResponseSpeed === null || rawResponseSpeed === undefined) ? 0 : Number(rawResponseSpeed);
    const parsedMeetingCount = (rawMeetingCount === "" || rawMeetingCount === null || rawMeetingCount === undefined) ? 0 : Number(rawMeetingCount);
    const parsedEmailOpenRate = (rawEmailOpenRate === "" || rawEmailOpenRate === null || rawEmailOpenRate === undefined) ? 0 : Number(rawEmailOpenRate);
    const parsedWebsiteVisits = (rawWebsiteVisits === "" || rawWebsiteVisits === null || rawWebsiteVisits === undefined) ? 0 : Number(rawWebsiteVisits);

    // Sanitize output floats to prevent any NaN values and keep inputs >= 0 (satisfying model constraints)
    const budget = isNaN(parsedBudget) || parsedBudget < 0 ? 0 : parsedBudget;
    const response_speed = isNaN(parsedResponseSpeed) || parsedResponseSpeed < 0 ? 0 : parsedResponseSpeed;
    const meeting_count = isNaN(parsedMeetingCount) || parsedMeetingCount < 0 ? 0 : parsedMeetingCount;
    const email_open_rate = isNaN(parsedEmailOpenRate) || parsedEmailOpenRate < 0 ? 0 : parsedEmailOpenRate;
    const website_visits = isNaN(parsedWebsiteVisits) || parsedWebsiteVisits < 0 ? 0 : parsedWebsiteVisits;
    const industry = (typeof rawIndustry === "string" && rawIndustry.trim().length > 0) ? rawIndustry.trim() : "SaaS";

    const prediction = await aiService.predictConversionProbability({
      industry,
      budget,
      response_speed,
      meeting_count,
      email_open_rate,
      website_visits
    });

    if (!prediction) {
      return res.status(503).json({
        success: false,
        message: "AI Lead Conversion prediction failed. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error("Predict Lead Conversion Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during conversion prediction.",
      error: error.message
    });
  }
};

/*
 * Added by Pairing AI: Lead Conversion Retraining
 * Triggers historical retraining of the Lead Scoring random forest classifier.
 */
exports.trainConversionModel = async (req, res) => {
  try {
    const { limit, minRows } = req.body;

    const trainResult = await aiService.trainConversionModel(limit, minRows);

    if (!trainResult) {
      return res.status(503).json({
        success: false,
        message: "Model training triggered unsuccessfully or AI service offline."
      });
    }

    res.status(200).json({
      success: true,
      message: "Model trained successfully",
      data: trainResult
    });
  } catch (error) {
    console.error("Train Conversion Model Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during conversion model training.",
      error: error.message
    });
  }
};

