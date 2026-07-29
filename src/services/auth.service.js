import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  changePassword: async ({ current_password, new_password }) => {
    const response = await api.patch('/auth/password', { current_password, new_password });
    return response.data;
  },

  verifyEmail: async ({ email, code }) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  resendVerification: async ({ email }) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};
