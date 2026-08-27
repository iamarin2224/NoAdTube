import api from './axios';

export const videoApi = {
  getAllVideos: async (params = {}) => {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  getAllTags: async () => {
    const response = await api.get('/videos/tags');
    return response.data;
  },

  getStorageUsage: async () => {
    const response = await api.get('/videos/storage-usage');
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/videos/admin/stats');
    return response.data;
  },

  getVideoById: async (videoId) => {
    const response = await api.get(`/videos/get/${videoId}`);
    return response.data;
  },

  viewVideo: async (videoId) => {
    const response = await api.patch(`/videos/view/${videoId}`);
    return response.data;
  },

  uploadVideo: async (formData, onUploadProgress) => {
    const response = await api.post('/videos/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  updateVideoDetails: async (videoId, data) => {
    const response = await api.patch(`/videos/update/${videoId}`, data);
    return response.data;
  },

  updateVideoThumbnail: async (videoId, formData) => {
    const response = await api.patch(`/videos/update/thumbnail/${videoId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/delete/${videoId}`);
    return response.data;
  },

  getUploadedVideos: async () => {
    const response = await api.get('/videos/uploaded-videos');
    return response.data;
  },
};
