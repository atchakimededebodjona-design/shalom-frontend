'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trophy } from 'lucide-react';
import { gamesService } from '../../../../services/games.service';
import styles from '../../../../components/shared/panel.module.css';

export default function GamesLeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gamesService.getLeaderboard();
      setEntries(res.data.leaderboard);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger le classement.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;
  if (error) return <p className={styles.errorMsg} role="alert">{error}</p>;

  if (entries.length === 0) {
    return (
      <div className={`${styles.card} ${styles.empty}`}>
        <Trophy size={28} style={{ opacity: 0.5 }} />
        <p>Aucun classement disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.list}>
        {entries.map((e, i) => (
          <div key={e.user_id} className={styles.row}>
            <span className={styles.rowIcon}>{e.rank || i + 1}</span>
            <div className={styles.rowMain}>
              <div className={styles.rowTitle}>{e.display_name || 'Membre'}</div>
              <div className={styles.rowMeta}>{e.total_points} points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
