import { api } from './api';

export const userService = {
 
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/users${queryString ? `?${queryString}` : ''}`);
  },
  
  // Get employee profile by ID
  getProfile: async (id) => {
    const response = await api.get(`/hrm/profile/${id}`);
    return response;
  },
  
  create: async (userData) => {
    return await api.post('/users', userData);
  },
  
  // Update employee profile
  updateProfile: async (id, userData) => {
    console.log('Updating profile for ID:', id, 'with data:', userData);
    const response = await api.put(`/hrm/profile/update/${id}`, userData);
    return response;
  },
  
  // Update user (for admin/hr management)
  update: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response;
    } catch (error) {
      console.error('User Service - Update user error:', error);
      throw error;
    }
  },
  
  // Delete employee
  delete: async (id) => {
    const response = await api.delete(`/hrm/profile/${id}`);
    return response.data;
  },
  
  // Delete user (for admin/hr management)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('User Service - Delete user error:', error);
      throw error;
    }
  },
 resetPassword: async (id, data) => {
  try {
    const response = await api.put(`/hrm/profile/reset-password/${id}`, data);
    return response; 
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false };
  }
}
};
