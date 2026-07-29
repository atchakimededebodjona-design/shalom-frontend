'use client';

import { useState } from 'react';
import { authService } from '../../services/auth.service';
import { getApiError } from '../../utils/apiError';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

export const ChangePasswordForm = ({ onSaved, onCancel }) => {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const mismatch = form.confirm_password.length > 0 && form.new_password !== form.confirm_password;
  const canSave =
    form.current_password.length > 0 &&
    PASSWORD_RULE.test(form.new_password) &&
    form.new_password === form.confirm_password &&
    !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    setSaving(true);
    setError('');
    try {
      await authService.changePassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(true);
      setTimeout(() => onSaved?.(), 1200);
    } catch (err) {
      setError(getApiError(err, 'Impossible de changer le mot de passe'));
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--spacing-lg) 0' }}>
        <p style={{ fontWeight: 'bold' }}>Mot de passe modifié ✅</p>
        <p className="text-muted text-sm">Votre session reste active.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            color: 'red',
            backgroundColor: '#fee2e2',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--spacing-md)',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <Input
        label="Mot de passe actuel"
        type="password"
        value={form.current_password}
        onChange={setField('current_password')}
        autoComplete="current-password"
        required
      />
      <Input
        label="Nouveau mot de passe"
        type="password"
        value={form.new_password}
        onChange={setField('new_password')}
        autoComplete="new-password"
        required
      />
      <p className="text-muted text-sm" style={{ marginTop: '-8px', marginBottom: 'var(--spacing-md)' }}>
        Au moins 8 caractères, une majuscule et un chiffre.
      </p>
      <Input
        label="Confirmer le nouveau mot de passe"
        type="password"
        value={form.confirm_password}
        onChange={setField('confirm_password')}
        autoComplete="new-password"
        error={mismatch ? 'Les mots de passe ne correspondent pas' : undefined}
        required
      />

      <div className="flex gap-md justify-between" style={{ marginTop: 'var(--spacing-md)' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" variant="primary" isLoading={saving} disabled={!canSave}>
          Changer le mot de passe
        </Button>
      </div>
    </form>
  );
};
