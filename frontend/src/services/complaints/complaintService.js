import { apiRequest } from '../api/apiClient.js';

export const complaintService = {
  async submitPublicComplaint(complaintData) {
    return await apiRequest('/public/complaints', { method: 'POST', body: complaintData });
  },

  async submitUserComplaint(complaintData) {
    return await apiRequest('/user/complaints', { method: 'POST', body: complaintData });
  },

  async getMyComplaints(page = 1, limit = 20) {
    return await apiRequest(`/user/complaints?page=${page}&limit=${limit}`);
  },

  async getMyComplaintById(id) {
    return await apiRequest(`/user/complaints/${id}`);
  },

  async saveDraft(complaintData) {
    return await apiRequest('/user/complaints', {
      method: 'POST',
      body: { ...complaintData, isDraft: true },
    });
  },

  async updateDraft(id, complaintData, isSubmit = false) {
    return await apiRequest(`/user/complaints/${id}`, {
      method: 'PATCH',
      body: { ...complaintData, action: isSubmit ? 'submit' : 'save_draft' },
    });
  },

  async requestWithdrawal(id, reason) {
    return await apiRequest(`/user/complaints/${id}/withdraw`, { method: 'POST', body: { reason } });
  },

  async requestCorrection(id, requestedChanges, reason) {
    return await apiRequest(`/user/complaints/${id}/corrections`, {
      method: 'POST',
      body: { requestedChanges, reason },
    });
  },

  async requestLegalUpdate(id, claimData) {
    return await apiRequest(`/user/complaints/${id}/legal-update-request`, {
      method: 'POST',
      body: claimData,
    });
  },
};
