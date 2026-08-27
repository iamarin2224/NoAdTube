import api from './axios';

export const playlistApi = {
  createPlaylist: async (data) => {
    const response = await api.post('/playlists', data);
    return response.data;
  },

  getMyPlaylists: async () => {
    const response = await api.get('/playlists/my');
    return response.data;
  },

  getUserPlaylists: async (userId) => {
    const response = await api.get(`/playlists/user/${userId}`);
    return response.data;
  },

  getPlaylistById: async (playlistId) => {
    const response = await api.get(`/playlists/${playlistId}`);
    return response.data;
  },

  addVideoToPlaylist: async (playlistId, videoId) => {
    const response = await api.patch(`/playlists/add/${videoId}/${playlistId}`);
    return response.data;
  },

  removeVideoFromPlaylist: async (playlistId, videoId) => {
    const response = await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
    return response.data;
  },

  updatePlaylist: async (playlistId, data) => {
    const response = await api.patch(`/playlists/${playlistId}`, data);
    return response.data;
  },

  deletePlaylist: async (playlistId) => {
    const response = await api.delete(`/playlists/${playlistId}`);
    return response.data;
  },
};
