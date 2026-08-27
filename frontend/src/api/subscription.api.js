import api from './axios';

export const subscriptionApi = {
  toggleSubscription: async (username) => {
    const response = await api.post(`/subscriptions/toggle/${username}`);
    return response.data;
  },

  subscribe: async (username) => {
    const response = await api.post(`/subscriptions/subscribe/${username}`);
    return response.data;
  },

  unsubscribe: async (username) => {
    const response = await api.delete(`/subscriptions/unsubscribe/${username}`);
    return response.data;
  },

  getSubscribedChannels: async () => {
    const response = await api.get('/subscriptions/channels');
    return response.data;
  },
};
