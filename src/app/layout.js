import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ServiceWorkerRegister } from '../components/pwa/ServiceWorkerRegister';

export const metadata = {
  title: 'SHALOM - Connecte, Inspire, Transforme',
  description: 'Plateforme chrétienne francophone pour les jeunes',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SHALOM',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: '#C2982F',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-theme="light">
      <body>
        <ServiceWorkerRegister />
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
