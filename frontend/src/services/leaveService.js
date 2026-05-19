import { api } from './api';

export const leaveService = {

  // Apply Leave
  applyLeave: async (leaveData) => {
    return await api.post('/hrm/leaves/apply', leaveData);
  },

  // Get My Leaves
  getMyLeaves: async () => {
    return await api.get('/hrm/leaves/my');
  },

  // Get All Leaves
  getAllLeaves: async () => {
    return await api.get('/hrm/leaves/all');
  },

  // Update Leave Status
  updateLeaveStatus: async (leaveId, status) => {
    return await api.put(`/hrm/leaves/update/${leaveId}`, { status });
  },
  // Get Leave Stats
getLeaveStats: async (employeeId) => {
  return await api.get(`/hrm/leaves/leave-stats/${employeeId}`);
}
};