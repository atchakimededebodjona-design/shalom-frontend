import api from './api';

// Module Jeux — appels vers /api/v1/games.
// Chaque méthode renvoie response.data ({ success, data }).
export const gamesService = {
  listGames: async () => (await api.get('/games')).data,
  startSession: async (body) => (await api.post('/games/sessions', body)).data,
  submitAnswer: async (sessionId, body) => (await api.post(`/games/sessions/${sessionId}/answers`, body)).data,
  endSession: async (sessionId) => (await api.post(`/games/sessions/${sessionId}/end`)).data,
  getLeaderboard: async (params = {}) => (await api.get('/games/leaderboard', { params })).data,

  // --- Duels ("Bataille Biblique") ---
  createDuel: async (body) => (await api.post('/games/duels', body)).data,
  joinDuel: async (duelId) => (await api.post(`/games/duels/${duelId}/join`)).data,
  getDuel: async (duelId) => (await api.get(`/games/duels/${duelId}`)).data,
  listOpenDuels: async (params = {}) => (await api.get('/games/duels', { params: { ...params, open: true } })).data,
  listMyDuels: async (params = {}) => (await api.get('/games/duels', { params })).data,

  // --- Défi quotidien ---
  getDailyChallenge: async () => (await api.get('/games/daily')).data,
  startDailyChallenge: async () => (await api.post('/games/daily/start')).data,
};
