const Payroll = require("./payroll.model");
const PDFDocument = require("pdfkit");

// Run Payroll
exports.runPayroll = async (req, res) => {
  try {
    const { employeeId, baseSalary, deductions, month } = req.body;

    const netSalary = baseSalary - deductions;

    const payroll = await Payroll.create({
      employee: employeeId,
      baseSalary,
      deductions,
      netSalary,
      month
    });

    res.status(201).json({
      success: true,
      data: payroll
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Mark Salary Paid
exports.markPaid = async (req, res) => {
  try {

    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found"
      });
    }

    payroll.status = "Paid";
    payroll.paidDate = new Date();

    await payroll.save();

    res.json({
      success: true,
      data: payroll
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get All Payroll
exports.getAllPayroll = async (req, res) => {
  try {

    const payrolls = await Payroll.find()
      .populate("employee", "name email role");

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ✅ Download Payslip
exports.downloadPayslip = async (req, res) => {
  try {

    const payroll = await Payroll.findById(req.params.id)
      .populate("employee", "name email designation");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll not found"
      });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payslip-${payroll.month}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Employee Payslip", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Employee: ${payroll.employee.name}`);
    doc.text(`Email: ${payroll.employee.email}`);
    doc.text(`Month: ${payroll.month}`);
    doc.text(`Base Salary: ₹${payroll.baseSalary}`);
    doc.text(`Deductions: ₹${payroll.deductions}`);
    doc.text(`Net Salary: ₹${payroll.netSalary}`);
    doc.text(`Status: ${payroll.status}`);

    if (payroll.paidDate) {
      doc.text(`Paid Date: ${payroll.paidDate}`);
    }

    doc.moveDown();
    doc.text("This is system generated payslip.");

    doc.end();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};