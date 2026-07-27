'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Users, Swords, Trophy } from 'lucide-react';
import { gamesService } from '../../../../services/games.service';
import { QuizPlayer } from '../../../../components/games/QuizPlayer';
import { ModernCard } from '../../../../components/ui/ModernCard';
import { Button } from '../../../../components/ui/Button';
import styles from '../../../../components/shared/panel.module.css';

const DUEL_STATUS_LABEL = {
  waiting: "En attente d'un adversaire",
  active: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function DuelsLobbyPage() {
  const [games, setGames] = useState([]);
  const [openDuels, setOpenDuels] = useState([]);
  const [myDuels, setMyDuels] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState('');

  const [activeDuelId, setActiveDuelId] = useState(null);
  const [session, setSession] = useState(null);
  const [summary, setSummary] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [g, open, mine] = await Promise.all([
        gamesService.listGames(),
        gamesService.listOpenDuels(),
        gamesService.listMyDuels(),
      ]);
      setGames(g.data.games);
      setOpenDuels(open.data.duels);
      setMyDuels(mine.data.duels);
      if (!selectedGameId && g.data.games.length > 0) setSelectedGameId(g.data.games[0].id);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les duels.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!selectedGameId) return;
    setCreating(true);
    setError('');
    try {
      const res = await gamesService.createDuel({ gameId: selectedGameId });
      setActiveDuelId(res.data.duelId);
      setSession(res.data.session);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de créer le duel.');
    } finally {
      setCreating(false);
    }
  };

  const join = async (duelId) => {
    setJoiningId(duelId);
    setError('');
    try {
      const res = await gamesService.joinDuel(duelId);
      setActiveDuelId(duelId);
      setSession(res.data.session);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de rejoindre ce duel.');
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;

  if (summary) {
    return (
      <ModernCard style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <Trophy size={40} color="var(--primary)" style={{ marginBottom: 'var(--spacing-md)' }} />
        <h2 style={{ marginTop: 0 }}>Manche terminée !</h2>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{summary.score} points</p>
        <p className="text-sm text-muted">+{summary.xpGained} XP · Niveau {summary.level}</p>
        <div className={styles.actions} style={{ justifyContent: 'center', marginTop: 'var(--spacing-lg)' }}>
          <Link
            href={`/games/duels/${activeDuelId}`}
            className="btn-primary"
            style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)' }}
          >
            Voir le résultat du duel
          </Link>
        </div>
      </ModernCard>
    );
  }

  if (session) {
    return <QuizPlayer session={session} onFinished={setSummary} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <ModernCard style={{ padding: 'var(--spacing-lg)' }}>
        <div className={styles.sectionHead}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> Créer un duel
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className={styles.select} value={selectedGameId} onChange={(e) => setSelectedGameId(e.target.value)}>
            {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <Button onClick={create} isLoading={creating}>Lancer le défi</Button>
        </div>
      </ModernCard>

      <div>
        <div className={styles.sectionHead}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Duels en attente d'un adversaire
          </h3>
        </div>
        {openDuels.length === 0 ? (
          <p className="text-sm text-muted">Aucun duel ouvert pour le moment.</p>
        ) : (
          <div className={styles.list}>
            {openDuels.map((d) => (
              <div key={d.id} className={styles.row}>
                <span className={styles.rowIcon}><Swords size={18} /></span>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{d.game_name}</div>
                  <div className={styles.rowMeta}>Défié par {d.player_one_name}</div>
                </div>
                <div className={styles.rowActions}>
                  <Button onClick={() => join(d.id)} isLoading={joiningId === d.id} variant="secondary">Rejoindre</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className={styles.sectionHead}>
          <h3 style={{ margin: 0 }}>Mes duels</h3>
        </div>
        {myDuels.length === 0 ? (
          <p className="text-sm text-muted">Vous n'avez pas encore de duel.</p>
        ) : (
          <div className={styles.list}>
            {myDuels.map((d) => (
              <Link key={d.id} href={`/games/duels/${d.id}`} className={styles.row} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className={styles.rowIcon}><Swords size={18} /></span>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{d.game_name}</div>
                  <div className={styles.rowMeta}>{DUEL_STATUS_LABEL[d.status] || d.status}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
