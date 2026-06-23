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

// 2. AI Interview Assistant
// Expects:
// - audio_file: File upload (Optional - Audio/Video recording of the interview)
// - rough_notes: Text body (Optional - Pre-extracted transcripts or notes)
// Forwarded to FastAPI endpoint '/interview/evaluate' as multipart/form-data.
exports.evaluateInterview = async (req, res) => {
  let audioPath = null;
  try {
    const audioFile = req.files && req.files.audio_file ? req.files.audio_file[0] : null;
    const roughNotes = req.body.rough_notes;

    // Validate that either audio_file or rough_notes is provided
    if (!audioFile && !roughNotes) {
      return res.status(400).json({
        success: false,
        message: "You must provide either an audio_file or rough_notes."
      });
    }

    const formData = new FormData();

    if (audioFile) {
      audioPath = audioFile.path;
      const audioBuffer = fs.readFileSync(audioFile.path);
      const audioBlob = new File([audioBuffer], audioFile.originalname, { type: audioFile.mimetype });
      formData.append("audio_file", audioBlob);
    }

    if (roughNotes) {
      formData.append("rough_notes", roughNotes);
    }

    // Forward to the Python AI service
    const evaluationResult = await aiService.evaluateInterview(formData);

    if (!evaluationResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to evaluate interview. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: evaluationResult
    });

  } catch (error) {
    console.error("Express Interview Evaluation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during interview evaluation.",
      error: error.message
    });
  } finally {
    // Standard cleanup: delete uploaded files from disk to prevent storage leaks
    try {
      if (audioPath && fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    } catch (cleanupError) {
      console.warn("Failed to delete temp uploads:", cleanupError.message);
    }
  }
};

// 3. AI HR Chatbot
// Expects:
// - message: String (Required - User message input)
// - employee_id: String (Required - Scoped employee ID)
// - history: Array (Optional - Previous messages list)
// Forwarded to FastAPI endpoint '/hr-chatbot/chat' as JSON.
exports.chatWithHrBot = async (req, res) => {
  try {
    const { message, employee_id, history } = req.body;

    if (!message || !employee_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: message and employee_id are required."
      });
    }

    // Forward to the Python AI service
    const chatResult = await aiService.hrChatbotChat({
      message,
      employee_id,
      history
    });

    if (!chatResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to query HR Chatbot. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: chatResult
    });

  } catch (error) {
    console.error("Express HR Chatbot Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during HR Chatbot query.",
      error: error.message
    });
  }
};

// 4. Performance Prediction Model
// Expects:
// - attendance: Number (Required, 0-100)
// - task_completion_rate: Number (Required, 0-1)
// - peer_reviews: Number (Required, 1-5)
// - project_success_rate: Number (Required, 0-1)
// Forwarded to FastAPI endpoint '/performance/predict' as JSON.
exports.predictPerformance = async (req, res) => {
  try {
    const { attendance, task_completion_rate, peer_reviews, project_success_rate } = req.body;

    // Validation
    if (attendance === undefined || task_completion_rate === undefined || peer_reviews === undefined || project_success_rate === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: attendance, task_completion_rate, peer_reviews, and project_success_rate are required."
      });
    }

    const att = Number(attendance);
    const tcr = Number(task_completion_rate);
    const pr = Number(peer_reviews);
    const psr = Number(project_success_rate);

    if (isNaN(att) || att < 0 || att > 100) {
      return res.status(400).json({
        success: false,
        message: "attendance must be a number between 0 and 100."
      });
    }
    if (isNaN(tcr) || tcr < 0 || tcr > 1) {
      return res.status(400).json({
        success: false,
        message: "task_completion_rate must be a number between 0 and 1."
      });
    }
    if (isNaN(pr) || pr < 1 || pr > 5) {
      return res.status(400).json({
        success: false,
        message: "peer_reviews must be a number between 1 and 5."
      });
    }
    if (isNaN(psr) || psr < 0 || psr > 1) {
      return res.status(400).json({
        success: false,
        message: "project_success_rate must be a number between 0 and 1."
      });
    }

    // Forward to Python AI service
    const predictionResult = await aiService.predictPerformance({
      attendance: att,
      task_completion_rate: tcr,
      peer_reviews: pr,
      project_success_rate: psr
    });

    if (!predictionResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to execute performance prediction. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: predictionResult
    });

  } catch (error) {
    console.error("Express Performance Prediction Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during performance prediction.",
      error: error.message
    });
  }
};

// 5. Employee Attrition Model (Single)
// Expects: JSON payload representing categorical and numeric inputs for attrition prediction.
// Forwarded to FastAPI endpoint '/attrition/predict' as JSON.
exports.predictAttrition = async (req, res) => {
  try {
    const employeeData = req.body;

    // Validate that the request payload is an object and not empty
    if (!employeeData || typeof employeeData !== "object" || Object.keys(employeeData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing employee details payload for attrition prediction."
      });
    }

    // Forward to the Python AI service
    const predictionResult = await aiService.predictAttrition(employeeData);

    if (!predictionResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to predict attrition. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: predictionResult
    });

  } catch (error) {
    console.error("Express Attrition Prediction Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during attrition prediction.",
      error: error.message
    });
  }
};

