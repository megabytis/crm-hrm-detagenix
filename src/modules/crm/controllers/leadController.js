const Lead = require("../models/Lead");

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

    console.log("BODY DATA:", req.body);

    const companyCode = "DTGNX";
    const year = new Date().getFullYear();

    // Total leads count
    const totalLeads = await Lead.countDocuments();

    // Next sequence
    const nextNumber = totalLeads + 1;

    // Final Lead ID
    const leadId = `${companyCode}${year}${String(nextNumber).padStart(3, "0")}`;

    const lead = await Lead.create({
      ...req.body,
      leadId,
    });

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