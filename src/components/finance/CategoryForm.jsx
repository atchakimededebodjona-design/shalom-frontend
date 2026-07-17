'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './finance.module.css';

// Formulaire de catégorie. Le type est figé en édition (l'API ne le modifie pas).
export const CategoryForm = ({ initial, onSubmit, onCancel }) => {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState(initial?.type || 'expense');
  const [icon, setIcon] = useState(initial?.icon || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true);
    try {
      const payload = isEdit
        ? { name: name.trim(), icon: icon.trim() || null }
        : { name: name.trim(), type, icon: icon.trim() || null };
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.error || "L'enregistrement a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      {!isEdit && (
        <div className={styles.typeToggle}>
          <button
            type="button" onClick={() => setType('expense')}
            className={`${styles.typeChip} ${type === 'expense' ? styles.typeChipOut : ''}`}
          >
            <TrendingDown size={16} /> Dépense
          </button>
          <button
            type="button" onClick={() => setType('income')}
            className={`${styles.typeChip} ${type === 'income' ? styles.typeChipIn : ''}`}
          >
            <TrendingUp size={16} /> Revenu
          </button>
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cat-name">Nom</label>
          <input
            id="cat-name" className={styles.input} value={name} maxLength={100}
            onChange={(e) => setName(e.target.value)} placeholder="Ex : Loyer, Salaire…" required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cat-icon">Icône (emoji, facultatif)</label>
          <input
            id="cat-icon" className={styles.input} value={icon} maxLength={50}
            onChange={(e) => setIcon(e.target.value)} placeholder="🛒"
          />
        </div>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
      </div>
    </form>
  );
};
