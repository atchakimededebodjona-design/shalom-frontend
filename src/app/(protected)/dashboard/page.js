'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Feed } from '../../../components/feed/Feed';
import { BackButton } from '../../../components/ui/BackButton';

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
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 'var(--spacing-lg)' }}>
        {/* Sidebar */}
        <div className="glass p-md" style={{ borderRadius: 'var(--radius-md)', alignSelf: 'start' }}>
          <h3 className="mb-md">Bienvenue, {user.display_name}</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li className="p-sm" style={{ backgroundColor: 'var(--bg-color-alt)', borderRadius: 'var(--radius-sm)' }}>Fil d'actualité</li>
            <li className="hover-lift">
              <Link href="/camaj" className="p-sm text-muted" style={{ display: 'block' }}>Programme CAMAJ</Link>
            </li>
            <li className="hover-lift">
              <Link href="/community" className="p-sm text-muted" style={{ display: 'block' }}>Communauté</Link>
            </li>
            <li className="hover-lift">
              <Link href="/spiritual" className="p-sm text-muted" style={{ display: 'block' }}>Outils Spirituels</Link>
            </li>
            <li className="hover-lift">
              <Link href="/finance" className="p-sm text-muted" style={{ display: 'block' }}>Gestion Financière</Link>
            </li>
            <li className="hover-lift">
              <Link href="/wallet" className="p-sm text-muted" style={{ display: 'block' }}>Portefeuille</Link>
            </li>
            <li className="hover-lift">
              <Link href="/tools" className="p-sm text-muted" style={{ display: 'block' }}>Outils pratiques</Link>
            </li>
          </ul>
        </div>
        
        {/* Fil d'actualité */}
        <Feed />
      </div>
    </div>
  );
}
