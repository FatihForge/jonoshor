import { apiRequest } from '../api/apiClient.js';

export const adminEvidenceService = {
  /**
   * List evidence records with filtering and pagination
   */
  async listEvidence({
    page = 1,
    limit = 20,
    type,
    reviewStatus,
    malwareScanStatus,
    publicStatus,
    complaintId,
  } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    if (type) params.set('type', type);
    if (reviewStatus) params.set('reviewStatus', reviewStatus);
    if (malwareScanStatus) params.set('malwareScanStatus', malwareScanStatus);
    if (publicStatus) params.set('publicStatus', publicStatus);
    if (complaintId) params.set('complaintId', complaintId);

    const qs = params.toString();
    return await apiRequest(`/admin/evidence${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get single evidence details for review
   */
  async getEvidenceById(id) {
    return await apiRequest(`/admin/evidence/${id}`);
  },

  /**
   * Submit review decision (reviewed, rejected, under_review, pending)
   */
  async reviewEvidence(id, { reviewStatus, malwareScanStatus, notes }) {
    return await apiRequest(`/admin/evidence/${id}/review`, {
      method: 'POST',
      body: { reviewStatus, malwareScanStatus, notes },
    });
  },

  /**
   * Update public disclosure status (approved_public, private, withheld)
   */
  async updatePublication(id, { publicStatus, redactionStatus }) {
    return await apiRequest(`/admin/evidence/${id}/publication`, {
      method: 'POST',
      body: { publicStatus, redactionStatus },
    });
  },

  /**
   * Update redaction status
   */
  async updateRedaction(id, { redactionStatus, publicStatus }) {
    return await apiRequest(`/admin/evidence/${id}/redaction`, {
      method: 'POST',
      body: { redactionStatus, publicStatus },
    });
  },

  /**
   * Delete evidence with required administrative reason
   */
  async deleteEvidence(id, { reason }) {
    return await apiRequest(`/admin/evidence/${id}/delete`, {
      method: 'POST',
      body: { reason },
    });
  },
};
