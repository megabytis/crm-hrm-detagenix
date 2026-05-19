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
};
