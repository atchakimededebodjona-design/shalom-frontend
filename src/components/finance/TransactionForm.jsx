'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { todayISO } from '../../utils/format';
import styles from './finance.module.css';

const RECURRENCES = [
  { v: 'daily', l: 'Quotidienne' },
  { v: 'weekly', l: 'Hebdomadaire' },
  { v: 'monthly', l: 'Mensuelle' },
  { v: 'yearly', l: 'Annuelle' },
];

// Formulaire de création / édition d'une transaction. `categories` sert à
// alimenter le sélecteur, filtré selon le type courant.
export const TransactionForm = ({ initial, categories = [], onSubmit, onCancel }) => {
  const [type, setType] = useState(initial?.type || 'expense');
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : '');
  const [date, setDate] = useState(initial?.transaction_date ? initial.transaction_date.slice(0, 10) : todayISO());
  const [categoryId, setCategoryId] = useState(initial?.category_id || '');
  const [note, setNote] = useState(initial?.note || '');
  const [isRecurring, setIsRecurring] = useState(Boolean(initial?.is_recurring));
  const [recurrence, setRecurrence] = useState(initial?.recurrence_frequency || 'monthly');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const cats = categories.filter((c) => c.type === type);

  const changeType = (t) => {
    setType(t);
    // Réinitialise la catégorie si elle n'appartient pas au nouveau type.
    if (categoryId && !categories.some((c) => c.id === categoryId && c.type === t)) {
      setCategoryId('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!(Number(amount) > 0)) { setError('Le montant doit être supérieur à 0.'); return; }
    setSaving(true);
    try {
      await onSubmit({
        type,
        amount: Number(amount),
        transaction_date: date,
        category_id: categoryId || null,
        note: note.trim() || null,
        is_recurring: isRecurring,
        recurrence_frequency: isRecurring ? recurrence : null,
      });
    } catch (err) {
      setError(err.response?.data?.error || "L'enregistrement a échoué. Réessayez.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.typeToggle}>
        <button
          type="button"
          onClick={() => changeType('expense')}
          className={`${styles.typeChip} ${type === 'expense' ? styles.typeChipOut : ''}`}
        >
          <TrendingDown size={16} /> Dépense
        </button>
        <button
          type="button"
          onClick={() => changeType('income')}
          className={`${styles.typeChip} ${type === 'income' ? styles.typeChipIn : ''}`}
        >
          <TrendingUp size={16} /> Revenu
        </button>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tx-amount">Montant (FCFA)</label>
          <input
            id="tx-amount" className={styles.input} type="number" min="1" inputMode="numeric"
            placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tx-date">Date</label>
          <input
            id="tx-date" className={styles.input} type="date"
            value={date} onChange={(e) => setDate(e.target.value)} required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="tx-cat">Catégorie</label>
          <select id="tx-cat" className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— Aucune —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tx-recurring">Récurrence</label>
          <div className="flex items-center gap-sm">
            <input
              id="tx-recurring" type="checkbox" checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <select
              className={styles.select} value={recurrence} disabled={!isRecurring}
              onChange={(e) => setRecurrence(e.target.value)} style={{ opacity: isRecurring ? 1 : 0.5 }}
            >
              {RECURRENCES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
            </select>
          </div>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="tx-note">Note (facultatif)</label>
          <textarea
            id="tx-note" className={styles.textarea} value={note}
            onChange={(e) => setNote(e.target.value)} maxLength={1000}
            placeholder="Ex : Loyer, salaire, courses…"
          />
        </div>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>{initial ? 'Enregistrer' : 'Ajouter'}</Button>
      </div>
    </form>
  );
};
