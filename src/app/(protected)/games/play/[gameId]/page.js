'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { gamesService } from '../../../../../services/games.service';
import { QuizPlayer } from '../../../../../components/games/QuizPlayer';
import { ModernCard } from '../../../../../components/ui/ModernCard';
import { Button } from '../../../../../components/ui/Button';
import styles from '../../../../../components/shared/panel.module.css';

export default function PlayGamePage() {
  const { gameId } = useParams();
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const start = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gamesService.startSession({ gameId });
      setSession(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de démarrer la partie.');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => { start(); }, [start]);

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;
  if (error) return <p className={styles.errorMsg} role="alert">{error}</p>;

  if (summary) {
    return (
      <ModernCard style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <Trophy size={40} color="var(--primary)" style={{ marginBottom: 'var(--spacing-md)' }} />
        <h2 style={{ marginTop: 0 }}>Partie terminée !</h2>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{summary.score} points</p>
        <p className="text-sm text-muted">+{summary.xpGained} XP · Niveau {summary.level}</p>
        <div className={styles.actions} style={{ justifyContent: 'center', marginTop: 'var(--spacing-lg)' }}>
          <Button onClick={() => router.push('/games')}>Retour aux jeux</Button>
        </div>
      </ModernCard>
    );
  }

  if (!session) return null;

  return <QuizPlayer session={session} onFinished={setSummary} />;
}
