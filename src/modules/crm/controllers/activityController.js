const Activity = require("../models/activity");

// Added tenantId filtering across all queries
// to enforce multi-tenancy — each tenant can only access their own data.

/**
 * Create Activity
 */
exports.createActivity = async (req, res) => {
  try {
    const { type, description, date } = req.body;

    const activity = await Activity.create({
      tenantId: req.user.tenantId,
      user: req.user.id,
      type,
      description,
      date,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Activities
 */
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ tenantId: req.user.tenantId })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get My Activities
 */
exports.getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      user: req.user.id,
      tenantId: req.user.tenantId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Activity
 */
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Check if user owns the activity or is admin
    if (activity.user.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this activity",
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
