import api from './api';

// Envoi des demandes issues des formulaires publics du CAMAJ.
// `type` : 'mentor' | 'programme' | 'mentorat' | 'faj' | 'don' | 'relation_aide'
// `data` : l'état complet du formulaire (stocké tel quel côté serveur).
export const camajService = {
  submit: async (type, data) => {
    const response = await api.post('/camaj/submissions', { type, data });
    return response.data;
  },

  // --- Espace d'administration (réservé aux administrateurs) ---

  // Liste paginée des demandes, filtrable par type et statut.
  list: async ({ type, status, page = 1, limit = 20 } = {}) => {
    const params = { page, limit };
    if (type) params.type = type;
    if (status) params.status = status;
    const response = await api.get('/camaj/submissions', { params });
    return response.data;
  },

  // Compteurs par statut et par type (tableau de bord).
  stats: async () => {
    const response = await api.get('/camaj/submissions/stats');
    return response.data;
  },

  // Change le statut d'une demande : 'nouveau' | 'traite' | 'archive'.
  updateStatus: async (id, status) => {
    const response = await api.patch(`/camaj/submissions/${id}`, { status });
    return response.data;
  },
};
