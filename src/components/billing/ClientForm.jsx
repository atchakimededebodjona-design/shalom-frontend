'use client';

import { useState } from 'react';
import { getApiError } from '../../utils/apiError';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import financeStyles from '../finance/finance.module.css';

export const ClientForm = ({ client, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const canSave = form.name.trim().length > 0 && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      });
    } catch (err) {
      setError(getApiError(err, 'Impossible d\'enregistrer le client'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={financeStyles.form}>
      {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}
      <Input label="Nom du client *" value={form.name} onChange={setField('name')} required maxLength={255} />
      <Input label="Téléphone" value={form.phone} onChange={setField('phone')} maxLength={50} placeholder="+228 90 00 00 00" />
      <p className="text-muted text-sm" style={{ marginTop: '-8px' }}>Nécessaire pour partager la facture par WhatsApp.</p>
      <Input label="Email" type="email" value={form.email} onChange={setField('email')} />
      <Input label="Adresse" value={form.address} onChange={setField('address')} maxLength={1000} />
      <div className={financeStyles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" variant="primary" isLoading={saving} disabled={!canSave}>Enregistrer</Button>
      </div>
    </form>
  );
};
