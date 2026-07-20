import api from './api';

// Module Facturation (Reçu+) — appels vers /api/v1/invoices.
// Chaque méthode renvoie response.data ({ success, data }).
export const invoicesService = {
  overview: async () => (await api.get('/invoices/overview')).data,
  list: async (params = {}) => (await api.get('/invoices', { params })).data,
  get: async (id) => (await api.get(`/invoices/${id}`)).data,
  create: async (body) => (await api.post('/invoices', body)).data,
  update: async (id, body) => (await api.patch(`/invoices/${id}`, body)).data,
  remove: async (id) => (await api.delete(`/invoices/${id}`)).data,

  // Reçus / paiements (crédite le portefeuille SHALOM côté serveur)
  listPayments: async (id) => (await api.get(`/invoices/${id}/payments`)).data,
  addPayment: async (id, body) => (await api.post(`/invoices/${id}/payments`, body)).data,
};
