import api from './axios';

export const commentApi = {
  getComments: async (type, id) => {
    const response = await api.get(`/comments/get-comments/${type}/${id}`);
    return response.data;
  },

  addCommentToVideo: async (videoId, content) => {
    const response = await api.post(`/comments/video/${videoId}`, { content });
    return response.data;
  },

  addCommentToTweet: async (tweetId, content) => {
    const response = await api.post(`/comments/tweet/${tweetId}`, { content });
    return response.data;
  },

  editComment: async (commentId, content) => {
    const response = await api.patch(`/comments/edit/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/delete/${commentId}`);
    return response.data;
  },
};
