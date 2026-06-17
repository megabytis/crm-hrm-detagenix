const fs = require("fs");
const aiService = require("../../utils/aiService");

// Controller for handling the HRMS AI modules integration route handlers.
// Each controller forwards standard payloads to the Python FastAPI microservice.

// 1. Smart Resume Screening
// Expects:
// - resume: File upload (Required - Candidate PDF resume)
// - jd_file: File upload (Optional - Job Description PDF)
// - jd_text: Text body (Optional - Raw Job Description text)
// Forwarded to FastAPI endpoint '/resume/screen' as multipart/form-data.
exports.screenResume = async (req, res) => {
  let resumePath = null;
  let jdFilePath = null;
  try {
    // Validate that the required resume file is present
    if (!req.files || !req.files.resume || !req.files.resume[0]) {
      return res.status(400).json({
        success: false,
        message: "Missing required resume file upload."
      });
    }

    const resumeFile = req.files.resume[0];
    resumePath = resumeFile.path;

    // Validate that either jd_text or a jd_file is provided
    const jdText = req.body.jd_text;
    const jdFile = req.files.jd_file ? req.files.jd_file[0] : null;
    
    if (!jdText && !jdFile) {
      return res.status(400).json({
        success: false,
        message: "You must provide either jd_text or a jd_file to match against."
      });
    }

    // Read files from disk (Multer uses diskStorage in config/multer.js)
    const resumeBuffer = fs.readFileSync(resumeFile.path);
    
    const formData = new FormData();
    const resumeBlob = new File([resumeBuffer], resumeFile.originalname, { type: resumeFile.mimetype });
    formData.append("resume", resumeBlob);

    if (jdFile) {
      jdFilePath = jdFile.path;
      const jdBuffer = fs.readFileSync(jdFile.path);
      const jdBlob = new File([jdBuffer], jdFile.originalname, { type: jdFile.mimetype });
      formData.append("jd_file", jdBlob);
    }

    if (jdText) {
      formData.append("jd_text", jdText);
    }

    // Forward to the Python AI service
    const matchResult = await aiService.screenResume(formData);

    if (!matchResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to parse resume or job description. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: matchResult
    });

  } catch (error) {
    console.error("Express Resume Screening Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during resume screening.",
      error: error.message
    });
  } finally {
    // Standard cleanup: delete uploaded files from disk to prevent storage leaks
    try {
      if (resumePath && fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
      if (jdFilePath && fs.existsSync(jdFilePath)) {
        fs.unlinkSync(jdFilePath);
      }
    } catch (cleanupError) {
      console.warn("Failed to delete temp uploads:", cleanupError.message);
    }
  }
};
