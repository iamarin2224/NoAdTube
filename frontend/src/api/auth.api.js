import api from './axios';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  register: async (formData) => {
    const response = await api.post('/users/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyOTP: async ({ email, otp }) => {
    const response = await api.post('/users/verify-otp', { email, otp });
    return response.data;
  },

  resendOTP: async ({ email }) => {
    const response = await api.post('/users/resend-otp', { email });
    return response.data;
  },

  googleAuth: async (credentialData) => {
    const response = await api.post('/users/google-auth', credentialData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/users/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/user-details');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/users/refresh-token');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/users/change-password', data);
    return response.data;
  },

  updateAccountDetails: async (data) => {
    const response = await api.patch('/users/update/account-details', data);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.post('/users/update/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCoverImage: async (formData) => {
    const response = await api.post('/users/update/cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getChannelProfile: async (username) => {
    const response = await api.get(`/users/channel/${username}`);
    return response.data;
  },

  getWatchHistory: async () => {
    const response = await api.get('/users/watch-history');
    return response.data;
  },
};
