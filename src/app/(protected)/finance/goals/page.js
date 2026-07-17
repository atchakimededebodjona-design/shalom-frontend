'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { financeService } from '../../../../services/finance.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { GoalForm } from '../../../../components/finance/GoalForm';
import { formatFCFA, formatDateFR } from '../../../../utils/format';
import styles from '../../../../components/finance/finance.module.css';

const STATUS_LABEL = { active: 'En cours', achieved: 'Atteint', abandoned: 'Abandonné' };

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | goal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await financeService.listGoals();
      setGoals(res.data.goals);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const submit = async (payload) => {
    if (editing && editing !== 'new') await financeService.updateGoal(editing.id, payload);
    else await financeService.createGoal(payload);
    setEditing(null);
    await reload();
  };

  const remove = async (goal) => {
    if (!window.confirm('Supprimer cet objectif ?')) return;
    try { await financeService.deleteGoal(goal.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-md">
        <p className="text-muted text-sm" style={{ margin: 0 }}>Suivez vos objectifs d'épargne.</p>
        <Button onClick={() => setEditing('new')}><span className="flex items-center gap-xs"><Plus size={16} /> Nouvel objectif</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : goals.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <Target size={28} style={{ opacity: 0.5 }} />
          <p>Aucun objectif pour l'instant.</p>
          <Button onClick={() => setEditing('new')}>Créer mon premier objectif</Button>
        </div>
      ) : (
        <div className={styles.goalGrid}>
          {goals.map((g) => {
            const cur = Number(g.current_amount) || 0;
            const tgt = Number(g.target_amount) || 0;
            const pct = tgt > 0 ? Math.min(100, (cur / tgt) * 100) : 0;
            const done = pct >= 100 || g.status === 'achieved';
            return (
              <div key={g.id} className={styles.card}>
                <div className={styles.sectionHead}>
                  <h3 style={{ fontSize: '1.05rem' }}>{g.title}</h3>
                  <div className={styles.txActions}>
                    <button className={styles.iconBtn} onClick={() => setEditing(g)} aria-label="Modifier"><Pencil size={16} /></button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(g)} aria-label="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mb-sm">
                  <span className={`${styles.badge} ${done ? styles.badgeIn : ''}`}>{STATUS_LABEL[g.status] || g.status}</span>
                  <span className="font-bold">{pct.toFixed(0)} %</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={`${styles.progressFill} ${done ? styles.progressFillDone : ''}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm mt-sm">
                  <span className="font-bold">{formatFCFA(cur)}</span>
                  <span className="text-muted">/ {formatFCFA(tgt)}</span>
                </div>
                {g.target_date && <div className="text-sm text-muted mt-sm">Échéance : {formatDateFR(g.target_date)}</div>}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? "Modifier l'objectif" : 'Nouvel objectif'}>
        <GoalForm
          initial={editing && editing !== 'new' ? editing : null}
          onSubmit={submit}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </div>
  );
}
