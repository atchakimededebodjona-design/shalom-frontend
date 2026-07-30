'use client';

import { useState } from 'react';
import { getApiError } from '../../utils/apiError';
import { todayISO } from '../../utils/format';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import financeStyles from '../finance/finance.module.css';

const METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'other', label: 'Autre' },
];

export const PaymentForm = ({ maxAmount, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState(maxAmount > 0 ? String(maxAmount) : '');
  const [method, setMethod] = useState('cash');
  const [date, setDate] = useState(todayISO());
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const numAmount = parseInt(amount, 10) || 0;
  const canSave = numAmount > 0 && numAmount <= maxAmount && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        amount: numAmount,
        payment_method: method,
        payment_date: date,
        reference_id: reference.trim() || null,
      });
    } catch (err) {
      setError(getApiError(err, "Impossible d'enregistrer le paiement"));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={financeStyles.form}>
      {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}
      <Input
        label={`Montant (solde dû : ${maxAmount.toLocaleString('fr-FR')})`}
        type="number"
        min="1"
        max={maxAmount}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      {numAmount > maxAmount && <p className={financeStyles.errorMsg}>Le montant dépasse le solde dû.</p>}

      <div className={financeStyles.field}>
        <label className={financeStyles.label} htmlFor="method">Moyen de paiement</label>
        <select id="method" className={financeStyles.select} value={method} onChange={(e) => setMethod(e.target.value)}>
          {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <Input label="Date du paiement" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Input label="Référence (optionnel)" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="N° de transaction..." />

      <div className={financeStyles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" variant="primary" isLoading={saving} disabled={!canSave}>Enregistrer le paiement</Button>
      </div>
    </form>
  );
};
