import api from './api';

// Module Portefeuille — appels vers /api/v1/wallet.
// Chaque méthode renvoie response.data ({ success, data }).
export const walletService = {
  // --- Résumé / mouvements ---
  getWallet: async (params = {}) => (await api.get('/wallet', { params })).data,
  listTransactions: async (params = {}) => (await api.get('/wallet/transactions', { params })).data,

  // --- Mouvements manuels ---
  createIncome: async (body) => (await api.post('/wallet/income', body)).data,
  createExpense: async (body) => (await api.post('/wallet/expense', body)).data,
  reverseTransaction: async (id, body = {}) => (await api.post(`/wallet/transactions/${id}/reverse`, body)).data,

  // --- Rechargement (provider) ---
  topup: async (body) => (await api.post('/wallet/topup', body)).data,

  // --- Catégories (système partagées + personnalisées) ---
  listCategories: async (type) =>
    (await api.get('/wallet/categories', { params: type ? { type } : {} })).data,
  createCategory: async (body) => (await api.post('/wallet/categories', body)).data,
  updateCategory: async (id, body) => (await api.patch(`/wallet/categories/${id}`, body)).data,
  deleteCategory: async (id) => (await api.delete(`/wallet/categories/${id}`)).data,
};
