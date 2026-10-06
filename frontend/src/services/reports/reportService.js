import { apiRequest } from '../api/apiClient.js';

export const reportService = {
  async getReports({
    category = '',
    districtId = '',
    upazilaId = '',
    keyword = '',
    dateFrom = '',
    dateTo = '',
    verificationStatus = '',
    caseStatus = '',
    page = 1,
    limit = 12,
  } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (category) params.set('category', category);
    if (districtId) params.set('districtId', districtId);
    if (upazilaId) params.set('upazilaId', upazilaId);
    if (keyword) params.set('keyword', keyword);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (verificationStatus) params.set('verificationStatus', verificationStatus);
    if (caseStatus) params.set('caseStatus', caseStatus);

    return await apiRequest(`/public/reports?${params.toString()}`);
  },

  async getReportById(id) {
    const res = await apiRequest(`/public/reports/${id}`);
    return res.data;
  },

  async getStatistics() {
    const res = await apiRequest('/public/statistics');
    return res.data || { totalComplaints: 0, verifiedReports: 0, categories: [], districts: [], legalStatuses: [] };
  },
};
