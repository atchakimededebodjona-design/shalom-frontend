import api from './api';

// Annuaire des conseillers en accompagnement (réservé aux administrateurs).
export const conseillersService = {
  list: async (params = {}) => (await api.get('/conseillers', { params })).data,
  create: async (body) => (await api.post('/conseillers', body)).data,
  update: async (id, body) => (await api.patch(`/conseillers/${id}`, body)).data,
  remove: async (id) => (await api.delete(`/conseillers/${id}`)).data,
};
