import { apiRequest } from '../api/apiClient.js';

export const adminComplaintService = {
  /**
   * Fetch operational metrics for Admin Dashboard
   */
  async getDashboard() {
    return await apiRequest('/admin/dashboard');
  },

  /**
   * List complaints with filtering and pagination
   */
  async listComplaints({ page = 1, limit = 20, status, category, districtId, priority } = {}) {
    const params = new URLSearchParams();
    if (page) params.set('page', page);
    if (limit) params.set('limit', limit);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (districtId) params.set('districtId', districtId);
    if (priority) params.set('priority', priority);

    const qs = params.toString();
    return await apiRequest(`/admin/complaints${qs ? `?${qs}` : ''}`);
  },

  /**
   * Get full complaint details for review
   */
  async getComplaintById(id) {
    return await apiRequest(`/admin/complaints/${id}`);
  },

  /**
   * Assign reviewer to complaint
   */
  async assignReviewer(id, reviewerId) {
    return await apiRequest(`/admin/complaints/${id}/assign`, {
      method: 'POST',
      body: { reviewerId },
    });
  },

  /**
   * Declare conflict of interest
   */
  async declareConflict(id, reason) {
    return await apiRequest(`/admin/complaints/${id}/conflict`, {
      method: 'POST',
      body: { reason },
    });
  },

  /**
   * Screen complaint to transition workflow status with notes
   */
  async screenComplaint(id, { status, notes }) {
    return await apiRequest(`/admin/complaints/${id}/screen`, {
      method: 'POST',
      body: { status, notes },
    });
  },

  /**
   * Request more information from reporter
   */
  async requestInformation(id, { message, targetUserId }) {
    return await apiRequest(`/admin/complaints/${id}/request-information`, {
      method: 'POST',
      body: { message, targetUserId },
    });
  },

  /**
   * Record verification decision
   */
  async verifyComplaint(id, { decision, reason, notes, assessment }) {
    return await apiRequest(`/admin/complaints/${id}/verify`, {
      method: 'POST',
      body: { decision, reason, notes, assessment },
    });
  },

  /**
   * Publication review decision
   */
  async reviewPublication(id, { approved, reason }) {
    return await apiRequest(`/admin/complaints/${id}/publication-review`, {
      method: 'POST',
      body: { approved, reason },
    });
  },

  /**
   * Create and publish public report
   */
  async createPublicReport(id, reportPayload) {
    return await apiRequest(`/admin/complaints/${id}/public-report`, {
      method: 'POST',
      body: reportPayload,
    });
  },

  /**
   * Update existing public report
   */
  async updatePublicReport(reportId, reportPayload) {
    return await apiRequest(`/admin/public-reports/${reportId}`, {
      method: 'PATCH',
      body: reportPayload,
    });
  },

  /**
   * Get public report for a complaint
   */
  async getPublicReportByComplaintId(id) {
    return await apiRequest(`/admin/complaints/${id}/public-report`);
  },

  // Legal Cases & Timeline Tracking
  async getLegalCases(complaintId) {
    return await apiRequest(`/admin/complaints/${complaintId}/legal-cases`);
  },

  async createLegalCase(complaintId, caseData) {
    return await apiRequest(`/admin/complaints/${complaintId}/legal-cases`, {
      method: 'POST',
      body: caseData,
    });
  },

  async updateLegalCase(caseId, updateData) {
    return await apiRequest(`/admin/legal-cases/${caseId}`, {
      method: 'PATCH',
      body: updateData,
    });
  },

  async addLegalTimeline(caseId, eventData) {
    return await apiRequest(`/admin/legal-cases/${caseId}/timeline`, {
      method: 'POST',
      body: eventData,
    });
  },

  async updateLegalTimeline(caseId, eventId, eventData) {
    return await apiRequest(`/admin/legal-cases/${caseId}/timeline/${eventId}`, {
      method: 'PATCH',
      body: eventData,
    });
  },

  // Authority Actions Tracking
  async getAuthorityActions(complaintId) {
    return await apiRequest(`/admin/complaints/${complaintId}/authority-actions`);
  },

  async addAuthorityAction(complaintId, actionData) {
    return await apiRequest(`/admin/complaints/${complaintId}/authority-actions`, {
      method: 'POST',
      body: actionData,
    });
  },

  async updateAuthorityAction(complaintId, actionId, updateData) {
    return await apiRequest(`/admin/complaints/${complaintId}/authority-actions/${actionId}`, {
      method: 'PATCH',
      body: updateData,
    });
  },

  // Reporter Legal Update Claims Review
  async getLegalUpdateRequests(complaintId) {
    return await apiRequest(`/admin/complaints/${complaintId}/legal-update-requests`);
  },

  async reviewLegalUpdateRequest(complaintId, requestId, reviewData) {
    return await apiRequest(`/admin/complaints/${complaintId}/legal-update-requests/${requestId}/review`, {
      method: 'POST',
      body: reviewData,
    });
  },
};

