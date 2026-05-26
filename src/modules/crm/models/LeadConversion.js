const mongoose = require("mongoose");

const leadConversionSchema = new mongoose.Schema(
  {
    industry: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    responseSpeed: {
      type: Number,
      required: true,
    },

    meetingCount: {
      type: Number,
      required: true,
    },

    emailOpenRate: {
      type: Number,
      required: true,
    },

    websiteVisits: {
      type: Number,
      required: true,
    },

    document: {
      type: String,
      default: null,
    },

    probability: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Converted", "Pending"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LeadConversion",
  leadConversionSchema
);