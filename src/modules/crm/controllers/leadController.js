// src/modules/leads/lead.controller.js
const Lead = require("../models/Lead");
const aiService = require("../../../utils/aiService");

/**
 * CREATE LEAD
 */
exports.createLead = async (req, res) => {
  try {
    const { email } = req.body;

    // Duplicate check (scoped to tenant)
    if (email) {
      const existing = await Lead.findOne({
        email,
        tenantId: req.user.tenantId,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Lead with this email already exists",
        });
      }
    }

    const lead = await Lead.create({
      ...req.body,
      tenantId: req.user.tenantId,
    });

    // AI prediction (async)
    aiService
      .predictLeadTemperature(req.body)
      .then(async (prediction) => {
        if (prediction && prediction.success && prediction.prediction) {
          lead.ml_prediction = prediction.prediction;
          if (prediction.unique_id) lead.ai_unique_id = prediction.unique_id;
          await lead.save();
        }
      })
      .catch((err) => console.error("AI Prediction Error:", err));

    res.status(201).json({
      success: true,
      message: "Lead created",
      data: lead,
    });
  } catch (error) {
    console.error("Lead creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating lead",
      error: error.message,
    });
  }
};

/**
 * GET ALL LEADS
 */
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ tenantId: req.user.tenantId });

    res.status(200).json({
      success: true,
      message: "All leads",
      data: leads,
    });
  } catch (error) {
    console.error("Fetch leads error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leads",
      error: error.message,
    });
  }
};

/**
 * GET SINGLE LEAD
 */
exports.getSingleLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Single lead",
      data: lead,
    });
  } catch (error) {
    console.error("Fetch single lead error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lead",
      error: error.message,
    });
  }
};

/**
 * UPDATE LEAD
 */
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      req.body,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // AI re-evaluation
    aiService
      .predictLeadTemperature(lead.toObject())
      .then(async (prediction) => {
        if (prediction && prediction.success && prediction.prediction) {
          lead.ml_prediction = prediction.prediction;
          if (prediction.unique_id) lead.ai_unique_id = prediction.unique_id;
          await lead.save();
        }
      })
      .catch((err) =>
        console.error("AI Update Prediction Error:", err)
      );

    res.status(200).json({
      success: true,
      message: "Lead updated",
      data: lead,
    });
  } catch (error) {
    console.error("Update lead error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating lead",
      error: error.message,
    });
  }
};

/**
 * DELETE LEAD
 */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted",
    });
  } catch (error) {
    console.error("Delete lead error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting lead",
      error: error.message,
    });
  }
};

/**
 * AI INSIGHTS
 */
exports.getLeadInsights = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const insights = await aiService.generateInsights(req.params.id, {
      leadData: lead,
    });

    if (!insights || !insights.success) {
      return res.status(503).json({
        success: false,
        message: "AI Insights service unavailable or failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "AI Insights generated successfully",
      data: insights.insights,
    });
  } catch (error) {
    console.error("Get Lead Insights error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lead insights",
      error: error.message,
    });
  }
};

/**
 * AI EMAIL GENERATION
 */
exports.generateLeadEmail = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (!lead.ai_unique_id) {
      return res.status(400).json({
        success: false,
        message:
          "AI unique ID missing. Please update lead to trigger AI processing.",
      });
    }

    const { deal_stage, past_communication } = req.body;

    const emailResponse = await aiService.generateEmail({
      unique_id: lead.ai_unique_id,
      deal_stage: deal_stage || "Prospect",
      past_communication: past_communication || "",
    });

    if (!emailResponse || !emailResponse.success) {
      return res.status(503).json({
        success: false,
        message: "AI Email service unavailable or failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "AI Email generated successfully",
      data: {
        subject: emailResponse.subject,
        body: emailResponse.body,
        lead_temperature: emailResponse.lead_temperature,
      },
    });
  } catch (error) {
    console.error("Generate Lead Email error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating lead email",
      error: error.message,
    });
  }
};