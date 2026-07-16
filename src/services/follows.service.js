import api from './api';

export const followsService = {
  // POST /follows — { followed_id }  (201 nouveau, 200 si déjà suivi)
  follow: async (followedId) => {
    const response = await api.post('/follows', { followed_id: followedId });
    return response.data;
  },

  // DELETE /follows/:followedId
  unfollow: async (followedId) => {
    const response = await api.delete(`/follows/${followedId}`);
    return response.data;
  },

  // GET /follows/user/:userId/followers — { data: { followers: [{ followed_at, profile }], pagination } }
  getFollowers: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await api.get(`/follows/user/${userId}/followers`, { params: { page, limit } });
    return response.data;
  },

  // GET /follows/user/:userId/following — { data: { following: [{ followed_at, profile }], pagination } }
  getFollowing: async (userId, { page = 1, limit = 20 } = {}) => {
    const response = await api.get(`/follows/user/${userId}/following`, { params: { page, limit } });
    return response.data;
  },

  // GET /follows/user/:userId/follow-status — { data: { isFollowing } } (relatif à l'utilisateur connecté)
  getFollowStatus: async (userId) => {
    const response = await api.get(`/follows/user/${userId}/follow-status`);
    return response.data;
  },

  // Compteur d'abonnés / abonnements dérivé du total de pagination (pas d'endpoint dédié)
  getCounts: async (userId) => {
    const [followersRes, followingRes] = await Promise.all([
      api.get(`/follows/user/${userId}/followers`, { params: { page: 1, limit: 1 } }),
      api.get(`/follows/user/${userId}/following`, { params: { page: 1, limit: 1 } }),
    ]);
    return {
      followers: followersRes.data.data.pagination.total_count,
      following: followingRes.data.data.pagination.total_count,
    };
  },
};
