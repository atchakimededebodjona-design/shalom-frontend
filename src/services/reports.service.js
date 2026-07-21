import api from './api';

// Espace de modération (réservé aux administrateurs).
// `target_type` : 'post' | 'comment' — `status` : 'en_attente' | 'traite' | 'rejete'
export const reportsService = {
  list: async ({ status, page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await api.get('/reports', { params });
    return response.data;
  },

  // status: 'traite' | 'rejete' — apply_action: masque le contenu visé si true et status='traite'.
  updateStatus: async (id, status, applyAction = false) => {
    const response = await api.patch(`/reports/${id}`, { status, apply_action: applyAction });
    return response.data;
  },
};
