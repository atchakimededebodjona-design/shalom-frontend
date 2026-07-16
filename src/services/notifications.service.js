import api from './api';

export const notificationsService = {
  // GET /notifications?page=&limit=
  // Réponse : { data: { notifications, pagination: { total, page, limit, pages } } }
  // (⚠️ pagination non standard : total/page/limit/pages)
  list: async ({ page = 1, limit = 20 } = {}) => {
    const response = await api.get('/notifications', { params: { page, limit } });
    return response.data;
  },

  // GET /notifications/unread-count → { data: { unread_count } }
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // PATCH /notifications/:id/read
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // PATCH /notifications/read-all
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};
