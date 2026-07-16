import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const metadata = {
  title: 'SHALOM - Connecte, Inspire, Transforme',
  description: 'Plateforme chrétienne francophone pour les jeunes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-theme="light">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
