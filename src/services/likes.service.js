import api from './api';

// Le backend attend { likeable_type: 'post' | 'comment', likeable_id }
export const likesService = {
  // POST /likes — 201 si ajouté, 409 si déjà liké
  addLike: async (likeableType, likeableId) => {
    const response = await api.post('/likes', {
      likeable_type: likeableType,
      likeable_id: likeableId,
    });
    return response.data;
  },

  // DELETE /likes — axios envoie le body via la clé `data`
  removeLike: async (likeableType, likeableId) => {
    const response = await api.delete('/likes', {
      data: { likeable_type: likeableType, likeable_id: likeableId },
    });
    return response.data;
  },
};
