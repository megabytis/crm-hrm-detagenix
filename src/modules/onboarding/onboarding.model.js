const mongoose = require("mongoose");

const onboardingSchema = new mongoose.Schema(
{
employee: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},

documentsUploaded: {
type: Boolean,
default: false
},

trainingCompleted: {
type: Boolean,
default: false
},

welcomeEmailSent: {
type: Boolean,
default: false
},

status: {
type: String,
enum: ["Pending", "In Progress", "Completed"],
default: "Pending"
}

},
{ timestamps: true }
);

module.exports = mongoose.model("Onboarding", onboardingSchema);