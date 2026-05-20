const aiService = require("../../utils/aiService");

exports.trainConversionModel = async (req, res) => {
  try {
    const { limit, minRows } = req.body;
    
    const aiResponse = await aiService.trainConversionModel(limit, minRows);
    
    if (!aiResponse) {
      return res.status(503).json({
        success: false,
        message: "AI Service is unavailable or training failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Model training triggered successfully",
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

exports.runBatchPrediction = async (req, res) => {
  try {
    const { limit } = req.body;
    
    const aiResponse = await aiService.runBatchPrediction(limit);
    
    if (!aiResponse) {
      return res.status(503).json({
        success: false,
        message: "AI Service is unavailable or batch prediction failed.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch prediction started successfully",
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
