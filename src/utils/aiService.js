const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_ENABLED = process.env.AI_SERVICE_ENABLED === "true";

class AiService {
  constructor() {
    this.client = axios.create({
      baseURL: AI_SERVICE_URL,
      timeout: 30000,
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
      // Map frontend/mongoose fields to the exact snake_case expected by Python's LeadInput
      const payload = {
        name: leadData.name || "N/A",
        email: leadData.email || "unknown@example.com",
        phone: leadData.phone || "N/A",
        location: leadData.location || "N/A",
        linkedin_profile: leadData.linkedinProfile || leadData.linkedin_profile || "N/A",
        company_name: leadData.companyName || leadData.company_name || "N/A",
        company_website: leadData.companyWebsite || leadData.company_website || "N/A",
        company_email: leadData.companyEmail || leadData.company_email || "N/A",
        
        // Match required field
        role_position: leadData.role_position || leadData.role || "Not Specified",
        
        // Optional numerical/categorical fields
        willing_to_relocate: leadData.willing_to_relocate || "No",
        
        // WIRED BY PAIRING AI: We pass the lead priority as a calibration signal so the ML 
        // prediction engine can align the predicted temperature with the actual business signal.
        priority: leadData.priority || "Warm",
        
        // Legacy
        availability: leadData.availability || "Immediately",
        interview_status: leadData.interview_status || "New"
      };

      const response = await this.client.post("/predict", payload);
      return response.data;
    } catch (error) {
      console.error("AI Lead Prediction Failed:", error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Predicts lead conversion probability by calling the FastAPI calibrated Random Forest classifier.
   *
   * @param {Object} scoringData - The scoring features.
   * @param {string} scoringData.industry - Target industry (e.g. "SaaS", "Finance").
   * @param {number} scoringData.budget - Lead financial budget.
   * @param {number} scoringData.response_speed - Rep reply delay in days.
   * @param {number} scoringData.meeting_count - Amount of calls/meetings held.
   * @param {number} scoringData.email_open_rate - Ratio of emails read by prospect.
   * @param {number} scoringData.website_visits - Number of website touches.
   * @returns {Promise<Object|null>} FastAPI response containing probability metrics or null if failed.
   */
  // ==============================================================================
  // LEGACY JSON-BASED PREDICT METHOD
  // Kept for reference. Do not delete.
  // ------------------------------------------------------------------------------
  // async predictConversionProbability(scoringData) {
  //   if (!AI_SERVICE_ENABLED) return null;
  //   try {
  //     const response = await this.client.post(
  //       "/lead-scoring/conversion/predict",
  //       scoringData,
  //     );
  //     return response.data;
  //   } catch (error) {
  //     // Log both Axios error messages and detailed Pydantic schema validation objects from FastAPI
  //     console.error("AI Conversion Prediction Failed:", error.message, error.response?.data);
  //     return null;
  //   }
  // }
  // ==============================================================================

  // UPDATED MULTIPART FORM-DATA / DYNAMIC PREDICT METHOD (CTO SPEC)
  async predictConversionProbability(scoringData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      // NOTE: We use Node's native `fetch()` instead of Axios. Axios has known serialization
      // issues with standard Node.js global `File` and `Blob` objects inside `FormData`,
      // often stringifying them to "[object File]" or "[object Blob]" (exactly 13 bytes),
      // which corrupts the uploaded document. Native `fetch` handles them flawlessly.
      const response = await fetch(`${AI_SERVICE_URL}/lead-scoring/conversion/predict`, {
        method: "POST",
        body: scoringData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Conversion Prediction HTTP Error:", response.status, errorText);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error("AI Conversion Prediction Failed:", error.message);
      return null;
    }
  }


  // Exposes the Resume Screening & Smart Hiring API connection.
  // Accepts a global FormData payload containing:
  // - resume: File object of candidate PDF resume (Required)
  // - jd_text: String representing Job Description text (Optional)
  // - jd_file: File object of Job Description PDF (Optional)
  // Utilizes native fetch to bypass Axios File serialization limits.
  async screenResume(formData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await fetch(`${AI_SERVICE_URL}/resume/screen`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Resume Screening HTTP Error:", response.status, errorText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("AI Resume Screening Failed:", error.message);
      return null;
    }
  }

  // Exposes the AI Interview Assistant API connection.
  // Accepts a global FormData payload containing:
  // - audio_file: File object of audio/video recording (Optional)
  // - rough_notes: String representing text transcript or notes (Optional)
  // Utilizes native fetch to bypass Axios File serialization limits.
  async evaluateInterview(formData) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await fetch(`${AI_SERVICE_URL}/interview/evaluate`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Interview Evaluation HTTP Error:", response.status, errorText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("AI Interview Evaluation Failed:", error.message);
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
  

  async trainConversionModel(limit = 5000, minRows = 40) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post("/lead-scoring/conversion/train", null, {
        params: { limit, min_rows: minRows }
      });
      return response.data;
    } catch (error) {
      console.error("AI Conversion Model Training Failed:", error.message);
      return null;
    }
  }

  async runBatchPrediction(limit = 50) {
    if (!AI_SERVICE_ENABLED) return null;
    try {
      const response = await this.client.post("/batch-predict", null, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error("AI Batch Prediction Failed:", error.message);
      return null;
    }
  }
}

module.exports = new AiService();
