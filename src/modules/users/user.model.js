const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: function () {
        return this.role !== "ADMIN";
      }
    },

    name: { type: String, required: true },

    email: { type: String, unique: true, required: true },

    password: { type: String, required: true },

    // ✅ NEW FIELD
    phone: {
      type: String
    },

    // Personal Details Fields
dateOfBirth: {
  type: Date,
},

gender: {
  type: String,
  enum: ["male", "female", "other"],
},

maritalStatus: {
  type: String,
  enum: ["single", "married", "divorced"],
},

bloodGroup: {
  type: String,
},

currentAddress: {
  type: String,
},

permanentAddress: {
  type: String,
},

emergencyContact: {
  type: String,
},
 // ---------------- BANK + PF DETAILS ----------------
    universalAccountNumber: {
      type: String
    },

    pfMemberId: {
      type: String
    },

    panNumber: {
      type: String
    },

    aadharNumber: {
      type: String
    },

    esicNumber: {
      type: String
    },

    accountHolderName: {
      type: String
    },

    accountNumber: {
      type: String
    },

    ifscCode: {
      type: String
    },

    bankName: {
      type: String
    },

    branchName: {
      type: String
    },
    documents: [
  {
    documentType: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }
],
  

    // ✅ NEW FIELD
    department: {
      type: String,
      enum: ["IT", "HR", "Sales", "Marketing", "Finance"]
    },

    role: {
      type: String,
      enum: ["ADMIN", "HR", "MANAGER", "EMPLOYEE", "BDE"],
      required: true
    },

    designation: {
      type: String,
      enum: [
        "Project Manager",
        "Sales Manager",
        "Client Relationship Manager",
        "Developer",
        "Intern"
      ]
    },

    techStack: {
      type: String,
      enum: ["MERN", "Full Stack", "AIML", "Frontend", "Backend"]
    },

    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    permissions: { type: Object, default: {} },

    createdByRole: String,

    isActive: { type: Boolean, default: true },
    totalLeaves: {
  type: Number,
  default: 4
},

usedLeaves: {
  type: Number,
  default: 0
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);