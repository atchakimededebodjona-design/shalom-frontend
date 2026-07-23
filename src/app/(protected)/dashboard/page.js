'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Feed } from '../../../components/feed/Feed';
import { PageHeader } from '../../../components/ui/PageHeader';
import { ModernCard } from '../../../components/ui/ModernCard';
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
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--bg-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <PageHeader 
        title="Tableau de bord" 
        description={`Content de vous revoir, ${user.display_name}. Voici votre actualité.`}
        showBack={true} 
      />

      <div className="mb-lg">
        <AdBanner />
      </div>

      <div className={styles.layout}>
        <aside>
          <ModernCard variant="glass" className={styles.sidebar}>
            <h3 className={styles.welcome}>Navigation rapide</h3>
            <nav className={styles.nav}>
              <Link href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>
                Fil d'actualité
              </Link>
              <Link href="/groups" className={styles.navItem}>
                Groupes
              </Link>
              <Link href="/events" className={styles.navItem}>
                Évènements
              </Link>
              <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', justifyContent: 'center' }}>
                <Link href="/camaj" aria-label="Programme CAMAJ" title="Programme CAMAJ">
                  <img src="/camaj-logo.png" alt="Programme CAMAJ" className={styles.camajLogo} />
                </Link>
              </div>
            </nav>
          </ModernCard>
        </aside>

        <div className={styles.feed}>
          <Feed />
        </div>
      </div>
    </div>
  );
}