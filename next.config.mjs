/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Autorise l'accès en dev depuis un autre appareil du réseau local (ex: test mobile)
  allowedDevOrigins: ['192.168.1.84'],
  images: {
    domains: ['localhost', '192.168.1.84', 'res.cloudinary.com', 'aws-0-eu-west-1.pooler.supabase.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5000/api/v1/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
