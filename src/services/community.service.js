import api from './api';

// Module Outils communautaires — /api/v1/community.
// L'annuaire et « mes groupes » vivent dans le module groups.
export const communityService = {
  // --- Annuaire (module groups) ---
  directory: async (params = {}) => (await api.get('/groups/directory', { params })).data,
  myGroups: async () => (await api.get('/groups/mine')).data,

  // --- Événements ---
  listEvents: async (params = {}) => (await api.get('/community/events', { params })).data,
  createEvent: async (body) => (await api.post('/community/events', body)).data,
  getEvent: async (id) => (await api.get(`/community/events/${id}`)).data,
  updateEvent: async (id, body) => (await api.patch(`/community/events/${id}`, body)).data,
  deleteEvent: async (id) => (await api.delete(`/community/events/${id}`)).data,
  register: async (id) => (await api.post(`/community/events/${id}/register`)).data,
  unregister: async (id) => (await api.delete(`/community/events/${id}/register`)).data,
  listRegistrations: async (id) => (await api.get(`/community/events/${id}/registrations`)).data,

  // --- Prières partagées ---
  listPrayers: async (params = {}) => (await api.get('/community/prayers', { params })).data,
  createPrayer: async (body) => (await api.post('/community/prayers', body)).data,
  updatePrayer: async (id, body) => (await api.patch(`/community/prayers/${id}`, body)).data,
  deletePrayer: async (id) => (await api.delete(`/community/prayers/${id}`)).data,
  support: async (id) => (await api.post(`/community/prayers/${id}/support`)).data,
  unsupport: async (id) => (await api.delete(`/community/prayers/${id}/support`)).data,

  // --- Annonces ---
  listAnnouncements: async (params = {}) => (await api.get('/community/announcements', { params })).data,
  createAnnouncement: async (body) => (await api.post('/community/announcements', body)).data,
  updateAnnouncement: async (id, body) => (await api.patch(`/community/announcements/${id}`, body)).data,
  deleteAnnouncement: async (id) => (await api.delete(`/community/announcements/${id}`)).data,
};
