const Leave = require("./leave.model");
const User = require("../users/user.model");

// Apply Leave
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;

    const leave = await Leave.create({
       employee: req.user._id,
      leaveType,
      fromDate,
      toDate,
      reason
    });

    res.status(201).json({ success: true, leave });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get My Leaves
// exports.getMyLeaves = async (req, res) => {
//   const leaves = await Leave.find({ employee: req.user._id });
//   res.json(leaves);
// };
exports.getMyLeaves = async (req, res) => {
  try {
    console.log("Logged in user:", req.user._id);

    const leaves = await Leave.find({
      employee: req.user._id
    }).populate("employee", "name email");

    console.log("My Leaves:", leaves);

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get All Leaves (Admin/HR)
// exports.getAllLeaves = async (req, res) => {
//   const leaves = await Leave.find().populate("employee", "name email");
//   res.json(leaves);
// };
exports.getAllLeaves = async (req, res) => {
  try {
    const role = req.user.role;

    
    if (role === "EMPLOYEE") {
      return res.status(403).json({
        message: "Access denied"
      });
    }

   
    const leaves = await Leave.find()
      .populate("employee", "name email");

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Approve / Reject Leave
// exports.updateLeaveStatus = async (req, res) => {
//   const leave = await Leave.findById(req.params.id);

//   if (!leave) {
//     return res.status(404).json({ message: "Leave not found" });
//   }

//   leave.status = req.body.status;
//   await leave.save();

//   res.json({ success: true, leave });
// };
exports.updateLeaveStatus = async (req, res) => {
  try {
    const role = req.user.role;

    // ❌ Employee block
    if (!["ADMIN", "HR", "MANAGER"].includes(role)) {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = req.body.status;
    await leave.save();

    res.json({ success: true, leave });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get Leave Stats
exports.getLeaveStats = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Approved leaves only
    const approvedLeaves = await Leave.find({
      employee: employeeId,
      status: "Approved"
    });

    // Count total leave days
    let usedLeaves = 0;

    approvedLeaves.forEach((leave) => {
      const from = new Date(leave.fromDate);
      const to = new Date(leave.toDate);

      const days =
        Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

      usedLeaves += days;
    });

    // Fixed total leaves
    const totalLeaves = 4;

    // Remaining leaves
    const remainingLeaves = totalLeaves - usedLeaves;

    res.status(200).json({
      totalLeaves,
      usedLeaves,
      remainingLeaves,
      approvedLeaves: approvedLeaves.length
    });

  } catch (error) {
    console.error("Leave Stats Error:", error);

    res.status(500).json({
      message: "Failed to fetch leave stats"
    });
  }
};