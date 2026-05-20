const mongoose = require("mongoose");

// Added tenantId field to Lead schema
// to enforce multi-tenancy — each tenant can only access their own data.

const leadSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    name: { type: String, required: true },
    email: String,
    phone: String,
    source: String,
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Lost"],
      default: "New",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lead", leadSchema);
