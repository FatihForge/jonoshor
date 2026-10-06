import { apiRequest } from '../api/apiClient.js';

export const locationService = {
  async getDivisions() {
    const res = await apiRequest('/public/divisions');
    return res.data || [];
  },

  async getDistricts(divisionId = null) {
    const url = divisionId ? `/public/districts?divisionId=${divisionId}` : '/public/districts';
    const res = await apiRequest(url);
    return res.data || [];
  },

  async getUpazilas(districtId) {
    if (!districtId) return [];
    const res = await apiRequest(`/public/districts/${districtId}/upazilas`);
    return res.data || [];
  },
};
