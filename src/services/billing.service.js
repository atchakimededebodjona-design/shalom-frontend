import api from './api';

// Module Facturation « Reçu+ » — appels vers /api/v1/billing.
// Chaque méthode renvoie response.data ({ success, data }).
export const billingService = {
  // --- Entreprise ---
  getMyBusiness: async () => (await api.get('/billing/businesses/me')).data,
  createBusiness: async (body) => (await api.post('/billing/businesses', body)).data,
  updateBusiness: async (body) => (await api.patch('/billing/businesses/me', body)).data,

  // --- Clients ---
  listClients: async (params = {}) => (await api.get('/billing/clients', { params })).data,
  createClient: async (body) => (await api.post('/billing/clients', body)).data,
  updateClient: async (id, body) => (await api.patch(`/billing/clients/${id}`, body)).data,
  deleteClient: async (id) => (await api.delete(`/billing/clients/${id}`)).data,

  // --- Factures ---
  listInvoices: async (params = {}) => (await api.get('/billing/invoices', { params })).data,
  getInvoice: async (id) => (await api.get(`/billing/invoices/${id}`)).data,
  createInvoice: async (body) => (await api.post('/billing/invoices', body)).data,
  updateInvoice: async (id, body) => (await api.patch(`/billing/invoices/${id}`, body)).data,
  deleteInvoice: async (id) => (await api.delete(`/billing/invoices/${id}`)).data,
  getWhatsappLink: async (id) => (await api.get(`/billing/invoices/${id}/whatsapp-link`)).data,

  // --- Paiements ---
  createPayment: async (invoiceId, body) => (await api.post(`/billing/invoices/${invoiceId}/payments`, body)).data,
  listPayments: async (invoiceId) => (await api.get(`/billing/invoices/${invoiceId}/payments`)).data,
  deletePayment: async (paymentId) => (await api.delete(`/billing/payments/${paymentId}`)).data,
};
