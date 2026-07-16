import api from './api';

export const GROUP_VISIBILITIES = [
  { value: 'public', label: 'Public' },
  { value: 'prive', label: 'Privé' },
  { value: 'sur_invitation', label: 'Sur invitation' },
];

export const VISIBILITY_LABELS = {
  public: 'Public',
  prive: 'Privé',
  sur_invitation: 'Sur invitation',
};

export const ROLE_LABELS = {
  admin: 'Admin',
  moderateur: 'Modérateur',
  membre: 'Membre',
};

export const groupsService = {
  // GET /groups?page=&limit=&search= — uniquement les groupes publics
  list: async ({ page = 1, limit = 20, search } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    const response = await api.get('/groups', { params });
    return response.data;
  },

  // GET /groups/:id
  getById: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  // POST /groups — { name, description?, cover_url?, visibility? }
  create: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  // PATCH /groups/:id (admin)
  update: async (id, fields) => {
    const response = await api.patch(`/groups/${id}`, fields);
    return response.data;
  },

  // DELETE /groups/:id (propriétaire/admin, soft delete)
  remove: async (id) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data;
  },

  // POST /groups/:id/members — rejoindre / demander à rejoindre
  join: async (id) => {
    const response = await api.post(`/groups/${id}/members`);
    return response.data;
  },

  // GET /groups/:id/members — membres actifs uniquement
  getMembers: async (id, { page = 1, limit = 50 } = {}) => {
    const response = await api.get(`/groups/${id}/members`, { params: { page, limit } });
    return response.data;
  },

  // DELETE /groups/:id/members/:userId — retirer un membre / quitter
  removeMember: async (id, userId) => {
    const response = await api.delete(`/groups/${id}/members/${userId}`);
    return response.data;
  },

  // PATCH /groups/:id/members/:userId/role — { role }
  updateMemberRole: async (id, userId, role) => {
    const response = await api.patch(`/groups/${id}/members/${userId}/role`, { role });
    return response.data;
  },

  // PATCH /groups/:id/members/:userId/status — { status: 'actif' | 'refuse' }
  updateMemberStatus: async (id, userId, status) => {
    const response = await api.patch(`/groups/${id}/members/${userId}/status`, { status });
    return response.data;
  },
};
