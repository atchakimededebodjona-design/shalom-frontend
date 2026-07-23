'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import styles from '../../../components/shared/panel.module.css';

const TABS = [
  { href: '/community', label: 'Annuaire' },
  { href: '/community/events', label: 'Événements' },
  { href: '/community/prayers', label: 'Prières' },
  { href: '/community/announcements', label: 'Annonces' },
];

export default function CommunityLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className={`container animate-fade-in ${styles.theme}`} style={{ padding: 'var(--spacing-xl) 0' }}>
      <PageHeader 
        title="Communauté" 
        description="Connectez-vous avec vos frères et sœurs en Christ."
        showBack={true}
        fallbackHref="/dashboard"
      />
      <nav className={styles.tabs}>
        {TABS.map((t) => {
          const active = t.href === '/community' ? pathname === '/community' : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={`${styles.tab} ${active ? styles.tabActive : ''}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
