import api from './api';

export const profilesService = {
  // GET /profiles/me — profil complet de l'utilisateur connecté
  getMe: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  // GET /profiles/search?q=&page=&limit= — recherche par nom d'affichage
  search: async (q, { page = 1, limit = 20 } = {}) => {
    const response = await api.get('/profiles/search', { params: { q, page, limit } });
    return response.data;
  },

  // GET /profiles/:userId — profil public d'un autre utilisateur (sans champs sensibles)
  getById: async (userId) => {
    const response = await api.get(`/profiles/${userId}`);
    return response.data;
  },

  // PATCH /profiles/me — met à jour le profil de l'utilisateur connecté
  updateMe: async (fields) => {
    const response = await api.patch('/profiles/me', fields);
    return response.data;
  },
};
