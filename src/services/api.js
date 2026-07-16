import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Gestion centralisée des tokens (cookies) ---
export const setTokens = ({ access_token, refresh_token } = {}) => {
  if (access_token) Cookies.set('token', access_token, { expires: 7 });
  if (refresh_token) Cookies.set('refresh_token', refresh_token, { expires: 7 });
};

export const clearTokens = () => {
  Cookies.remove('token');
  Cookies.remove('refresh_token');
};

// Interceptor requête : ajoute le token JWT à chaque appel
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Rafraîchissement automatique du token sur 401 ---
// Une seule requête de refresh partagée entre tous les appels concurrents.
let refreshPromise = null;

const refreshAccessToken = async () => {
  const refresh_token = Cookies.get('refresh_token');
  if (!refresh_token) throw new Error('NO_REFRESH_TOKEN');

  // axios "nu" pour éviter la récursion des intercepteurs
  const resp = await axios.post(`${API_URL}/auth/refresh`, { refresh_token });
  const tokens = resp.data.data.tokens; // rotation : nouveaux access + refresh
  setTokens(tokens);
  return tokens.access_token;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = original?.url?.includes('/auth/');

    // 401 sur une route protégée → on tente un refresh une seule fois
    if (status === 401 && original && !original._retry && !isAuthEndpoint && Cookies.get('refresh_token')) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original); // rejoue la requête d'origine
      } catch (refreshErr) {
        // Refresh impossible → session terminée
        clearTokens();
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
