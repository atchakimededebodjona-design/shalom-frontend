'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Flame, Check, BookOpen } from 'lucide-react';
import { spiritualService } from '../../../../services/spiritual.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import styles from '../../../../components/shared/panel.module.css';

const DURATIONS = [
  { v: 'daily', l: 'Quotidien' },
  { v: 'annual', l: 'Annuel' },
  { v: 'custom', l: 'Personnalisé' },
];

function PlanForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationType, setDurationType] = useState('custom');
  const [totalDays, setTotalDays] = useState('30');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    if (!(Number(totalDays) > 0)) { setError('Le nombre de jours doit être supérieur à 0.'); return; }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        duration_type: durationType,
        total_days: Number(totalDays),
        is_public: isPublic,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'La création a échoué.');
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="p-title">Titre</label>
          <input id="p-title" className={styles.input} value={title} maxLength={150}
            onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Les Évangiles en 30 jours" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-type">Rythme</label>
          <select id="p-type" className={styles.select} value={durationType} onChange={(e) => setDurationType(e.target.value)}>
            {DURATIONS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="p-days">Nombre de jours</label>
          <input id="p-days" className={styles.input} type="number" min="1" max="1000" value={totalDays}
            onChange={(e) => setTotalDays(e.target.value)} required />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="p-desc">Description (facultatif)</label>
          <textarea id="p-desc" className={styles.textarea} value={description} maxLength={2000}
            onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className="flex items-center gap-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span className={styles.label} style={{ margin: 0 }}>Rendre ce plan public</span>
          </label>
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>Créer</Button>
      </div>
    </form>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await spiritualService.listPlans();
      setPlans(res.data.plans);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const create = async (payload) => {
    await spiritualService.createPlan(payload);
    setCreating(false);
    await reload();
  };

  const start = async (plan) => {
    setBusyId(plan.id);
    try { await spiritualService.startPlan(plan.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Impossible de démarrer ce plan.'); }
    finally { setBusyId(null); }
  };

  const completeToday = async (plan) => {
    setBusyId(plan.id);
    try { await spiritualService.completeDay(plan.id, plan.my_current_day || 1); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Impossible de valider ce jour.'); }
    finally { setBusyId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-md">
        <p className="text-muted text-sm" style={{ margin: 0 }}>Plans publics et vos plans personnels.</p>
        <Button onClick={() => setCreating(true)}><span className="flex items-center gap-xs"><Plus size={16} /> Nouveau plan</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : plans.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <BookOpen size={28} style={{ opacity: 0.5 }} />
          <p>Aucun plan disponible. Créez le vôtre pour commencer.</p>
          <Button onClick={() => setCreating(true)}>Créer un plan</Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {plans.map((p) => {
            const started = Boolean(p.my_status);
            const done = p.my_status === 'completed';
            const pct = started ? Math.min(100, (((p.my_current_day || 1) - 1) / p.total_days) * 100) : 0;
            return (
              <div key={p.id} className={styles.card}>
                <div className={styles.sectionHead}>
                  <h3 style={{ fontSize: '1.05rem' }}>{p.title}</h3>
                  {p.is_public ? <span className={styles.badge}>Public</span> : <span className={styles.badge}>Privé</span>}
                </div>
                {p.description && <p className="text-sm text-muted" style={{ marginTop: 0 }}>{p.description}</p>}
                <div className="text-sm text-muted mb-sm">
                  {p.total_days} jours · {p.days_defined} jour(s) défini(s)
                </div>

                {started && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span>Jour {p.my_current_day} / {p.total_days}</span>
                      <span className={styles.badgePrimary}><Flame size={12} /> {p.my_streak || 0} j</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={`${styles.progressFill} ${done ? styles.progressFillDone : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                  </>
                )}

                <div className={styles.actions} style={{ marginTop: 'var(--spacing-md)' }}>
                  {!started && (
                    <Button onClick={() => start(p)} isLoading={busyId === p.id}>Démarrer</Button>
                  )}
                  {started && !done && (
                    <Button onClick={() => completeToday(p)} isLoading={busyId === p.id}>
                      <span className="flex items-center gap-xs"><Check size={16} /> Valider le jour {p.my_current_day}</span>
                    </Button>
                  )}
                  {done && <span className={styles.badgeOk}><Check size={12} /> Terminé</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Nouveau plan de lecture">
        <PlanForm onSubmit={create} onCancel={() => setCreating(false)} />
      </Modal>
    </div>
  );
}
