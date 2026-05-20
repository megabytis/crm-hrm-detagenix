const mongoose = require("mongoose");

// Added tenantId field to activity schema
// to enforce multi-tenancy — each tenant can only access their own data.

const activitySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Call", "Meeting", "Email", "Follow-up"],
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Activity", activitySchema);
