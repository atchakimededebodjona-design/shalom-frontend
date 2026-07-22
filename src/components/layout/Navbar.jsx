'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShieldCheck, Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { NotificationBell } from '../notifications/NotificationBell';
import styles from './Navbar.module.css';

// Pages sans chrome (plein écran)
const BARE_ROUTES = ['/login', '/register'];

// Liens principaux (connecté). `icon` optionnel.
const LIENS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/groups', label: 'Groupes' },
  { href: '/community', label: 'Communauté' },
  { href: '/spiritual', label: 'Spirituel' },
  { href: '/finance', label: 'Finances' },
  { href: '/wallet', label: 'Portefeuille' },
  { href: '/tools', label: 'Outils' },
  { href: '/shalom-tv', label: 'Shalom TV' },
  { href: '/profile', label: 'Profil' },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);

  // Ferme le menu mobile à chaque changement de page.
  useEffect(() => {
    setMenuOuvert(false);
  }, [pathname]);

  // Ferme le menu sur Échap.
  useEffect(() => {
    if (!menuOuvert) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOuvert(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOuvert]);

  if (BARE_ROUTES.includes(pathname)) return null;

  const fermer = () => setMenuOuvert(false);

  return (
    <nav className={`glass ${styles.bar}`}>
      <div className="container">
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} onClick={fermer} aria-label="Accueil SHALOM">
            <img src="/icons/icon-192.png" alt="" className={styles.brandLogo} />
            SHALOM
          </Link>

          {user ? (
            <div className={styles.right}>
              {/* Liens bureau */}
              <div className={styles.desktopLinks}>
                {LIENS.map(({ href, label }) => (
                  <Link key={href} href={href} className="nav-link" style={{ fontWeight: 'bold' }}>
                    {label}
                  </Link>
                ))}
                {user.is_admin && (
                  <Link
                    href="/admin"
                    className="nav-link flex items-center gap-xs"
                    style={{ fontWeight: 'bold', color: 'var(--primary)' }}
                    title="Espace administrateur"
                  >
                    <ShieldCheck size={16} /> Admin
                  </Link>
                )}
              </div>

              {/* Icônes d'accès rapide + cloche : visibles dans les deux dispositions */}
              <div className={styles.icons}>
                <Link href="/messages" aria-label="Messages" title="Messages" className={styles.iconLink}>
                  <MessageSquare size={20} />
                </Link>
                <Link href="/search" aria-label="Rechercher des membres" title="Rechercher des membres" className={styles.iconLink}>
                  <Search size={20} />
                </Link>
                <Link href="/camaj" aria-label="Programme CAMAJ" title="Programme CAMAJ" className={styles.iconLink}>
                  <img src="/camaj-logo.png" alt="CAMAJ" className={styles.camajLogo} />
                </Link>
                <NotificationBell />
              </div>

              {/* Déconnexion (bureau) */}
              <span className={styles.desktopOnly}>
                <Button onClick={logout} variant="secondary">Déconnexion</Button>
              </span>

              {/* Hamburger (mobile) */}
              <button
                type="button"
                className={styles.burger}
                onClick={() => setMenuOuvert((o) => !o)}
                aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={menuOuvert}
                aria-controls="menu-mobile"
              >
                {menuOuvert ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          ) : (
            <div className={styles.right}>
              <Link href="/login"><Button variant="primary">Connexion</Button></Link>
              <Link href="/register"><Button variant="primary">Inscription</Button></Link>
            </div>
          )}
        </div>

        {/* Panneau déroulant mobile (connecté) */}
        {user && menuOuvert && (
          <div id="menu-mobile" className={styles.mobilePanel}>
            <Link href="/search" className={styles.mobileLink} onClick={fermer}>
              <Search size={18} /> Rechercher
            </Link>
            {LIENS.map(({ href, label }) => (
              <Link key={href} href={href} className={styles.mobileLink} onClick={fermer}>
                {label}
              </Link>
            ))}
            {user.is_admin && (
              <Link
                href="/admin"
                className={`${styles.mobileLink} ${styles.mobileLinkAdmin}`}
                onClick={fermer}
              >
                <ShieldCheck size={18} /> Admin
              </Link>
            )}
            <div className={styles.mobileDivider} />
            <Button
              variant="secondary"
              onClick={() => { fermer(); logout(); }}
              style={{ width: '100%' }}
            >
              Déconnexion
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};