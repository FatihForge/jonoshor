import { apiRequest } from '../api/apiClient.js';

export const userService = {
  /**
   * User Notifications
   * GET /api/v1/user/notifications
   */
  async getNotifications({ page = 1, limit = 20, unread = false } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    if (unread) params.set('unread', 'true');

    const qs = params.toString();
    return await apiRequest(`/user/notifications${qs ? `?${qs}` : ''}`);
  },

  /**
   * Mark notification as read
   * PATCH /api/v1/user/notifications/:id/read
   */
  async markNotificationAsRead(id) {
    return await apiRequest(`/user/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * List user conversations
   * GET /api/v1/user/messages
   */
  async listConversations() {
    return await apiRequest('/user/messages');
  },

  /**
   * Get messages in a conversation
   * GET /api/v1/user/messages/:conversationId
   */
  async getConversation(conversationId) {
    return await apiRequest(`/user/messages/${encodeURIComponent(conversationId)}`);
  },

  /**
   * Send a reply in a conversation
   * POST /api/v1/user/messages/:conversationId
   */
  async replyMessage(conversationId, { body, recipientId, complaintId, attachmentEvidenceIds = [] }) {
    return await apiRequest(`/user/messages/${encodeURIComponent(conversationId)}`, {
      method: 'POST',
      body: { body, recipientId, complaintId, attachmentEvidenceIds },
    });
  },

  /**
   * Get user profile
   * GET /api/v1/user/profile
   */
  async getProfile() {
    return await apiRequest('/user/profile');
  },

  /**
   * Update user profile
   * PATCH /api/v1/user/profile
   */
  async updateProfile({ fullName, mobile, languagePreference }) {
    return await apiRequest('/user/profile', {
      method: 'PATCH',
      body: { fullName, mobile, languagePreference },
    });
  },

  /**
   * Get user security settings
   * GET /api/v1/user/security
   */
  async getSecurity() {
    return await apiRequest('/user/security');
  },

  /**
   * Update user security settings (password change)
   * PATCH /api/v1/user/security
   */
  async updateSecurity({ currentPassword, newPassword }) {
    return await apiRequest('/user/security', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    });
  },
};
