'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { BackButton } from '../../../components/ui/BackButton';
import styles from '../../../components/shared/panel.module.css';

const TABS = [
  { href: '/tools', label: 'Dîme' },
  { href: '/tools/events', label: 'Événements' },
  { href: '/tools/tasks', label: 'Tâches' },
  { href: '/tools/converter', label: 'Convertisseur' },
];

export default function ToolsLayout({ children }) {
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
      <div className="mb-md"><BackButton fallbackHref="/dashboard" /></div>
      <h1 className="text-primary flex items-center gap-sm mb-md">
        <Wrench size={26} /> Outils pratiques
      </h1>
      <nav className={styles.tabs}>
        {TABS.map((t) => {
          const active = t.href === '/tools' ? pathname === '/tools' : pathname.startsWith(t.href);
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
