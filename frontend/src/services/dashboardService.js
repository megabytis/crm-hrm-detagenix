import { api } from './api';

export const dashboardService = {
  // Dashboard Data
  getDashboard: async () => {
    return await api.get('/dashboard');
  },
  
  // Manager Dashboard APIs
  getManagerDashboard: async (params) => {
    return await api.get('/manager/dashboard', { params });
  },
  getManagerGraph: async (params) => {
    return await api.get('/manager/dashboard/graph', { params });
  },
  getProductivity: async () => {
    return await api.get('/manager/dashboard/productivity');
  },
  getRiskAnalysis: async () => {
    return await api.get('/manager/dashboard/risk');
  },
};
