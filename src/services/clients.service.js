import api from './api';

// Module Clients (Reçu+) — appels vers /api/v1/clients.
// Chaque méthode renvoie response.data ({ success, data }).
export const clientsService = {
  list: async (params = {}) => (await api.get('/clients', { params })).data,
  get: async (id) => (await api.get(`/clients/${id}`)).data,
  create: async (body) => (await api.post('/clients', body)).data,
  update: async (id, body) => (await api.patch(`/clients/${id}`, body)).data,
  remove: async (id) => (await api.delete(`/clients/${id}`)).data,
};
