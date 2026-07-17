'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import styles from './finance.module.css';

const STATUSES = [
  { v: 'active', l: 'En cours' },
  { v: 'achieved', l: 'Atteint' },
  { v: 'abandoned', l: 'Abandonné' },
];

// Formulaire de création / édition d'un objectif d'épargne.
export const GoalForm = ({ initial, onSubmit, onCancel }) => {
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title || '');
  const [target, setTarget] = useState(initial?.target_amount != null ? String(initial.target_amount) : '');
  const [current, setCurrent] = useState(initial?.current_amount != null ? String(initial.current_amount) : '0');
  const [targetDate, setTargetDate] = useState(initial?.target_date ? initial.target_date.slice(0, 10) : '');
  const [status, setStatus] = useState(initial?.status || 'active');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    if (!(Number(target) > 0)) { setError('Le montant cible doit être supérieur à 0.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        target_amount: Number(target),
        current_amount: Number(current) || 0,
        target_date: targetDate || null,
      };
      if (isEdit) payload.status = status;
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.error || "L'enregistrement a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="goal-title">Titre</label>
          <input
            id="goal-title" className={styles.input} value={title} maxLength={150}
            onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Fonds d'urgence" required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="goal-target">Montant cible (FCFA)</label>
          <input
            id="goal-target" className={styles.input} type="number" min="1" inputMode="numeric"
            value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="goal-current">Déjà épargné (FCFA)</label>
          <input
            id="goal-current" className={styles.input} type="number" min="0" inputMode="numeric"
            value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="0"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="goal-date">Date cible (facultatif)</label>
          <input
            id="goal-date" className={styles.input} type="date"
            value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
        {isEdit && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="goal-status">Statut</label>
            <select id="goal-status" className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
        )}
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
      </div>
    </form>
  );
};
