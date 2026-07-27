import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// withCredentials : les cookies httpOnly access_token/refresh_token posés par
// le backend (voir auth.controller.js) doivent être envoyés automatiquement
// par le navigateur — l'app ne les lit/gère plus jamais elle-même en JS.
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Rafraîchissement automatique du token sur 401 ---
// Une seule requête de refresh partagée entre tous les appels concurrents.
// Le refresh_token httpOnly est envoyé automatiquement par le navigateur ;
// la réponse pose les nouveaux cookies via Set-Cookie, rien à stocker ici.
let refreshPromise = null;

const refreshAccessToken = async () => {
  // axios "nu" pour éviter la récursion des intercepteurs
  await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/auth/');

    // 401 sur une route protégée → on tente un refresh une seule fois
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
        return api(original); // rejoue la requête d'origine (nouveau cookie déjà posé)
      } catch (refreshErr) {
        // Refresh impossible → session terminée
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
