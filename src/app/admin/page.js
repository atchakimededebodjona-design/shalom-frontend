'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, Flag, Inbox, Tv, Megaphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './admin.module.css';

// Espace administrateur — hub reliant les différentes sections de modération.
export default function AdminHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.state}>Chargement…</div>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className={styles.denied}>
        <ShieldAlert size={40} className={styles.deniedIcon} />
        <h1 className="text-primary">Accès réservé</h1>
        <p className="text-muted">Cet espace est réservé aux administrateurs de SHALOM.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} animate-fade-in`}>
      <div className={styles.head}>
        <ShieldCheck size={26} color="var(--primary)" />
        <h1 className="text-primary">Espace administrateur</h1>
      </div>
      <p className={styles.subtitle}>Modération et gestion des demandes reçues sur la plateforme.</p>

      <div className={styles.grid}>
        <Link href="/admin/reports" className={styles.card}>
          <Flag size={24} className={styles.cardIcon} />
          <span className={styles.cardTitle}>Signalements</span>
          <span className={styles.cardDesc}>Traiter les publications et commentaires signalés par les membres.</span>
        </Link>

        <Link href="/camaj/admin" className={styles.card}>
          <Inbox size={24} className={styles.cardIcon} />
          <span className={styles.cardTitle}>Demandes CAMAJ</span>
          <span className={styles.cardDesc}>Mentorat, programmes, dons, projets FAJ, relation d'aide.</span>
        </Link>

        <Link href="/admin/shalom-tv" className={styles.card}>
          <Tv size={24} className={styles.cardIcon} />
          <span className={styles.cardTitle}>Shalom TV</span>
          <span className={styles.cardDesc}>Ajouter et gérer les vidéos, podcasts, articles et photos.</span>
        </Link>

        <Link href="/admin/publicites" className={styles.card}>
          <Megaphone size={24} className={styles.cardIcon} />
          <span className={styles.cardTitle}>Publicités</span>
          <span className={styles.cardDesc}>Gérer l&apos;espace publicitaire affiché sur le fil d&apos;actualité.</span>
        </Link>
      </div>
    </div>
  );
}
