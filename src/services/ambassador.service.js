import api from './api';

const AMBASSADOR_BASE = '/ambassador';

const ambassadorService = {
  // 1. Rejoindre le programme
  joinProgram: async (data) => {
    const response = await api.post(`${AMBASSADOR_BASE}/join`, data);
    return response.data;
  },

  // 2. Profil
  getProfile: async () => {
    const response = await api.get(`${AMBASSADOR_BASE}/profile`);
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.patch(`${AMBASSADOR_BASE}/profile`, data);
    return response.data;
  },

  // 3. Tableau de bord
  getDashboard: async () => {
    const response = await api.get(`${AMBASSADOR_BASE}/dashboard`);
    return response.data;
  },

  // 4. Parrainage
  getReferralLink: async () => {
    const response = await api.get(`${AMBASSADOR_BASE}/referral-link`);
    return response.data;
  },
  getReferrals: async (params = {}) => {
    const response = await api.get(`${AMBASSADOR_BASE}/referrals`, { params });
    return response.data;
  },

  // 5. Commissions
  getCommissions: async (params = {}) => {
    const response = await api.get(`${AMBASSADOR_BASE}/commissions`, { params });
    return response.data;
  },
  getCommissionSummary: async () => {
    const response = await api.get(`${AMBASSADOR_BASE}/commissions/summary`);
    return response.data;
  },

  // 6. Retraits
  getWithdrawals: async (params = {}) => {
    const response = await api.get(`${AMBASSADOR_BASE}/withdrawals`, { params });
    return response.data;
  },
  requestWithdrawal: async (data) => {
    const response = await api.post(`${AMBASSADOR_BASE}/withdrawals`, data);
    return response.data;
  },

  // 7. Administration (réservé aux administrateurs SHALOM)
  adminList: async (params = {}) => {
    const response = await api.get(`${AMBASSADOR_BASE}/admin/list`, { params });
    return response.data;
  },
  adminSetLevel: async (id, level) => {
    const response = await api.patch(`${AMBASSADOR_BASE}/admin/${id}/level`, { level });
    return response.data;
  },
  adminSetStatus: async (id, status) => {
    const response = await api.patch(`${AMBASSADOR_BASE}/admin/${id}/status`, { status });
    return response.data;
  },
  adminListCommissions: async (params = {}) => {
    const response = await api.get(`${AMBASSADOR_BASE}/admin/commissions`, { params });
    return response.data;
  },
  adminApproveCommission: async (id) => {
    const response = await api.patch(`${AMBASSADOR_BASE}/admin/commissions/${id}`);
    return response.data;
  },
  adminListWithdrawals: async (params = {}) => {
    const response = await api.get(`${AMBASSADOR_BASE}/admin/withdrawals`, { params });
    return response.data;
  },
  adminProcessWithdrawal: async (id, body) => {
    const response = await api.patch(`${AMBASSADOR_BASE}/admin/withdrawals/${id}`, body);
    return response.data;
  },
};

export default ambassadorService;
