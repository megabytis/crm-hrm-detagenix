const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    linkedinProfile: {
      type: String,
      trim: true,
    },

    // Company Info
    companyName: {
      type: String,
      trim: true,
    },

    companyWebsite: {
      type: String,
      trim: true,
    },

    companyEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Lead Details
    role: {
      type: String,
      trim: true,
    },

    leadId: {
      type: String,
      unique: true,
      trim: true,
    },

    source: {
      type: String,
      enum: [
        "LinkedIn",
        "Website",
        "Referral",
        "Instagram",
        "Walk-in",
        "Cold Call",
        "Other",
      ],
      default: "Other",
    },

    requirementDetails: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Proposal Sent",
        "Won",
        "Lost",
      ],
      default: "New",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);