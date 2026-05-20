const Deal = require("../models/Deal");

// Added tenantId filtering across all queries
// to enforce multi-tenancy — each tenant can only access their own data.

exports.createDeal = async (req, res) => {
  const deal = await Deal.create({
    ...req.body,
    tenantId: req.user.tenantId,
  });
  res.status(201).json({ success: true, data: deal });
};

exports.getDeals = async (req, res) => {
  const deals = await Deal.find({ tenantId: req.user.tenantId });
  res.json({ success: true, data: deals });
};

exports.deleteDeal = async (req, res) => {
  const deal = await Deal.findOneAndDelete({
    _id: req.params.id,
    tenantId: req.user.tenantId,
  });
  if (!deal)
    return res.status(404).json({ success: false, message: "Deal not found" });
  res.json({ success: true, message: "Deal deleted successfully" });
};

exports.updateStage = async (req, res) => {
  const deal = await Deal.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    { stage: req.body.stage },
    { new: true },
  );
  if (!deal)
    return res.status(404).json({ success: false, message: "Deal not found" });
  res.json({ success: true, data: deal });
};
