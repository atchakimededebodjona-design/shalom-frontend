import api from './api';

export const commentsService = {
  // GET /comments/post/:postId — { success, data: { comments, pagination } }
  getComments: async (postId, { page = 1, limit = 20 } = {}) => {
    const response = await api.get(`/comments/post/${postId}`, { params: { page, limit } });
    return response.data;
  },

  // POST /comments/post/:postId — { content, parent_id? }
  addComment: async (postId, commentData) => {
    const response = await api.post(`/comments/post/${postId}`, commentData);
    return response.data;
  },

  // DELETE /comments/:id (soft delete)
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};
