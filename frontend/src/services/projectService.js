import { api } from './api';

export const projectService = {
  // Get my team (for project managers)
  // getMyTeam: async () => {
  //   const response = await api.get('/projects/my-team');
  //   return response;
  // },

  // Get all projects
  // getAllProjects: async () => {
  //   const response = await api.get('/projects/all');
  //   return response;
  // },
   getProjectsByRole: async () => {
  const response = await api.get('/projects');
  return response.data;
},
  // Create project
  createProject: async (projectData) => {
    const response = await api.post('/projects/create', projectData);
    return response;
  },

  // Assign team member to project
  assignTeam: async (projectId, employeeId) => {
    const response = await api.post('/projects/assign-team', { projectId, employeeId });
    return response;
  }
};
