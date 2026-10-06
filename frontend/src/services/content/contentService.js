import { apiRequest } from '../api/apiClient.js';

export const contentService = {
  async getContent(slug) {
    try {
      const res = await apiRequest(`/public/content/${slug}`);
      return res.data;
    } catch {
      return null;
    }
  },

  async getFaqs() {
    try {
      const res = await apiRequest('/public/faqs');
      return res.data || [];
    } catch {
      return [];
    }
  },

  async getAnnouncements() {
    try {
      const res = await apiRequest('/public/announcements');
      return res.data || [];
    } catch {
      return [];
    }
  },
};
