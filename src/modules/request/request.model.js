const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ["Leave", "Payroll", "Document", "Other"],
    default: "Other"
  },
  status: {
    type: String,
    enum: ["Pending", "In Review", "Resolved"],
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);