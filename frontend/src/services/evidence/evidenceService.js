import { apiRequest } from '../api/apiClient.js';
import { API_BASE } from '../../config/constants.js';

export const evidenceService = {
  /**
   * Create an upload session for evidence
   */
  async createUploadSession(complaintId, metadata) {
    return await apiRequest(`/user/complaints/${complaintId}/evidence/upload-session`, {
      method: 'POST',
      body: metadata,
    });
  },

  /**
   * Complete the upload session by sending file buffer to backend for malware scan & storage
   */
  async completeUpload(complaintId, { evidenceId, sha256, file }) {
    const formData = new FormData();
    formData.append('evidenceId', evidenceId);
    if (sha256) formData.append('sha256', sha256);
    if (file) formData.append('file', file);

    return await apiRequest(`/user/complaints/${complaintId}/evidence/complete`, {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Register external evidence URL
   */
  async addExternalLink(complaintId, { url, sourceType }) {
    return await apiRequest(`/user/complaints/${complaintId}/evidence/external`, {
      method: 'POST',
      body: { url, sourceType },
    });
  },

  /**
   * Get list of permitted evidence for a complaint
   */
  async listEvidence(complaintId) {
    const res = await apiRequest(`/user/complaints/${complaintId}/evidence`);
    return res.data || [];
  },

  /**
   * Get download URL for an evidence item
   */
  getDownloadUrl(complaintId, evidenceId) {
    return `${API_BASE}/user/complaints/${complaintId}/evidence/${evidenceId}/download`;
  },
};
