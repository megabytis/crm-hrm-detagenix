import { api } from './api';

export const crmService = {
  // Customer Management
  customers: {
    getAll: async (params = {}) => {
      try {
        const response = await api.get('/crm/customers', { params });
        return response;
      } catch (error) {
        console.error('CRM Service - Get customers error:', error);
        throw error;
      }
    },
    
    getById: async (id) => {
      try {
        const response = await api.get(`/crm/customers/${id}`);
        return response;
      } catch (error) {
        console.error('CRM Service - Get customer by ID error:', error);
        throw error;
      }
    },
    
    create: async (customerData) => {
      try {
        const response = await api.post('/crm/customers', customerData);
        return response;
      } catch (error) {
        console.error('CRM Service - Create customer error:', error);
        throw error;
      }
    },
    
    update: async (id, customerData) => {
      try {
        const response = await api.put(`/crm/customers/${id}`, customerData);
        return response;
      } catch (error) {
        console.error('CRM Service - Update customer error:', error);
        throw error;
      }
    },
    
    delete: async (id) => {
      try {
        const response = await api.delete(`/crm/customers/${id}`);
        return response;
      } catch (error) {
        console.error('CRM Service - Delete customer error:', error);
        throw error;
      }
    },
  },

  // Lead Management
  leads: {
    getAll: async (params = {}) => {
      const response = await api.get('/crm/leads', { params });
      return response;
    },
    
    getById: async (id) => {
      const response = await api.get(`/crm/leads/${id}`);
      return response;
    },
    
    create: async (leadData) => {
      const response = await api.post('/crm/leads', leadData);
      return response;
    },
    
    update: async (id, leadData) => {
      const response = await api.put(`/crm/leads/${id}`, leadData);
      return response;
    },
    
    delete: async (id) => {
      const response = await api.delete(`/crm/leads/${id}`);
      return response;
    },
  },

  // Sales Activities
  activities: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return await api.get(`/crm/activities${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: async (id) => {
      return await api.get(`/crm/activities/${id}`);
    },
    
    create: async (activityData) => {
      return await api.post('/crm/activities', activityData);
    },
    
    update: async (id, activityData) => {
      return await api.put(`/crm/activities/${id}`, activityData);
    },
    
    delete: async (id) => {
      return await api.delete(`/crm/activities/${id}`);
    },
  },

  /*
   * Added by Pairing AI: Reports Module Integration
   * Integrates the Sales Forecasting & Revenue Pipeline report APIs with the backend.
   */
  reports: {
    getSalesForecast: async (months = 6) => {
      try {
        const response = await api.get(`/crm/reports/sales-forecast?months=${months}`);
        return response;
      } catch (error) {
        console.error('CRM Service - Fetch sales forecast error:', error);
        throw error;
      }
    }
  },

  /*
   * Added by Pairing AI: CRM Chatbot Module Integration
   * Connects the Natural Language Gemini Assistant Chat with the backend router.
   */
  chatbot: {
    chat: async (userInput, userContext = {}) => {
      try {
        const response = await api.post('/crm/chatbot/chat', {
          user_input: userInput,
          user_context: userContext
        });
        return response;
      } catch (error) {
        console.error('CRM Service - Chatbot error:', error);
        throw error;
      }
    }
  },

  leadGeneration: {
    generateLeads: async (query, maxResults = 10, persist = true) => {
      try {
        const response = await api.post('/crm/lead-generation/search-query', {
          query,
          max_results: maxResults,
          persist
        });
        return response;
      } catch (error) {
        console.error('CRM Service - Lead Generation error:', error);
        throw error;
      }
    }
  },

  /*
   * Added by Pairing AI: Lead Conversion & Scoring retrainer
   * Links real-time conversion forecast and retraining to backend AI models.
   */
  leadConversion: {
    predict: async (data) => {
      try {
        const response = await api.post('/crm/engagement/conversion/predict', data);
        return response;
      } catch (error) {
        console.error('CRM Service - Predict Conversion error:', error);
        throw error;
      }
    },
    train: async (limit = 100, minRows = 40) => {
      try {
        const response = await api.post('/crm/engagement/conversion/train', { limit, minRows });
        return response;
      } catch (error) {
        console.error('CRM Service - Train Conversion Model error:', error);
        throw error;
      }
    }
  },

  /*
   * Added by Pairing AI: Client Lifetime Value (LTV) Forecast Integration
   * Integrates the CLV, upsell potential, and cross-sell window indicators with the backend.
   */
  clientLtv: {
    predict: async (data) => {
      try {
        const response = await api.post('/crm/engagement/clv/predict', data);
        return response;
      } catch (error) {
        console.error('CRM Service - Predict Client LTV error:', error);
        throw error;
      }
    }
  },

  followup: {
    optimize: async (data) => {
      try {
        const response = await api.post('/crm/engagement/followup/optimize', data);
        return response;
      } catch (error) {
        console.error('CRM Service - Optimize follow-up error:', error);
        throw error;
      }
    }
  },

  /*
   * Added by Pairing AI: Conversation Intelligence Analyzers
   * Analyzes chat, email, or meeting logs to assess lead interest and deal risk.
   */
  conversationIntelligence: {
    analyze: async (data) => {
      try {
        const response = await api.post('/crm/conversation-intelligence/analyze', data);
        return response;
      } catch (error) {
        console.error('CRM Service - Conversation Intelligence error:', error);
        throw error;
      }
    }
  }
};


