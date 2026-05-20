const Lead = require("../models/Lead");
const Deal = require("../models/Deal");

// Added tenantId filtering across all queries
// to enforce multi-tenancy — each tenant can only access their own data.

exports.dashboardStats = async (req, res) => {
  const totalLeads = await Lead.countDocuments({ tenantId: req.user.tenantId });
  const wonDeals = await Deal.countDocuments({
    tenantId: req.user.tenantId,
    stage: "Closed Won",
  });

  const revenue = await Deal.aggregate([
    {
      $match: {
        tenantId: req.user.tenantId,
        stage: "Closed Won",
      },
    },
    { $group: { _id: null, total: { $sum: "$value" } } },
  ]);

  res.json({
    success: true,
    data: {
      totalLeads,
      wonDeals,
      revenue: revenue[0]?.total || 0,
    },
  });
};
