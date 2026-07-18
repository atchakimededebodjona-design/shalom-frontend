import api from './api';

const BASE = '/billing';

const billingService = {
  // --- Entreprise ---
  createBusiness: async (data) => {
    const response = await api.post(`${BASE}/businesses`, data);
    return response.data;
  },
  getMyBusiness: async () => {
    const response = await api.get(`${BASE}/businesses/me`);
    return response.data;
  },
  updateMyBusiness: async (data) => {
    const response = await api.patch(`${BASE}/businesses/me`, data);
    return response.data;
  },

  // --- Clients ---
  createClient: async (data) => {
    const response = await api.post(`${BASE}/clients`, data);
    return response.data;
  },
  listClients: async (params = {}) => {
    const response = await api.get(`${BASE}/clients`, { params });
    return response.data;
  },
  updateClient: async (id, data) => {
    const response = await api.patch(`${BASE}/clients/${id}`, data);
    return response.data;
  },
  deleteClient: async (id) => {
    const response = await api.delete(`${BASE}/clients/${id}`);
    return response.data;
  },

  // --- Factures ---
  createInvoice: async (data) => {
    const response = await api.post(`${BASE}/invoices`, data);
    return response.data;
  },
  listInvoices: async (params = {}) => {
    const response = await api.get(`${BASE}/invoices`, { params });
    return response.data;
  },
  getInvoiceById: async (id) => {
    const response = await api.get(`${BASE}/invoices/${id}`);
    return response.data;
  },
  updateInvoice: async (id, data) => {
    const response = await api.patch(`${BASE}/invoices/${id}`, data);
    return response.data;
  },
  deleteInvoice: async (id) => {
    const response = await api.delete(`${BASE}/invoices/${id}`);
    return response.data;
  },
  getWhatsappLink: async (id) => {
    const response = await api.get(`${BASE}/invoices/${id}/whatsapp-link`);
    return response.data;
  },
  // Ouvre la facture imprimable (HTML) dans un nouvel onglet — nécessite le
  // token d'auth (route protégée), donc on récupère le HTML via axios plutôt
  // qu'un lien direct, puis on l'écrit dans une fenêtre ouverte au clic
  // (avant l'await, pour éviter le blocage des popups par le navigateur).
  openPrintView: async (id) => {
    const win = window.open('', '_blank');
    try {
      const response = await api.get(`${BASE}/invoices/${id}/print`, { responseType: 'text' });
      if (win) {
        win.document.write(response.data);
        win.document.close();
      }
    } catch (err) {
      if (win) win.close();
      throw err;
    }
  },

  // --- Paiements ---
  createPayment: async (invoiceId, data) => {
    const response = await api.post(`${BASE}/invoices/${invoiceId}/payments`, data);
    return response.data;
  },
  listPaymentsByInvoice: async (invoiceId) => {
    const response = await api.get(`${BASE}/invoices/${invoiceId}/payments`);
    return response.data;
  },
  deletePayment: async (paymentId) => {
    const response = await api.delete(`${BASE}/payments/${paymentId}`);
    return response.data;
  },
};

export default billingService;
