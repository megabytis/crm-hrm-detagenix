const managerService = require("./manager.dashboard.service");
const graphService = require("./manager.graph.service");
const productivityService = require("./manager.productivity.service");
const riskService = require("./manager.risk.service");

// Dashboard Summary
exports.getManagerDashboard = async (req, res) => {
  try {
    const data = await managerService.getManagerDashboard(
      req.user.id,
      req.user.tenantId,
      req.query
    );

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Attendance Graph
exports.getManagerGraph = async (req, res) => {
  try {
    const data = await graphService.getGraphData(req.user, req.query);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Productivity Score
exports.getProductivityScore = async (req, res) => {
  try {
    const data = await productivityService.calculateScore(req.user);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Risk Analysis
exports.getRiskAnalysis = async (req, res) => {
  try {
    const data = await riskService.getRiskData(req.user);

    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
