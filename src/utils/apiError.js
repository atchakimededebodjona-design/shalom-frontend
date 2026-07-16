// Extrait un message lisible depuis une erreur axios/backend.
// Format backend : { success:false, error, code, details?: [{ field, message }] }
export const getApiError = (err, fallback = 'Une erreur est survenue') => {
  const data = err?.response?.data;
  if (!data) {
    // Pas de réponse serveur (réseau, CORS, backend éteint…)
    return err?.message === 'Network Error'
      ? 'Impossible de joindre le serveur'
      : fallback;
  }
  if (Array.isArray(data.details) && data.details.length > 0) {
    return data.details[0].message;
  }
  return data.error || data.message || fallback;
};
