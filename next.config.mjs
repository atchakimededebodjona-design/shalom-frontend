/** @type {import('next').NextConfig} */
const nextConfig = {
  // Origines autorisées à accéder aux ressources internes du serveur de dev
  // (_next/*) depuis un autre appareil du même réseau (téléphone en Wi-Fi).
  // DOIT contenir l'IP LAN actuelle du PC — sinon Next 16 bloque ces requêtes
  // cross-origin, l'hydratation React échoue et le JS de l'app ne s'exécute pas
  // (les appels API ne partent jamais).
  allowedDevOrigins: ['192.168.1.95', '192.168.137.1', '192.168.1.84'],

  // Proxy même-origine pour le test mobile : l'app appelle /api/v1 et /uploads
  // sur SA propre origine (port 3000), et Next relaie vers le backend Express
  // (port 5000). Conséquence : le téléphone n'a besoin que du port 3000 — plus
  // besoin d'ouvrir le port 5000 dans le pare-feu, ni de CORS.
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: 'http://localhost:5000/api/v1/:path*' },
      { source: '/uploads/:path*', destination: 'http://localhost:5000/uploads/:path*' },
    ];
  },
};

export default nextConfig;
