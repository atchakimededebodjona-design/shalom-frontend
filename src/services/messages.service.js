import api from './api';

export const messagesService = {
  // GET /conversations — inbox (aperçu + non-lus + participants)
  getConversations: async ({ page = 1, limit = 20 } = {}) => {
    const response = await api.get('/conversations', { params: { page, limit } });
    return response.data;
  },

  // POST /conversations — { participant_ids: [uuid], is_group? }
  // Pour un 1-à-1 : participant_ids = [autreUserId] (l'appelant est ajouté auto).
  // Renvoie { conversation_id, is_new, conversation? } — dédoublonne les 1-à-1 existants.
  createConversation: async (participantIds, isGroup = false) => {
    const response = await api.post('/conversations', {
      participant_ids: participantIds,
      is_group: isGroup,
    });
    return response.data;
  },

  // GET /conversations/:id — détail (participants) → { data: { conversation: { id, is_group, other_participants } } }
  getConversation: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  // GET /conversations/:id/messages — messages triés du plus récent au plus ancien
  getMessages: async (conversationId, { page = 1, limit = 30 } = {}) => {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  // POST /conversations/:id/messages — { content?, media_url? } (au moins l'un des deux)
  sendMessage: async (conversationId, { content, media_url } = {}) => {
    const body = {};
    if (content) body.content = content;
    if (media_url) body.media_url = media_url;
    const response = await api.post(`/conversations/${conversationId}/messages`, body);
    return response.data;
  },

  // PATCH /conversations/:id/read — marque comme lus les messages reçus
  markAsRead: async (conversationId) => {
    const response = await api.patch(`/conversations/${conversationId}/read`);
    return response.data;
  },
};
