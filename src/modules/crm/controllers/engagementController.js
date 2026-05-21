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

/*
 * Added by Pairing AI: Lead Conversion Engine
 * Invokes the Python RandomForest calibrated model for real-time lead conversion forecast.
 */
exports.predictLeadConversion = async (req, res) => {
  try {
    const { industry, budget, response_speed, meeting_count, email_open_rate, website_visits } = req.body;

    // Validate fields to ensure proper model input
    if (industry === undefined || budget === undefined || response_speed === undefined || meeting_count === undefined || email_open_rate === undefined || website_visits === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required prediction fields: industry, budget, response_speed, meeting_count, email_open_rate, website_visits."
      });
    }

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

