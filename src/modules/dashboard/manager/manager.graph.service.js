const Attendance = require("../../attendance/attendance.model");
const User = require("../../users/user.model");
const mongoose = require("mongoose");

const getGraphData = async (user, query) => {
  const { startDate, endDate } = query;

  const start = startDate
    ? new Date(startDate)
    : new Date(new Date().setDate(1));

  const end = endDate
    ? new Date(endDate)
    : new Date();

  const teamMembers = await User.find({
    reportingTo: user.id,
    tenantId: user.tenantId
  }).select("_id");

  const teamIds = teamMembers.map(member => member._id);

  if (!teamIds.length) return [];

  const data = await Attendance.aggregate([
    {
      $match: {
        user: { $in: teamIds },
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: {
          date: "$date",
          status: "$status"
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.date": 1 }
    }
  ]);

  return data;
};

module.exports = {
  getGraphData
};
