const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_ENABLED = process.env.AI_SERVICE_ENABLED === "true";

class AiService {
  constructor() {
    this.client = axios.create({
      baseURL: AI_SERVICE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async checkHealth() {
    if (!AI_SERVICE_ENABLED) return { status: "disabled" };
    try {
      const response = await this.client.get("/");
      return response.data;
    } catch (error) {
      console.error("AI Service Health Check Failed:", error.message);
      return { status: "down", error: error.message };
    }
  }

  async predictLeadTemperature(leadData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post("/predict", leadData);
      return response.data;
    } catch (error) {
      console.error("AI Lead Prediction Failed:", error.message);
      return null;
    }
  }

  async predictConversionProbability(scoringData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/lead-scoring/conversion/predict",
        scoringData,
      );
      return response.data;
    } catch (error) {
      console.error("AI Conversion Prediction Failed:", error.message);
      return null;
    }
  }

  async generateInsights(recordId, context = {}) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post("/ai-insights/generate", {
        record_id: recordId,
        ...context,
      });
      return response.data;
    } catch (error) {
      console.error("AI Insights Generation Failed:", error.message);
      return null;
    }
  }

  async generateEmail(emailContext) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/email/generate-followup",
        emailContext,
      );
      return response.data;
    } catch (error) {
      console.error("AI Email Generation Failed:", error.message);
      return null;
    }
  }

  async chatbotChat(chatContext) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post("/chatbot/chat", chatContext);
      return response.data;
    } catch (error) {
      console.error("AI Chatbot Chat Failed:", error.message);
      return null;
    }
  }

  async getSalesForecast(months = 3) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.get("/sales-forecast", {
        params: { months },
      });
      return response.data;
    } catch (error) {
      console.error("AI Sales Forecast Failed:", error.message);
      return null;
    }
  }

  async generateLeadsFromQuery(queryData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/lead-generation/search-query",
        queryData,
      );
      return response.data;
    } catch (error) {
      console.error("AI Lead Gen Search Failed:", error.message);
      return null;
    }
  }

  async qualifySearchResults(qualifyData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/lead-generation/qualify-search-results",
        qualifyData,
      );
      return response.data;
    } catch (error) {
      console.error("AI Lead Gen Qualify Failed:", error.message);
      return null;
    }
  }

  async getLeadGenerationDashboard(params) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.get("/lead-generation/dashboard", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("AI Lead Gen Dashboard Failed:", error.message);
      return null;
    }
  }
  async predictClv(clvData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post("/clv/predict", clvData);
      return response.data;
    } catch (error) {
      console.error("AI CLV Prediction Failed:", error.message);
      return null;
    }
  }

  async optimizeFollowup(followupData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/followup/optimize",
        followupData,
      );
      return response.data;
    } catch (error) {
      console.error("AI Followup Optimization Failed:", error.message);
      return null;
    }
  }
  async analyzeConversation(conversationData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/conversation-intelligence/analyze",
        conversationData,
      );
      return response.data;
    } catch (error) {
      console.error("AI Conversation Analysis Failed:", error.message);
      return null;
    }
  }

  async getLeadConversationIntelligence(leadId) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.get(
        `/conversation-intelligence/lead/${leadId}`,
      );
      return response.data;
    } catch (error) {
      console.error("AI Fetch Lead Intelligence Failed:", error.message);
      return null;
    }
  }

  async getConversationIntelligenceOverview(limit = 200) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.get(
        "/conversation-intelligence/overview",
        {
          params: { limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("AI Fetch Intelligence Overview Failed:", error.message);
      return null;
    }
  }
  async screenResume(resumeData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/resume-screening/screen",
        resumeData,
      );
      return response.data;
    } catch (error) {
      console.error("AI Resume Screening Failed:", error.message);
      return null;
    }
  }

  async predictEmployeeAttrition(employeeData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post(
        "/employee-attrition/predict",
        employeeData,
      );
      return response.data;
    } catch (error) {
      console.error("AI Employee Attrition Prediction Failed:", error.message);
      return null;
    }
  }
}

module.exports = new AiService();
