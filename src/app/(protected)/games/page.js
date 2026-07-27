'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Gamepad2, Play } from 'lucide-react';
import { gamesService } from '../../../services/games.service';
import { ModernCard } from '../../../components/ui/ModernCard';
import styles from '../../../components/shared/panel.module.css';

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gamesService.listGames();
      setGames(res.data.games);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les jeux.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;
  if (error) return <p className={styles.errorMsg} role="alert">{error}</p>;

  if (games.length === 0) {
    return (
      <div className={`${styles.card} ${styles.empty}`}>
        <Gamepad2 size={28} style={{ opacity: 0.5 }} />
        <p>Aucun jeu disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {games.map((g) => (
        <ModernCard
          key={g.id}
          className="hover-lift"
          style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column' }}
        >
          <div className={styles.sectionHead}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', margin: 0 }}>{g.name}</h3>
          </div>
          {g.description && (
            <p className="text-sm text-muted" style={{ marginTop: 0 }}>{g.description}</p>
          )}
          <div className={styles.actions} style={{ marginTop: 'auto', paddingTop: 'var(--spacing-md)' }}>
            <Link
              href={`/games/play/${g.id}`}
              className="btn-primary flex items-center justify-center gap-xs"
              style={{ width: '100%', textAlign: 'center', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
            >
              <Play size={16} /> Jouer
            </Link>
          </div>
        </ModernCard>
      ))}
    </div>
  );
}
