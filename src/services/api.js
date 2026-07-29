import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Pages publiques : un visiteur non connecté y déclenche un 401 normal (ex:
// AuthContext.initAuth() qui vérifie "suis-je connecté ?" au montage), ça ne
// doit jamais provoquer de redirection — il y est déjà légitimement.
const PUBLIC_PATHS = ['/login', '/register', '/verify-email'];
const isOnPublicPath = () =>
  typeof window !== 'undefined' && PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));

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

// Coupure réseau/serveur brève (ex: redémarrage du serveur dev) : quelques
// tentatives avant d'abandonner, pour ne pas déconnecter l'utilisateur pour
// un simple aléa transitoire. Un vrai rejet (401 : token invalide/expiré/
// révoqué) échoue immédiatement — le retenter ne changerait rien.
const REFRESH_RETRY_DELAYS_MS = [500, 1000];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const refreshAccessToken = async () => {
  // axios "nu" pour éviter la récursion des intercepteurs
  let lastErr;
  for (let attempt = 0; attempt <= REFRESH_RETRY_DELAYS_MS.length; attempt++) {
    try {
      await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
      return;
    } catch (err) {
      lastErr = err;
      if (err.response?.status === 401) throw err;
      if (attempt < REFRESH_RETRY_DELAYS_MS.length) await sleep(REFRESH_RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastErr;
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
        // Ne déconnecter que si le serveur a explicitement rejeté le refresh
        // token (401 : expiré/révoqué/invalide) — pas sur une erreur réseau
        // ou serveur transitoire (pas de réponse, 5xx), qui ne remet pas en
        // cause la session : on laisse simplement cette requête échouer, la
        // prochaine action de l'utilisateur retentera le refresh normalement.
        const isGenuineAuthFailure = refreshErr.response?.status === 401;
        if (isGenuineAuthFailure && !isOnPublicPath()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
