import api from './api';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';

const SHALOM_TV_API_URL = '/shalom-tv';

export { resolveMediaUrl };

const shalomTvService = {
  // === Publique / Abonnés ===
  getContents: (params) => {
    return api.get(SHALOM_TV_API_URL, { params });
  },

  getContentById: (id) => {
    return api.get(`${SHALOM_TV_API_URL}/${id}`);
  },

  // === Admin ===
  createContent: (formData) => {
    return api.post(SHALOM_TV_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateContent: (id, formData) => {
    return api.put(`${SHALOM_TV_API_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteContent: (id) => {
    return api.delete(`${SHALOM_TV_API_URL}/${id}`);
  },
};

export default shalomTvService;
