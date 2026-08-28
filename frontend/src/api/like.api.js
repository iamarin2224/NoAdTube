import api from './axios';

export const likeApi = {
  toggleLike: async (type, id) => {
    const response = await api.post(`/likes/toggle/${type}/${id}`);
    return response.data;
  },

  toggleVideoLike: async (videoId) => {
    const response = await api.post(`/likes/toggle/video/${videoId}`);
    return response.data;
  },

  toggleTweetLike: async (tweetId) => {
    const response = await api.post(`/likes/toggle/tweet/${tweetId}`);
    return response.data;
  },

  toggleCommentLike: async (commentId) => {
    const response = await api.post(`/likes/toggle/comment/${commentId}`);
    return response.data;
  },

  likeVideo: async (videoId) => {
    const response = await api.post(`/likes/video/${videoId}`);
    return response.data;
  },

  likeTweet: async (tweetId) => {
    const response = await api.post(`/likes/tweet/${tweetId}`);
    return response.data;
  },

  likeComment: async (commentId) => {
    const response = await api.post(`/likes/comment/${commentId}`);
    return response.data;
  },

  unlike: async (likeId) => {
    const response = await api.delete(`/likes/unlike/${likeId}`);
    return response.data;
  },

  getLikesCount: async (type, id) => {
    const response = await api.get(`/likes/get-count/${type}/${id}`);
    return response.data;
  },

  getLikeStatus: async (type, id) => {
    const response = await api.get(`/likes/get-status/${type}/${id}`);
    return response.data;
  },

  getLikedVideos: async () => {
    const response = await api.get('/likes/videos');
    return response.data;
  },
};
