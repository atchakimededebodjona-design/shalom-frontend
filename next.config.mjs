/** @type {import('next').NextConfig} */
const nextConfig = {
  // Autorise l'accès au serveur de dev depuis un appareil du même réseau
  // local (ex: téléphone en Wi-Fi) — sans ça, Next.js bloque les requêtes
  // cross-origin vers ses ressources internes (_next/*), ce qui empêche
  // l'hydratation React de se terminer (page blanche).
  allowedDevOrigins: ['192.168.1.84'],
};

export default nextConfig;
