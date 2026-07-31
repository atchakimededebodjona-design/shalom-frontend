import api from './api';

// `target_type` : 'post' | 'comment' — `status` : 'en_attente' | 'traite' | 'rejete'
export const reportsService = {
  // Signaler un post ou un commentaire (tout membre connecté).
  // reason: 'spam' | 'contenu_inapproprie' | 'harcelement' | 'faux_compte' | 'autre'
  create: async ({ target_type, target_id, reason, details }) => {
    const response = await api.post('/reports', { target_type, target_id, reason, details: details || undefined });
    return response.data;
  },

  // Le reste est réservé aux administrateurs (modération).
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
