'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Feed } from '../../../components/feed/Feed';
import { BackButton } from '../../../components/ui/BackButton';
import { AdBanner } from '../../../components/ads/AdBanner';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}><div className="animate-pulse">Chargement...</div></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md">
        <BackButton fallbackHref="/" />
      </div>
      <h1 className="text-primary mb-lg">Tableau de bord</h1>

      {/* Espace publicitaire — défile de la droite vers la gauche */}
      <div className="mb-lg">
        <AdBanner />
      </div>

      <div className={styles.layout}>
        {/* Sidebar — le reste de la navigation est déjà dans le menu du haut */}
        <aside className={`glass ${styles.sidebar}`}>
          <h3 className={styles.welcome}>Bienvenue, {user.display_name}</h3>
          <nav className={styles.nav} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <span className={`${styles.navItem} ${styles.navItemActive}`}>Fil d'actualité</span>
            <Link
              href="/camaj"
              className={styles.camajLink}
              title="Programme CAMAJ"
              aria-label="Programme CAMAJ"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}
            >
              <img
                src="/camaj-logo.png"
                alt="CAMAJ"
                className={styles.camajLogo}
                style={{ height: '1.9rem', width: 'auto', display: 'block' }}
              />
            </Link>
          </nav>
        </aside>

        {/* Fil d'actualité */}
        <div className={styles.feed}>
          <Feed />
        </div>
      </div>
    </div>
  );
}