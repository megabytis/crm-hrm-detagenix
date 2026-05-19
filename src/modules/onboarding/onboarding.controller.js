const Onboarding = require("./onboarding.model");

exports.startOnboarding = async (req, res) => {
try {

const { employeeId } = req.body;

const onboarding = await Onboarding.create({
employee: employeeId,
status: "In Progress"
});

res.status(201).json({
success: true,
message: "Onboarding started",
data: onboarding
});

} catch (error) {
res.status(500).json({ message: error.message });
}
};


exports.getOnboarding = async (req, res) => {
try {

const data = await Onboarding.find()
.populate("employee", "name email department");

res.json({
success: true,
count: data.length,
data
});

} catch (error) {
res.status(500).json({ message: error.message });
}
};