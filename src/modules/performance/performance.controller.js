const Review = require("./performance.model");

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { employeeId, score, nextReviewDate } = req.body;

    let rating = "Average";

    if (score >= 90) rating = "Excellent";
    else if (score >= 75) rating = "Good";
    else if (score < 50) rating = "Below Average";

    const review = await Review.create({
      employee: employeeId,
      score,
      rating,
      nextReviewDate,
      status: "Completed"
    });

    res.status(201).json({
      success: true,
      data: review
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ✅ Get All Reviews
exports.getAllReviews = async (req, res) => {
  try {

    const reviews = await Review.find()
      .populate("employee", "name email role");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};