import { apiRequest } from '../api/apiClient.js';

let currentUser = null;

export const authService = {
  async register(userData) {
    return await apiRequest('/auth/register', { method: 'POST', body: userData });
  },

  async login(email, password) {
    const res = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
    if (res.data?.user) {
      currentUser = res.data.user;
    }
    return res;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      currentUser = null;
    }
  },

  async refreshToken() {
    try {
      const res = await apiRequest('/auth/refresh-token', { method: 'POST' });
      return res;
    } catch {
      currentUser = null;
      return null;
    }
  },

  async getMe() {
    try {
      const res = await apiRequest('/auth/me');
      currentUser = res.data?.user || null;
      return currentUser;
    } catch {
      currentUser = null;
      return null;
    }
  },

  getCurrentUser() {
    return currentUser;
  },

  async verifyEmail(token) {
    return await apiRequest('/auth/verify-email', { method: 'POST', body: { token } });
  },

  async resendVerification(email) {
    return await apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: { email },
    });
  },

  async forgotPassword(email) {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword(token, newPassword) {
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    });
  },
};
