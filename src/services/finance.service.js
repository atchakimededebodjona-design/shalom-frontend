import api from './api';

// Module Gestion Financière — appels vers /api/v1/finance.
// Chaque méthode renvoie response.data ({ success, data }).
export const financeService = {
  // --- Analyse ---
  getOverview: async () => (await api.get('/finance/overview')).data,
  getSummary: async (yearMonth) =>
    (await api.get('/finance/summary', { params: yearMonth ? { year_month: yearMonth } : {} })).data,

  // --- Catégories ---
  listCategories: async (type) =>
    (await api.get('/finance/categories', { params: type ? { type } : {} })).data,
  createCategory: async (body) => (await api.post('/finance/categories', body)).data,
  updateCategory: async (id, body) => (await api.patch(`/finance/categories/${id}`, body)).data,
  deleteCategory: async (id) => (await api.delete(`/finance/categories/${id}`)).data,

  // --- Transactions ---
  listTransactions: async (params = {}) => (await api.get('/finance/transactions', { params })).data,
  createTransaction: async (body) => (await api.post('/finance/transactions', body)).data,
  updateTransaction: async (id, body) => (await api.patch(`/finance/transactions/${id}`, body)).data,
  deleteTransaction: async (id) => (await api.delete(`/finance/transactions/${id}`)).data,

  // --- Objectifs ---
  listGoals: async (status) =>
    (await api.get('/finance/goals', { params: status ? { status } : {} })).data,
  createGoal: async (body) => (await api.post('/finance/goals', body)).data,
  updateGoal: async (id, body) => (await api.patch(`/finance/goals/${id}`, body)).data,
  deleteGoal: async (id) => (await api.delete(`/finance/goals/${id}`)).data,
};
