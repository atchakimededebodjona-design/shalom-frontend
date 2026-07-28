'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Gamepad2, Play, Sparkles, Loader2, Trophy } from 'lucide-react';
import { gamesService } from '../../../services/games.service';
import { ModernCard } from '../../../components/ui/ModernCard';
import styles from './games.module.css';

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

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <Gamepad2 size={40} />
          Espace Jeux
          <Sparkles size={32} style={{ color: 'var(--color-accent)' }} />
        </h1>
        <p className={styles.heroSubtitle}>
          Détendez-vous, apprenez et amusez-vous avec notre sélection de jeux pensés pour vous.
        </p>
      </div>

      {loading && (
        <div className={styles.loadingState}>
          <Loader2 size={48} className="animate-spin" />
          <p>Chargement des jeux...</p>
        </div>
      )}

      {error && (
        <div className="error-card" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <div className={styles.emptyState}>
          <Trophy size={64} style={{ opacity: 0.5, color: 'var(--text-secondary)' }} />
          <h2>Aucun jeu disponible</h2>
          <p>De nouveaux jeux seront ajoutés très bientôt !</p>
        </div>
      )}

      {!loading && !error && games.length > 0 && (
        <div className={styles.grid}>
          {games.map((g) => (
            <ModernCard
              key={g.id}
              className={`${styles.card} hover-lift`}
              style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className={styles.cardContent}>
                  <div className={styles.cardIconWrapper}>
                    <Gamepad2 size={32} />
                  </div>
                  <h3 className={styles.cardTitle}>{g.name}</h3>
                  {g.description && (
                    <p className={styles.cardDescription}>{g.description}</p>
                  )}
                </div>
                
                <div className={styles.cardFooter}>
                  <Link href={`/games/play/${g.id}`} className={styles.playButton}>
                    <Play size={20} fill="currentColor" />
                    Jouer maintenant
                  </Link>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      )}
    </div>
  );
}
