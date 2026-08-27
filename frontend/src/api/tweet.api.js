import api from './axios';

export const tweetApi = {
  getAllTweets: async (params = {}) => {
    const response = await api.get('/tweets', { params });
    return response.data;
  },

  postTweet: async (content) => {
    const response = await api.post('/tweets/post', { content });
    return response.data;
  },

  editTweet: async (tweetId, content) => {
    const response = await api.patch(`/tweets/edit/${tweetId}`, { content });
    return response.data;
  },

  deleteTweet: async (tweetId) => {
    const response = await api.delete(`/tweets/delete/${tweetId}`);
    return response.data;
  },
};
