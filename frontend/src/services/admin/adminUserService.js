import { apiRequest } from '../api/apiClient.js';

export const adminUserService = {
  /**
   * List users with pagination and optional status filter
   * GET /api/v1/admin/users
   */
  async listUsers({ page = 1, limit = 20, status } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    if (status) params.set('status', status);

    const qs = params.toString();
    return await apiRequest(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get single user by ID
   * GET /api/v1/admin/users/:id
   */
  async getUserById(id) {
    return await apiRequest(`/admin/users/${id}`);
  },

  /**
   * Update user account status (active, suspended, blocked) with administrative reason
   * PATCH /api/v1/admin/users/:id/status
   */
  async updateUserStatus(id, { status, reason } = {}) {
    return await apiRequest(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { status, reason },
    });
  },
};
