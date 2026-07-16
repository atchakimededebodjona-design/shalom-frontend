'use client';

import { usePathname } from 'next/navigation';

// Pages sans chrome (plein écran)
const BARE_ROUTES = ['/login', '/register'];

export const Footer = () => {
  const pathname = usePathname();
  if (BARE_ROUTES.includes(pathname)) return null;

  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', padding: '2rem 0', textAlign: 'center' }}>
      <div className="container">
        <p className="text-muted">© {new Date().getFullYear()} SHALOM. Tous droits réservés.</p>
        <p className="text-muted text-sm mt-sm">Connecte, Inspire, Transforme.</p>
      </div>
    </footer>
  );
};
