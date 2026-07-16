'use client';

import { useState } from 'react';
import { groupsService, GROUP_VISIBILITIES } from '../../services/groups.service';
import { getApiError } from '../../utils/apiError';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const GroupEditForm = ({ group, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    name: group?.name || '',
    description: group?.description || '',
    cover_url: group?.cover_url || '',
    visibility: group?.visibility || 'public',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const canSave = form.name.trim().length > 0 && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      visibility: form.visibility,
    };
    if (form.cover_url.trim()) payload.cover_url = form.cover_url.trim(); // omis si vide (isURL)

    setSaving(true);
    setError('');
    try {
      const res = await groupsService.update(group.id, payload);
      onSaved?.(res.data.group);
    } catch (err) {
      setError(getApiError(err, 'Impossible de mettre à jour le groupe'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ color: 'red', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <Input label="Nom du groupe" value={form.name} onChange={setField('name')} required maxLength={150} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
        <label htmlFor="edit-group-desc" style={{ fontWeight: 'bold', fontSize: 'var(--spacing-sm)' }}>Description</label>
        <textarea
          id="edit-group-desc"
          value={form.description}
          onChange={setField('description')}
          style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      <Input label="URL de couverture" type="url" value={form.cover_url} onChange={setField('cover_url')} placeholder="https://…" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
        <label htmlFor="edit-group-visibility" style={{ fontWeight: 'bold', fontSize: 'var(--spacing-sm)' }}>Visibilité</label>
        <select id="edit-group-visibility" value={form.visibility} onChange={setField('visibility')}>
          {GROUP_VISIBILITIES.map((v) => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-md justify-between" style={{ marginTop: 'var(--spacing-md)' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" variant="primary" isLoading={saving} disabled={!canSave}>Enregistrer</Button>
      </div>
    </form>
  );
};
