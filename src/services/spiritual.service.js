import api from './api';

// Module Outils Spirituels — appels vers /api/v1/spiritual.
export const spiritualService = {
  // --- Plans de lecture ---
  listPlans: async () => (await api.get('/spiritual/plans')).data,
  createPlan: async (body) => (await api.post('/spiritual/plans', body)).data,
  getPlan: async (id) => (await api.get(`/spiritual/plans/${id}`)).data,
  addPlanDay: async (id, body) => (await api.post(`/spiritual/plans/${id}/days`, body)).data,
  startPlan: async (id) => (await api.post(`/spiritual/plans/${id}/start`)).data,
  completeDay: async (id, dayNumber) =>
    (await api.post(`/spiritual/plans/${id}/complete-day`, { day_number: dayNumber })).data,
  listLogs: async (id) => (await api.get(`/spiritual/plans/${id}/logs`)).data,
  updateProgress: async (id, status) => (await api.patch(`/spiritual/plans/${id}/progress`, { status })).data,
  listProgress: async () => (await api.get('/spiritual/progress')).data,

  // --- Carnet de prière ---
  listPrayers: async (params = {}) => (await api.get('/spiritual/prayers', { params })).data,
  createPrayer: async (body) => (await api.post('/spiritual/prayers', body)).data,
  updatePrayer: async (id, body) => (await api.patch(`/spiritual/prayers/${id}`, body)).data,
  deletePrayer: async (id) => (await api.delete(`/spiritual/prayers/${id}`)).data,

  // --- Versets ---
  getVerseOfTheDay: async () => (await api.get('/spiritual/verses/today')).data,
  listFavoriteVerses: async () => (await api.get('/spiritual/verses/favorites')).data,
  setVerseFavorite: async (id, isFavorite) =>
    (await api.patch(`/spiritual/verses/${id}/favorite`, { is_favorite: isFavorite })).data,

  // --- Journal ---
  listEntries: async (params = {}) => (await api.get('/spiritual/journal', { params })).data,
  createEntry: async (body) => (await api.post('/spiritual/journal', body)).data,
  updateEntry: async (id, body) => (await api.patch(`/spiritual/journal/${id}`, body)).data,
  deleteEntry: async (id) => (await api.delete(`/spiritual/journal/${id}`)).data,

  // --- Louange ---
  listSongs: async (params = {}) => (await api.get('/spiritual/songs', { params })).data,
  createSong: async (body) => (await api.post('/spiritual/songs', body)).data,
  getSong: async (id) => (await api.get(`/spiritual/songs/${id}`)).data,
  listPlaylists: async () => (await api.get('/spiritual/playlists')).data,
  createPlaylist: async (body) => (await api.post('/spiritual/playlists', body)).data,
  getPlaylist: async (id) => (await api.get(`/spiritual/playlists/${id}`)).data,
  deletePlaylist: async (id) => (await api.delete(`/spiritual/playlists/${id}`)).data,
  addSongToPlaylist: async (id, songId) => (await api.post(`/spiritual/playlists/${id}/songs`, { song_id: songId })).data,
  removeSongFromPlaylist: async (id, songId) => (await api.delete(`/spiritual/playlists/${id}/songs/${songId}`)).data,
};
