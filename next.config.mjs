// Origines des médias servis par le backend (avatars, posts, jeux...) — voir
// resolveMediaUrl.js. En production, BACKEND_ORIGINS doit être défini (liste
// séparée par des virgules) sinon le build pointerait vers localhost.
const BACKEND_ORIGINS = (process.env.BACKEND_ORIGINS || 'http://localhost:5000,http://192.168.1.73:5000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const primaryBackendOrigin = BACKEND_ORIGINS[0];

const isDev = process.env.NODE_ENV !== 'production';

const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' requis par le payload d'hydratation RSC de Next.js et par
  // les styles inline (style={{}}) utilisés dans tout le projet — une CSP
  // stricte à base de nonce réduirait encore la surface mais est hors scope
  // de ce correctif (n'empêche pas un XSS déjà injecté d'utiliser du inline).
  // 'unsafe-eval' en plus en dev uniquement : outils de debug React (jamais
  // utilisé par React en production, cf. avertissement console à ce sujet).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://res.cloudinary.com ${BACKEND_ORIGINS.join(' ')}`,
  `media-src 'self' blob: ${BACKEND_ORIGINS.join(' ')}`,
  `connect-src 'self' ${BACKEND_ORIGINS.join(' ')} ws://localhost:3000 ws://192.168.1.73:3000`,
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Autorise l'accès en dev depuis un autre appareil du réseau local (ex: test mobile)
  allowedDevOrigins: ['192.168.1.73', '192.168.1.70'],
  images: {
    // Hôtes explicites uniquement (pas de wildcard '**') : le endpoint
    // d'optimisation d'image de Next.js (/_next/image?url=...) proxie ce
    // qu'on l'autorise à charger — un wildcard ouvre un SSRF vers le réseau
    // interne une fois le site en ligne.
    remotePatterns: [
      ...BACKEND_ORIGINS.map((origin) => {
        const url = new URL(origin);
        return { protocol: url.protocol.replace(':', ''), hostname: url.hostname, port: url.port };
      }),
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${primaryBackendOrigin}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${primaryBackendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
