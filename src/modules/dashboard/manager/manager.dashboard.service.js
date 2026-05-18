const { getDateRange } = require("../../../utils/dateRange");
const { calculateProductivityScore } = require("./manager.productivity.service");
const { detectRisk } = require("./manager.risk.service");

const User = require("../../users/user.model");
const Attendance = require("../../attendance/attendance.model");
const Task = require("../../tasks/task.model");
const Leave = require("../../leave/leave.model");
const Lead = require("../../crm/models/Lead");

const getManagerDashboard = async (managerId, companyId, query) => {
  try {

    const { start, end } = getDateRange(query);

    // =========================
    // TEAM
    // =========================
    const team = await User.find({
      reportingTo: managerId,
      tenantId: companyId,
      isActive: true
    }).select("_id");

    const teamIds = team.map(u => u._id);

    if (teamIds.length === 0) {
      return {
        teamSummary: { totalMembers: 0, present: 0, absent: 0, leave: 0 },
        taskSummary: { completed: 0, pending: 0, inProgress: 0, overdueTasks: 0 },
        crmSummary: { totalLeads: 0, convertedLeads: 0 },
        pendingApprovals: 0,
        productivity: { score: 0, level: "Low" },
        riskLevel: "Low Risk"
      };
    }

    // =========================
    // PARALLEL QUERIES
    // =========================
    const [
      attendanceStats,
      taskStats,
      overdueTasks,
      convertedLeads,
      totalLeads,
      pendingApprovals
    ] = await Promise.all([

      Attendance.aggregate([
        {
          $match: {
            user: { $in: teamIds },
            date: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),

      Task.aggregate([
        { $match: { assignedTo: { $in: teamIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      Task.countDocuments({
        assignedTo: { $in: teamIds },
        dueDate: { $lt: new Date() },
        status: { $ne: "completed" }
      }),

      Lead.countDocuments({
        assignedTo: { $in: teamIds },
        status: "converted"
      }),

      Lead.countDocuments({
        assignedTo: { $in: teamIds }
      }),

      Leave.countDocuments({
        employee: { $in: teamIds },
        status: "Pending"
      })

    ]);

    // =========================
    // PROCESS RESULTS
    // =========================
    let present = 0, absent = 0, leaveCount = 0;
    attendanceStats.forEach(a => {
      if (a._id === "present") present = a.count;
      if (a._id === "absent") absent = a.count;
      if (a._id === "leave") leaveCount = a.count;
    });

    let completed = 0, pending = 0, inProgress = 0;
    taskStats.forEach(t => {
      if (t._id === "completed") completed = t.count;
      if (t._id === "pending") pending = t.count;
      if (t._id === "in-progress") inProgress = t.count;
    });

    // =========================
    // AI LOGIC
    // =========================
    const productivity = calculateProductivityScore(
      completed,
      convertedLeads,
      overdueTasks
    );

    const riskLevel = detectRisk(absent, overdueTasks);

    return {
      teamSummary: {
        totalMembers: team.length,
        present,
        absent,
        leave: leaveCount
      },
      taskSummary: {
        completed,
        pending,
        inProgress,
        overdueTasks
      },
      crmSummary: {
        totalLeads,
        convertedLeads
      },
      pendingApprovals,
      productivity,
      riskLevel
    };

  } catch (error) {
    console.error("Manager Dashboard Error:", error);
    throw error;
  }
};

module.exports = {
  getManagerDashboard
};
