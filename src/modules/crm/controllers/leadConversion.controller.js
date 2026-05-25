const LeadConversion = require("../models/LeadConversion");

// Create Prediction
exports.createPrediction = async (req, res) => {
  try {
    const {
      industry,
      budget,
      responseSpeed,
      meetingCount,
      emailOpenRate,
      websiteVisits,
    } = req.body;

    let score = 0;

    if (Number(budget) >= 50000) score += 25;

    if (Number(responseSpeed) <= 2) score += 20;

    if (Number(meetingCount) >= 3) score += 20;

    if (Number(emailOpenRate) >= 50) score += 20;

    if (Number(websiteVisits) >= 10) score += 15;

    const probability = Math.min(score, 100);

    const status =
      probability >= 70
        ? "Converted"
        : "Pending";

    const lead = await LeadConversion.create({
      industry,
      budget,
      responseSpeed,
      meetingCount,
      emailOpenRate,
      websiteVisits,

      document: req.file
        ? req.file.path
        : null,

      probability,
      status,
    });

    return res.status(201).json({
      success: true,
      message:
        "Lead conversion prediction created successfully",
      data: lead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Predictions
exports.getPredictions = async (req, res) => {
  try {
    const predictions =
      await LeadConversion.find().sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Dashboard Stats
exports.getStats = async (req, res) => {
  try {
    const totalLeads =
      await LeadConversion.countDocuments();

    const convertedLeads =
      await LeadConversion.countDocuments({
        status: "Converted",
      });

    const pendingLeads =
      await LeadConversion.countDocuments({
        status: "Pending",
      });

    const conversionRate =
      totalLeads > 0
        ? (
            (convertedLeads / totalLeads) *
            100
          ).toFixed(2)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalLeads,
        convertedLeads,
        pendingLeads,
        conversionRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};