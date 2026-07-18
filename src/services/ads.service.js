import api from './api';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';

const ADS_API_URL = '/ads';

export { resolveMediaUrl };

const adsService = {
  // === Public / Utilisateurs connectés ===
  getAds: (params) => {
    return api.get(ADS_API_URL, { params });
  },

  // === Admin ===
  createAd: (formData) => {
    return api.post(ADS_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateAd: (id, formData) => {
    return api.put(`${ADS_API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteAd: (id) => {
    return api.delete(`${ADS_API_URL}/${id}`);
  },
};

export default adsService;
