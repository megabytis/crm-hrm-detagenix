const aiService = require("../../../utils/aiService");

exports.analyze = async (req, res) => {
  try {
    const { source_type, conversation_text, messages } = req.body;

    if (!conversation_text && (!messages || !Array.isArray(messages))) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid 'conversation_text' or 'messages' array in request body.",
      });
    }

    const analysis = await aiService.analyzeConversation(req.body);

    if (!analysis) {
      return res.status(500).json({
        success: false,
        message: "Failed to analyze conversation. AI service may be unavailable.",
      });
    }

    res.status(200).json(analysis);
  } catch (error) {
    console.error("Conversation Intelligence Analyze Error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during conversation analysis.",
      error: error.message,
    });
  }
};

exports.getLeadIntelligence = async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required.",
      });
    }

    const intelligence = await aiService.getLeadConversationIntelligence(leadId);

    if (!intelligence) {
      return res.status(404).json({
        success: false,
        message: "Conversation intelligence not found for this lead or AI service is down.",
      });
    }

    res.status(200).json(intelligence);
  } catch (error) {
    console.error("Fetch Lead Intelligence Error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching lead intelligence.",
      error: error.message,
    });
  }
};

exports.getOverview = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 200;

    const overview = await aiService.getConversationIntelligenceOverview(limit);

    if (!overview) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch conversation intelligence overview. AI service may be unavailable.",
      });
    }

    res.status(200).json(overview);
  } catch (error) {
    console.error("Fetch Intelligence Overview Error:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching intelligence overview.",
      error: error.message,
    });
  }
};
