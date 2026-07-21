// Certaines valeurs déjà enregistrées en base (avatars, photos de couverture,
// médias de publications) sont des chemins relatifs (/uploads/xxx.png) servis
// par le backend, pas par le frontend Next.js — il faut les préfixer avec
// l'origine du backend pour qu'ils se chargent depuis le bon serveur.
// Les nouvelles valeurs sont désormais des URLs absolues (voir uploads.service.js
// côté backend) et traversent cette fonction sans modification.
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

export const resolveMediaUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${BACKEND_ORIGIN}${url}`;
};
