const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({

employee: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},

basicSalary: Number,
hra: Number,
pf: Number,
bonus: Number,

totalSalary: Number

},
{ timestamps: true });

module.exports = mongoose.model("SalaryStructure", salarySchema);