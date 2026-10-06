import { apiRequest } from '../api/apiClient.js';

export const superAdminService = {
  /**
   * Super Admin Dashboard metrics
   * GET /api/v1/super-admin/dashboard
   */
  async getDashboard() {
    return await apiRequest('/super-admin/dashboard');
  },

  /**
   * Authoritative list of system permissions
   * GET /api/v1/super-admin/permissions
   */
  async getPermissions() {
    return await apiRequest('/super-admin/permissions');
  },

  /**
   * List Admins with pagination
   * GET /api/v1/super-admin/admins
   */
  async listAdmins({ page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);

    const qs = params.toString();
    return await apiRequest(`/super-admin/admins${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get single Admin details
   * GET /api/v1/super-admin/admins/:id
   */
  async getAdminById(id) {
    return await apiRequest(`/super-admin/admins/${id}`);
  },

  /**
   * Create new Admin account
   * POST /api/v1/super-admin/admins
   */
  async createAdmin({ fullName, email, password, mobile, permissions }) {
    return await apiRequest('/super-admin/admins', {
      method: 'POST',
      body: { fullName, email, password, mobile, permissions },
    });
  },

  /**
   * Update Admin profile / status
   * PATCH /api/v1/super-admin/admins/:id
   */
  async updateAdmin(id, { fullName, mobile, accountStatus }) {
    return await apiRequest(`/super-admin/admins/${id}`, {
      method: 'PATCH',
      body: { fullName, mobile, accountStatus },
    });
  },

  /**
   * Update Admin permissions (Protected by Re-Auth)
   * PATCH /api/v1/super-admin/admins/:id/permissions
   */
  async updatePermissions(id, { permissions, reAuthToken }) {
    const headers = {};
    if (reAuthToken) {
      headers['x-reauth-token'] = reAuthToken;
    }
    return await apiRequest(`/super-admin/admins/${id}/permissions`, {
      method: 'PATCH',
      headers,
      body: { permissions, reAuthToken },
    });
  },

  /**
   * Re-authenticate with password and 2FA TOTP code for critical operations
   * POST /api/v1/auth/re-authenticate
   */
  async reAuthenticate({ password, totpCode }) {
    return await apiRequest('/auth/re-authenticate', {
      method: 'POST',
      body: { password, totpCode },
    });
  },

  /**
   * Security incident and risk logs
   * GET /api/v1/super-admin/security/logs
   */
  async getSecurityLogs({ page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);

    const qs = params.toString();
    return await apiRequest(`/super-admin/security/logs${qs ? `?${qs}` : ''}`);
  },

  /**
   * Privileged application audit logs
   * GET /api/v1/super-admin/audit-logs
   */
  async getAuditLogs({ page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);

    const qs = params.toString();
    return await apiRequest(`/super-admin/audit-logs${qs ? `?${qs}` : ''}`);
  },

  /**
   * Platform System Settings
   * GET /api/v1/super-admin/system-settings
   */
  async getSystemSettings() {
    return await apiRequest('/super-admin/system-settings');
  },

  /**
   * Update single system setting (Protected by Re-Auth)
   * PATCH /api/v1/super-admin/system-settings/:key
   */
  async updateSystemSetting(key, { value, category, reAuthToken }) {
    const headers = {};
    if (reAuthToken) {
      headers['x-reauth-token'] = reAuthToken;
    }
    return await apiRequest(`/super-admin/system-settings/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers,
      body: { value, category },
    });
  },

  /**
   * Financial Settings (Super Admin only, Section 72)
   * GET /api/v1/super-admin/financial-settings
   */
  async getFinancialSettings() {
    return await apiRequest('/super-admin/financial-settings');
  },

  /**
   * Update financial destination settings (Protected by Re-Auth)
   * PATCH /api/v1/super-admin/financial-settings
   */
  async updateFinancialSettings({ settings, reAuthToken }) {
    const headers = {};
    if (reAuthToken) {
      headers['x-reauth-token'] = reAuthToken;
    }
    return await apiRequest('/super-admin/financial-settings', {
      method: 'PATCH',
      headers,
      body: { settings },
    });
  },
};