// 6. Employee Attrition Model (Batch)
// Expects: JSON array representing list of employee details.
// Forwarded to FastAPI endpoint '/attrition/predict/batch' as JSON.
exports.predictAttritionBatch = async (req, res) => {
  try {
    const batchPayload = req.body;

    // Validate that the request payload is a non-empty array
    if (!Array.isArray(batchPayload) || batchPayload.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty JSON array of employee objects."
      });
    }

    // Forward to the Python AI service
    const predictionResult = await aiService.predictAttritionBatch(batchPayload);

    if (!predictionResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to execute batch attrition prediction. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: predictionResult
    });

  } catch (error) {
    console.error("Express Batch Attrition Prediction Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during batch attrition prediction.",
      error: error.message
    });
  }
};

// 7. Intelligent Team Formation
// Expects:
// - project_type: String (Required)
// - required_skills: Array of Strings (Required)
// - team_size: Number (Optional, default 3)
// - top_n_options: Number (Optional, default 3)
// Forwarded to FastAPI endpoint '/team/recommend' as JSON.
exports.recommendTeam = async (req, res) => {
  try {
    const { project_type, required_skills, team_size, top_n_options } = req.body;

    if (!project_type || !required_skills || !Array.isArray(required_skills) || required_skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: project_type and non-empty required_skills array are required."
      });
    }

    const teamPayload = {
      project_type,
      required_skills,
      team_size: team_size ? Number(team_size) : 3,
      top_n_options: top_n_options ? Number(top_n_options) : 3
    };

    const teamResult = await aiService.recommendTeam(teamPayload);

    if (!teamResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to fetch team recommendations. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: teamResult
    });

  } catch (error) {
    console.error("Express Team Recommendation Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during team recommendation request.",
      error: error.message
    });
  }
};

// 8. Workload Balancing Engine
// Triggers the ReAct workload analysis agent via FastAPI '/workload/balance' (JSON).
// Restricted to ADMIN and HR roles.
exports.balanceWorkload = async (req, res) => {
  try {
    const balanceResult = await aiService.balanceWorkload();

    if (!balanceResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to run workload balancing analysis. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: balanceResult
    });

  } catch (error) {
    console.error("Express Workload Balancing Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during workload balancing request.",
      error: error.message
    });
  }
};

// 9. Burnout & Engagement Detection
// Expects:
// - employee_id: String (Optional)
// - overtime_hours: Number (Optional override)
// - attendance_rate: Number (Optional override)
// - sentiment_score: Number (Optional override)
// - window_days: Number (Optional, default 30)
// Forwarded to FastAPI endpoint '/burnout/detect' as JSON.
exports.detectBurnout = async (req, res) => {
  try {
    const { employee_id, overtime_hours, attendance_rate, sentiment_score, window_days } = req.body;

    const burnoutPayload = {
      employee_id,
      overtime_hours: overtime_hours !== undefined ? Number(overtime_hours) : undefined,
      attendance_rate: attendance_rate !== undefined ? Number(attendance_rate) : undefined,
      sentiment_score: sentiment_score !== undefined ? Number(sentiment_score) : undefined,
      window_days: window_days !== undefined ? Number(window_days) : 30
    };

    const detectResult = await aiService.detectBurnout(burnoutPayload);

    if (!detectResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to evaluate burnout indicators. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: detectResult
    });

  } catch (error) {
    console.error("Express Burnout Detection Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during burnout detection request.",
      error: error.message
    });
  }
};

// 10. AI Salary Benchmarking
// Expects:
// - employee_id: String (Optional)
// - role: String (Optional override)
// - experience_years: Number (Optional override)
// - current_salary: Number (Optional override)
// - location: String (Optional, default 'India')
// Forwarded to FastAPI endpoint '/salary/benchmark' as JSON.
exports.benchmarkSalary = async (req, res) => {
  try {
    const { employee_id, role, experience_years, current_salary, location } = req.body;

    const salaryPayload = {
      employee_id,
      role,
      experience_years: experience_years !== undefined ? Number(experience_years) : undefined,
      current_salary: current_salary !== undefined ? Number(current_salary) : undefined,
      location: location || "India"
    };

    const benchmarkResult = await aiService.benchmarkSalary(salaryPayload);

    if (!benchmarkResult) {
      return res.status(503).json({
        success: false,
        message: "Failed to run salary benchmarking. AI service may be offline."
      });
    }

    res.status(200).json({
      success: true,
      data: benchmarkResult
    });

  } catch (error) {
    console.error("Express Salary Benchmarking Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during salary benchmarking request.",
      error: error.message
    });
  }
};


