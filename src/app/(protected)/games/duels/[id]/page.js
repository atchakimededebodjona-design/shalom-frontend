'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Swords, Trophy } from 'lucide-react';
import { gamesService } from '../../../../../services/games.service';
import { ModernCard } from '../../../../../components/ui/ModernCard';
import { Button } from '../../../../../components/ui/Button';
import { useAuth } from '../../../../../contexts/AuthContext';
import styles from '../../../../../components/shared/panel.module.css';

const STATUS_LABEL = {
  waiting: "En attente d'un adversaire",
  active: 'En cours — en attente que les deux joueurs terminent',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function DuelDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [duel, setDuel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const res = await gamesService.getDuel(id);
      setDuel(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger ce duel.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;
  if (error) return <p className={styles.errorMsg} role="alert">{error}</p>;
  if (!duel) return null;

  const isPlayerOne = duel.playerOneId === user?.id;
  const myScore = isPlayerOne ? duel.playerOneScore : duel.playerTwoScore;
  const opponentScore = isPlayerOne ? duel.playerTwoScore : duel.playerOneScore;
  const iWon = !!duel.winnerId && duel.winnerId === user?.id;
  const isDraw = duel.status === 'completed' && !duel.winnerId;

  return (
    <ModernCard style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
      <Swords size={32} color="var(--primary)" style={{ marginBottom: 'var(--spacing-md)' }} />
      <p className="text-sm text-muted" style={{ marginTop: 0 }}>{STATUS_LABEL[duel.status] || duel.status}</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-xl)', margin: 'var(--spacing-lg) 0' }}>
        <div>
          <div className="text-sm text-muted">Vous</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{myScore ?? '—'}</div>
        </div>
        <div style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>vs</div>
        <div>
          <div className="text-sm text-muted">Adversaire</div>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{duel.playerTwoId ? (opponentScore ?? '—') : '?'}</div>
        </div>
      </div>

      {duel.status === 'completed' && (
        <p style={{ fontWeight: 700, color: iWon ? '#1f9d55' : isDraw ? 'inherit' : '#d1495b' }}>
          {isDraw ? (
            'Match nul !'
          ) : iWon ? (
            <span className="flex items-center justify-center gap-xs"><Trophy size={18} /> Vous avez gagné !</span>
          ) : (
            'Vous avez perdu.'
          )}
        </p>
      )}

      {duel.status !== 'completed' && (
        <Button onClick={() => load(true)} isLoading={refreshing} variant="secondary">Actualiser</Button>
      )}
    </ModernCard>
  );
}
