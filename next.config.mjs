import os from 'node:os';

// IPv4 LAN du PC, détectées automatiquement au démarrage du serveur de dev.
// C'est l'origine que présente le téléphone quand il ouvre http://<IP-du-PC>:3000,
// donc l'auto-détection colle toujours à l'IP courante — plus aucune IP en dur,
// quel que soit le réseau ou la machine.
function lanOrigins() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      // Node ≥18 renvoie 'IPv4' (string) ; certaines versions renvoyaient 4.
      const isIPv4 = net.family === 'IPv4' || net.family === 4;
      if (isIPv4 && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

// Origines supplémentaires éventuelles (hostname mDNS, reverse proxy, etc.),
// via DEV_ORIGINS="host1,host2" — optionnel.
const extraOrigins = (process.env.DEV_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Backend visé par le proxy de dev. Surchargeable par BACKEND_URL (utile en prod
// où le backend n'est pas sur localhost) ; défaut = backend Express local.
const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Origines autorisées à accéder aux ressources internes du serveur de dev
  // (_next/*) depuis un autre appareil du même réseau (téléphone en Wi-Fi).
  // Sans l'IP LAN du PC, Next 16 bloque ces requêtes cross-origin, l'hydratation
  // React échoue et le JS de l'app ne s'exécute pas (les appels API ne partent jamais).
  allowedDevOrigins: [...new Set([...lanOrigins(), ...extraOrigins])],

  // Proxy même-origine pour le test mobile : l'app appelle /api/v1 et /uploads
  // sur SA propre origine (port 3000), et Next relaie vers le backend. Conséquence :
  // le téléphone n'a besoin que du port 3000 — plus besoin d'ouvrir le port backend
  // dans le pare-feu, ni de CORS.
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${backendUrl}/api/v1/:path*` },
      { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
