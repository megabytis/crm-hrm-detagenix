const User = require("../users/user.model");
const bcrypt = require("bcryptjs");
const Attendance = require("../attendance/attendance.model");
const Leave = require("../leave/leave.model");
const Payroll = require("../payroll/payroll.model");

// Get Employee Profile
const getEmployeeProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const presentDays = await Attendance.countDocuments({
      employee: userId,
      checkOut: { $ne: null }
    });

    const leaveCount = await Leave.countDocuments({
      employee: userId,
      status: "Approved"
    });

    const payroll = await Payroll.findOne({ employee: userId });

    res.json({
      success: true,
      profile: {
        basicInfo: user,
        attendanceSummary: {
          presentDays,
          leavesTaken: leaveCount
        },
        payrollInfo: payroll
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update Employee Profile
const updateEmployeeProfile = async (req, res) => {
  try {

    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// ✅ Reset Password
// const resetPassword = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     const newPassword = "123456"; // basic version

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     await User.findByIdAndUpdate(userId, {
//       password: hashedPassword,
//     });

//     res.json({
//       success: true,
//       message: "Password reset successfully",
//       newPassword, // testing ke liye
//     });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
const resetPassword = async (req, res) => {
  try {
    const userId = req.params.id;
        console.log("RESET USER ID:", userId);
    const { newPassword } = req.body;

    // ❗ IMPORTANT VALIDATION
    if (!newPassword) {
      return res.json({
        success: false,
        message: "New password is required",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("RESET ERROR:", error); // 👈 ye add karo
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getEmployeeProfile,
  updateEmployeeProfile,
  resetPassword
};