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
      required: true,
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
        "AI"

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
      default: "Warm",
    },

    // Professional details for AI Prediction
    role_position: { type: String, default: "Not Specified" },

    // Link to AI service's unique ID
    ai_unique_id: String,

    // AI ML Prediction Results
    ml_prediction: {
      predicted_temperature: { type: String, enum: ["Hot", "Warm", "Cold", "Unknown"], default: "Unknown" },
      confidence: Number,
      probabilities: Object,
      model_version: String,
      prediction_timestamp: Date
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);
