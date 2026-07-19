'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Feed } from '../../../components/feed/Feed';
import { AdsSidebar } from '../../../components/feed/AdsSidebar';
import { BackButton } from '../../../components/ui/BackButton';
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
      
      <div className={styles.grid}>
        {/* Sidebar */}
        <div className="glass p-md" style={{ borderRadius: 'var(--radius-md)', alignSelf: 'start' }}>
          <h3 className="mb-md">Bienvenue, {user.display_name}</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li className="p-sm" style={{ backgroundColor: 'var(--bg-color-alt)', borderRadius: 'var(--radius-sm)' }}>Fil d'actualité</li>
            <li className="hover-lift">
              <Link href="/camaj" className="p-sm text-muted" style={{ display: 'block' }}>Programme CAMAJ</Link>
            </li>
          </ul>
        </div>
        
        {/* Fil d'actualité */}
        <Feed />

        {/* Espace publicitaire */}
        <AdsSidebar />
      </div>
    </div>
  );
}
