'use client';

import { useEffect, useState, useCallback } from 'react';
import { CalendarCheck, Trophy } from 'lucide-react';
import { gamesService } from '../../../../services/games.service';
import { QuizPlayer } from '../../../../components/games/QuizPlayer';
import { ModernCard } from '../../../../components/ui/ModernCard';
import { Button } from '../../../../components/ui/Button';
import styles from '../../../../components/shared/panel.module.css';

export default function DailyChallengePage() {
  const [challenge, setChallenge] = useState(null);
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gamesService.getDailyChallenge();
      setChallenge(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger le défi du jour.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const start = async () => {
    setStarting(true);
    setError('');
    try {
      const res = await gamesService.startDailyChallenge();
      setSession(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de démarrer le défi.');
      load(); // resynchronise l'état (ex: déjà complété entre-temps)
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;

  if (summary) {
    return (
      <ModernCard style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <Trophy size={40} color="var(--primary)" style={{ marginBottom: 'var(--spacing-md)' }} />
        <h2 style={{ marginTop: 0 }}>Défi du jour terminé !</h2>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{summary.score} points</p>
        <p className="text-sm text-muted">
          +{summary.xpGained} XP{summary.dailyBonus ? ` (dont ${summary.dailyBonus} bonus quotidien)` : ''} · Niveau {summary.level}
        </p>
      </ModernCard>
    );
  }

  if (session) {
    return <QuizPlayer session={session} onFinished={setSummary} />;
  }

  return (
    <ModernCard style={{ padding: 'var(--spacing-xl)' }}>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-md)' }}>
        <CalendarCheck size={28} color="var(--primary)" />
        <h2 style={{ margin: 0 }}>Défi du jour</h2>
      </div>
      {challenge?.game && (
        <p className="text-sm text-muted">
          Aujourd'hui : {challenge.game.name} · {challenge.questionCount} questions · +{challenge.rewardXp} XP bonus
        </p>
      )}
      {challenge?.completed ? (
        <span className={`${styles.badge} ${styles.badgeOk}`}>Déjà complété aujourd'hui — reviens demain !</span>
      ) : (
        <Button onClick={start} isLoading={starting}>Relever le défi</Button>
      )}
    </ModernCard>
  );
}
