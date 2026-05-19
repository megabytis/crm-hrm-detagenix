const aiService = require("../../utils/aiService");

exports.screenCandidateResume = async (req, res) => {
  try {
    const { applicant_name, resume_text, job_description, requirements } = req.body;

    if (!resume_text || !job_description) {
      return res.status(400).json({
        success: false,
        message: "resume_text and job_description are required",
      });
    }

    const aiResponse = await aiService.screenResume({
      applicant_name,
      resume_text,
      job_description,
      requirements,
    });

    if (!aiResponse) {
      return res.status(503).json({
        success: false,
        message: "AI Service is unavailable or failed to screen the resume.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Resume screened successfully",
      data: aiResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.predictAttrition = async (req, res) => {
  try {
    const { employee_id, tenure_years, performance_score, job_satisfaction, salary_hike_percent } = req.body;

    if (!employee_id) {
      return res.status(400).json({
        success: false,
        message: "employee_id is required",
      });
    }

    const aiResponse = await aiService.predictEmployeeAttrition({
      employee_id,
      tenure_years,
      performance_score,
      job_satisfaction,
      salary_hike_percent,
    });

    if (!aiResponse) {
      return res.status(503).json({
        success: false,
        message: "AI Service is unavailable or failed to predict attrition.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attrition predicted successfully",
      data: aiResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
