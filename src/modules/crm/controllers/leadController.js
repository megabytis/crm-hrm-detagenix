const Lead = require("../models/Lead");
const aiService = require("../../../utils/aiService");

/* ================= CREATE LEAD ================= */

// exports.createLead = async (req, res) => {
//   try {

//     console.log("BODY DATA:", req.body);

//     const lead = await Lead.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Lead created successfully",
//       data: lead,
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to create lead",
//       error: error.message,
//     });
//   }
// };
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

    // Ensure role_position is set if role is passed
    if (req.body.role && !req.body.role_position) {
      req.body.role_position = req.body.role;
    }

    // console.log("BODY DATA:", req.body);

    const companyCode = "DTGNX";
    const year = new Date().getFullYear();

    /*
      ========================================================================
      ORIGINAL SUFFIX GENERATOR
      (Commented out to prevent MongoDB unique key constraint (11000) collision 
       exceptions when leads are deleted or sequence numbers do not match)
      ------------------------------------------------------------------------
      // Total leads count
      const totalLeads = await Lead.countDocuments();

      // Next sequence
      const nextNumber = totalLeads + 1;

      // Final Lead ID
      const leadId = `${companyCode}${year}${String(nextNumber).padStart(3, "0")}`;
      ========================================================================
    */

    /*
      ========================================================================
      PREVIOUS INCREMENTER (WITHOUT PREFIX FILTER)
      (collapsed during prefix correction to
       avoid alphabetical sorting overlap with dummy prefixes starting with "L")
      ------------------------------------------------------------------------
      const lastLead = await Lead.findOne({}, { leadId: 1 }).sort({ leadId: -1 });
      let nextNumber = 1;
      if (lastLead && lastLead.leadId) {
        const suffix = lastLead.leadId.slice(-3);
        const lastNumber = parseInt(suffix, 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      const leadId = `${companyCode}${year}${String(nextNumber).padStart(3, "0")}`;
      ========================================================================
    */

    // REPLACED WITH ROBUST TAILING SEQUENTIAL INCREMENTER (WITH PREFIX FILTER):
    // Filters leadIds starting with "DTGNX" to avoid database sorting overlaps 
    // with alphabetically higher dummy keys (e.g. "LEAD-DUMMY-WON-X" starts with "L").
    const lastLead = await Lead.findOne({ leadId: /^DTGNX/ }, { leadId: 1 }).sort({ leadId: -1 });
    let nextNumber = 1;
    if (lastLead && lastLead.leadId) {
      const suffix = lastLead.leadId.slice(-3);
      const lastNumber = parseInt(suffix, 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const leadId = `${companyCode}${year}${String(nextNumber).padStart(3, "0")}`;

    const lead = await Lead.create({
      ...req.body,
      leadId,
    });

    // AI Integration: Predict Lead Temperature (Synchronously await so frontend gets it instantly!)
    try {
      const prediction = await aiService.predictLeadTemperature(req.body);
      if (prediction && prediction.success && prediction.prediction) {
        lead.ml_prediction = prediction.prediction;
        if (prediction.unique_id) lead.ai_unique_id = prediction.unique_id;
        
        // Sync priority field with AI's predicted temperature (CTO request: keep real-time parity in DB)
        if (prediction.prediction.predicted_temperature && prediction.prediction.predicted_temperature !== "Unknown") {
          lead.priority = prediction.prediction.predicted_temperature;
        }
        
        await lead.save();
      }
    } catch (err) {
      console.error("AI Prediction Error:", err);
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });

  } catch (error) {

    console.log(error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Lead already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create lead",
      error: error.message,
    });
  }
};
/* ================= GET ALL LEADS ================= */

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error("Get Leads Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

/* ================= GET SINGLE LEAD ================= */

exports.getSingleLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Get Single Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch lead",
      error: error.message,
    });
  }
};

/* ================= UPDATE LEAD ================= */

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // AI Integration: Re-evaluate Lead Temperature on Update
    aiService
      .predictLeadTemperature(lead.toObject())
      .then(async (prediction) => {
        if (prediction && prediction.success && prediction.prediction) {
          lead.ml_prediction = prediction.prediction;
          if (prediction.unique_id) lead.ai_unique_id = prediction.unique_id;
          
          // Sync priority field with AI's predicted temperature (CTO request: keep real-time parity in DB)
          if (prediction.prediction.predicted_temperature && prediction.prediction.predicted_temperature !== "Unknown") {
            lead.priority = prediction.prediction.predicted_temperature;
          }
          
          await lead.save();
        }
      })
      .catch((err) => console.error("AI Update Prediction Error:", err));

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

/* ================= DELETE LEAD ================= */

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete lead",
      error: error.message,
    });
  }
};

/* ================= GET LEAD INSIGHTS (AI) ================= */

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

/* ================= GENERATE LEAD EMAIL (AI) ================= */

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
