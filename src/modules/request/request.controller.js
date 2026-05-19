const Request = require("./request.model");

// Raise Request
exports.raiseRequest = async (req, res) => {
  try {

    const { title, description, type } = req.body;

    const request = await Request.create({
      employee: req.user.id,
      title,
      description,
      type
    });

    res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      data: request
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get All Requests (HR/Admin)
exports.getAllRequests = async (req, res) => {
  try {

    const requests = await Request.find()
      .populate("employee", "name email role");

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};