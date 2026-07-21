import api from './api';

// Module Publicit├®s (espace publicitaire du tableau de bord).
// Lecture des annonces actives ouverte ├á tout utilisateur connect├® ; la gestion
// (listAll / create / update / remove) est r├®serv├®e aux administrateurs c├┤t├® API.
export const adsService = {
  list: async () => (await api.get('/ads')).data,            // annonces actives (bandeau)
  listAll: async () => (await api.get('/ads/manage')).data,  // toutes (admin)
  create: async (body) => (await api.post('/ads', body)).data,
  update: async (id, body) => (await api.patch(`/ads/${id}`, body)).data,
  remove: async (id) => (await api.delete(`/ads/${id}`)).data,
};
