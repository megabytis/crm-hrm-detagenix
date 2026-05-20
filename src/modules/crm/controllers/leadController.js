// src/modules/leads/lead.controller.js
const Lead = require("../models/Lead");
const aiService = require("../../../utils/aiService");

exports.createLead = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const existing = await Lead.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Lead with this email already exists" });
      }
    }

    const lead = await Lead.create(req.body);

    // AI Integration: Predict Lead Temperature (Asynchronous)
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

    res.status(201).json({ message: "Lead created", data: lead });
  } catch (error) {
    console.error("Lead creation error:", error);
    res
      .status(500)
      .json({ message: "Error creating lead", error: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find();
    res.status(200).json({ message: "All leads", data: leads });
  } catch (error) {
    console.error("Fetch leads error:", error);
    res
      .status(500)
      .json({ message: "Error fetching leads", error: error.message });
  }
};

exports.getSingleLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ message: "Single lead", data: lead });
  } catch (error) {
    console.error("Fetch single lead error:", error);
    res
      .status(500)
      .json({ message: "Error fetching lead", error: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // AI Integration: Re-evaluate Lead Temperature on Update
    aiService
      .predictLeadTemperature(lead.toObject())
      .then(async (prediction) => {
        if (prediction && prediction.success && prediction.prediction) {
          lead.ml_prediction = prediction.prediction;
          if (prediction.unique_id) lead.ai_unique_id = prediction.unique_id;
          await lead.save();
        }
      })
      .catch((err) => console.error("AI Update Prediction Error:", err));

    res.status(200).json({ message: "Lead updated", data: lead });
  } catch (error) {
    console.error("Update lead error:", error);
    res
      .status(500)
      .json({ message: "Error updating lead", error: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json({ message: "Lead deleted" });
  } catch (error) {
    console.error("Delete lead error:", error);
    res
      .status(500)
      .json({ message: "Error deleting lead", error: error.message });
  }
};

exports.getLeadInsights = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    // [OLD] Original call — kept for reference
    // const insights = await aiService.generateInsights(req.params.id, {
    //   leadData: lead,
    // });

    // [NEW] Added source_type so FastAPI's /ai-insights/generate receives it in JSON body
    const insights = await aiService.generateInsights(req.params.id, {
      source_type: "meeting_notes",
      conversation_text: JSON.stringify(lead),
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

exports.generateLeadEmail = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, message: "Lead not found" });
    }

    if (!lead.ai_unique_id) {
      return res.status(400).json({
        success: false,
        message:
          "This lead does not have an AI unique ID associated with it. Please update the lead to trigger AI processing.",
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
        message: "AI Email Generation service unavailable or failed.",
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
