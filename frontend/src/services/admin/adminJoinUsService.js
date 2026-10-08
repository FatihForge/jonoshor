import { apiRequest } from '../api/apiClient.js';

export const adminJoinUsService = {
  /**
   * List Join Us submissions with optional filtering
   */
  async listSubmissions({ page = 1, limit = 20, status, profession, isDuplicate, search } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    if (status) params.set('status', status);
    if (profession) params.set('profession', profession);
    if (isDuplicate !== undefined && isDuplicate !== null && isDuplicate !== '') {
      params.set('isDuplicate', isDuplicate);
    }
    if (search) params.set('search', search);

    const qs = params.toString();
    return await apiRequest(`/admin/join-us${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get submission details including documents, references, and notes
   */
  async getSubmissionById(id) {
    return await apiRequest(`/admin/join-us/${id}`);
  },

  /**
   * Update submission review status
   */
  async updateStatus(id, { status, adminNotes }) {
    return await apiRequest(`/admin/join-us/${id}/status`, {
      method: 'PATCH',
      body: { status, adminNotes },
    });
  },

  /**
   * Add internal administrative note
   */
  async addNote(id, note) {
    return await apiRequest(`/admin/join-us/${id}/notes`, {
      method: 'POST',
      body: { note },
    });
  },

  /**
   * Update internal administrative note
   */
  async updateNote(id, noteId, note) {
    return await apiRequest(`/admin/join-us/${id}/notes/${noteId}`, {
      method: 'PATCH',
      body: { note },
    });
  },

  /**
   * Get direct document download endpoint URL
   */
  getDocumentDownloadUrl(id, documentId) {
    return `/api/v1/admin/join-us/${id}/documents/${documentId}`;
  },

  /**
   * Export all Join Us submissions
   */
  async exportData() {
    return await apiRequest('/admin/join-us/export', {
      method: 'POST',
    });
  },

  /**
   * Super Admin delete Join Us submission
   */
  async deleteSubmission(id, reason) {
    return await apiRequest(`/admin/join-us/${id}`, {
      method: 'DELETE',
      body: { reason },
    });
  },
};
