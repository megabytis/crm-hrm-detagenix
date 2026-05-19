const Attendance = require("./attendance.model");
const User = require("../users/user.model");


// ==========================
// ✅ 
// ==========================
// exports.punchIn = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Check if already punched in today
//     const existing = await Attendance.findOne({
//       employee: req.user.id,
//       date: { $gte: today },
//     });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Already punched in today",
//       });
//     }

//     const attendance = await Attendance.create({
//       employee: req.user.id,
//       checkIn: new Date(),
//     });

//     res.status(201).json({
//       success: true,
//       message: "Punch in successful",
//       data: attendance,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
exports.punchIn = async (req, res) => {
  try {
    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      employee: req.user.id,
      date: { $gte: today },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already punched in today",
      });
    }

    // 🧠 Office time logic
    const officeTime = new Date();
    officeTime.setHours(9, 30, 0, 0); // 9:30 AM

    let status = "Present";

    if (now > officeTime && now.getHours() < 10) {
  status = "Late";
} else if (now.getHours() >= 10 && now.getHours() < 13) {
  status = "Half Day";
} else if (now.getHours() >= 13) {
  status = "Absent";
}

    const attendance = await Attendance.create({
      employee: req.user.id,
      checkIn: now,
      date: now,
      status, // 👈 IMPORTANT
    });

    res.status(201).json({
      success: true,
      message: "Punch in successful",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================
// ✅ Punch Out
// ==========================
exports.punchOut = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      employee: req.user.id,
      checkOut: null,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: "No active punch-in found",
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Punch out successful",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================
// ✅ Employee - Get My Attendance
// ==========================
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({
      employee: req.user.id,
    })
    .populate("employee", "name email") 
    .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==========================
// ✅ HR - Get All Employees Attendance
// ==========================
// exports.getAllAttendance = async (req, res) => {
//   try {
//     const records = await Attendance.find()
//       .populate("employee", "name email role")
//       .sort({ date: -1 });

//     res.status(200).json({
//       success: true,
//       count: records.length,
//       data: records,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("employee", "name email role")
      .sort({ date: -1 });

    const updatedRecords = records.map((record) => {
      let remark = "-";

      if (record.checkIn) {
        const checkIn = new Date(record.checkIn);
        const officeTime = new Date(checkIn);
        officeTime.setHours(9, 30, 0, 0);

        if (checkIn > officeTime) {
          remark = "Late Check-in";
        }
      }

      return {
        ...record.toObject(),
        remark, // 👈 frontend ko bhej rahe
      };
    });

    res.status(200).json({
      success: true,
      data: updatedRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getTodayAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    const uniqueEmployees = new Set(
      attendance.map(a => a.employee.toString())
    );

    const present = uniqueEmployees.size;

    const totalEmployees = await User.countDocuments({
      role: "EMPLOYEE",
      designation: "Developer"
    });

    const absent = totalEmployees - present;

    res.json({
      present,
      absent,
      totalEmployees
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getEmployeeOverview = async (req, res) => {
  try {
    // 👉 sirf developers
    const developers = await User.find({
      role: "EMPLOYEE",
      designation: "Developer" // check karo DB me same field ho
    });

    const totalEmployees = developers.length;

    // 👉 active = jinke paas project assign hai
    const activeEmployees = developers.filter(emp => emp.project);

    // 👉 bench = jinke paas project nahi
    const benchEmployees = developers.filter(emp => !emp.project);

    res.json({
      totalEmployees,
      activeEmployees: activeEmployees.length,
      onBench: benchEmployees.length
    });

  } catch (error) {
    console.error("EMPLOYEE OVERVIEW ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};