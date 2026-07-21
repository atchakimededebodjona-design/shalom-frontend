import api from './api';

// Types de posts valides côté backend (ENUM SQL post_type)
export const POST_TYPES = ['texte', 'image', 'video', 'temoignage', 'priere', 'annonce'];

export const postsService = {
  // GET /posts — fil d'actualité paginé (ou fil d'un groupe si groupId fourni)
  // Réponse : { success, data: { posts, pagination } }
  getFeed: async ({ page = 1, limit = 20, groupId } = {}) => {
    const params = { page, limit };
    if (groupId) params.group_id = groupId;
    const response = await api.get('/posts', { params });
    return response.data;
  },

  // GET /posts/:id
  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // POST /posts — { content, type?, media_url?, group_id? }
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // PATCH /posts/:id — { content?, media_url? }
  updatePost: async (id, updateData) => {
    const response = await api.patch(`/posts/${id}`, updateData);
    return response.data;
  },

  // DELETE /posts/:id (soft delete)
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};
