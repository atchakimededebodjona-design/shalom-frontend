'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/Button';
// Réutilise le CSS module du module Finance (mêmes conventions visuelles).
import styles from '../finance/finance.module.css';

// Formulaire d'un mouvement de portefeuille.
// type 'credit' = revenu (catégories income) ; type 'debit' = dépense (catégories expense).
// L'appelant choisit l'endpoint (income/expense) selon `type`.
export const MovementForm = ({ initialType = 'debit', categories = [], onSubmit, onCancel }) => {
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // credit ↔ catégories 'income' ; debit ↔ catégories 'expense'.
  const catType = type === 'credit' ? 'income' : 'expense';
  const cats = categories.filter((c) => c.type === catType);

  const changeType = (t) => {
    setType(t);
    setCategoryId(''); // la catégorie dépend du type
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
        category_id: categoryId || null,
        description: description.trim() || null,
      });
    } catch (err) {
      const code = err.response?.data?.code;
      setError(
        code === 'INSUFFICIENT_BALANCE'
          ? 'Solde insuffisant pour cette dépense.'
          : err.response?.data?.error || "L'enregistrement a échoué. Réessayez."
      );
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.typeToggle}>
        <button
          type="button" onClick={() => changeType('debit')}
          className={`${styles.typeChip} ${type === 'debit' ? styles.typeChipOut : ''}`}
        >
          <TrendingDown size={16} /> Dépense
        </button>
        <button
          type="button" onClick={() => changeType('credit')}
          className={`${styles.typeChip} ${type === 'credit' ? styles.typeChipIn : ''}`}
        >
          <TrendingUp size={16} /> Revenu
        </button>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="mv-amount">Montant (FCFA)</label>
          <input
            id="mv-amount" className={styles.input} type="number" min="1" inputMode="numeric"
            placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="mv-cat">Catégorie</label>
          <select id="mv-cat" className={styles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">— Aucune —</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
            ))}
          </select>
        </div>

        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="mv-desc">Description (facultatif)</label>
          <textarea
            id="mv-desc" className={styles.textarea} value={description}
            onChange={(e) => setDescription(e.target.value)} maxLength={1000}
            placeholder="Ex : Salaire, courses, don…"
          />
        </div>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>Enregistrer</Button>
      </div>
    </form>
  );
};
