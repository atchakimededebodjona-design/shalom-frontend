'use client';

import { useState } from 'react';
import { profilesService } from '../../services/profiles.service';
import { getApiError } from '../../utils/apiError';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Champs texte : la chaîne vide est acceptée par le backend (permet d'effacer)
const TEXT_FIELDS = ['bio', 'city', 'country', 'church_name', 'denomination'];
// Champs URL : le backend les valide en isURL() → on n'envoie que si non vide
// (avatar_url / cover_url sont gérés séparément par le clic direct sur les photos)
const URL_FIELDS = ['website'];

// Intitulés prédéfinis (l'option « Autre » ouvre un champ libre)
const CHURCH_OPTIONS = ['Catholique', 'Évangélique', 'Charismatique'];
const DENOMINATION_OPTIONS = [
  'Catholique',
  'Évangélique',
  'Assemblée de Dieu',
  'Baptiste',
  'Pentecôte',
  'Vie profonde',
  'Missionnaire de Christ',
];
const OTHER_VALUE = '__other__';

// Liste déroulante avec option « Autre (à préciser) » ouvrant un champ texte libre.
// La valeur envoyée au backend reste une simple chaîne (intitulé choisi ou texte saisi).
const SelectWithOther = ({ label, value, options, onChange, maxLength }) => {
  const [isOther, setIsOther] = useState(() => Boolean(value) && !options.includes(value));
  const selectValue = isOther ? OTHER_VALUE : options.includes(value) ? value : '';

  const handleSelect = (e) => {
    const v = e.target.value;
    if (v === OTHER_VALUE) {
      setIsOther(true);
      onChange(''); // vider pour laisser l'utilisateur préciser
    } else {
      setIsOther(false);
      onChange(v); // '' (aucune) ou l'intitulé prédéfini
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
      <label style={{ fontWeight: 'bold', fontSize: 'var(--spacing-sm)' }}>{label}</label>
      <select value={selectValue} onChange={handleSelect} style={{ width: '100%' }}>
        <option value="">— Sélectionner —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value={OTHER_VALUE}>Autre (à préciser)</option>
      </select>
      {isOther && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Préciser…"
          maxLength={maxLength}
          style={{ width: '100%' }}
          autoFocus
        />
      )}
    </div>
  );
};

export const ProfileEditForm = ({ profile, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    city: profile?.city || '',
    country: profile?.country || '',
    church_name: profile?.church_name || '',
    denomination: profile?.denomination || '',
    website: profile?.website || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const canSave = form.display_name.trim().length >= 2 && !saving;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    // Construction du payload (voir contraintes de validation backend)
    const payload = { display_name: form.display_name.trim() };
    TEXT_FIELDS.forEach((f) => {
      payload[f] = form[f].trim();
    });
    URL_FIELDS.forEach((f) => {
      const v = form[f].trim();
      if (v) payload[f] = v; // omis si vide pour éviter l'échec isURL()
    });

    setSaving(true);
    setError('');
    try {
      const res = await profilesService.updateMe(payload);
      onSaved?.(res.data.profile);
    } catch (err) {
      setError(getApiError(err, 'Impossible d\'enregistrer le profil'));
      setSaving(false);
    }
  };

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

      <Input label="Nom d'affichage" value={form.display_name} onChange={setField('display_name')} required minLength={2} maxLength={100} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
        <label htmlFor="bio" style={{ fontWeight: 'bold', fontSize: 'var(--spacing-sm)' }}>Biographie</label>
        <textarea
          id="bio"
          value={form.bio}
          onChange={setField('bio')}
          maxLength={500}
          placeholder="Parlez un peu de vous…"
          style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
        />
        <span className="text-muted text-sm">{form.bio.length}/500</span>
      </div>

      <p className="text-muted text-sm" style={{ marginBottom: 'var(--spacing-md)' }}>
        Astuce : cliquez directement sur la photo de profil ou sur la couverture pour les changer.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <Input label="Ville" value={form.city} onChange={setField('city')} maxLength={100} />
        <Input label="Pays" value={form.country} onChange={setField('country')} maxLength={100} />
      </div>

      <SelectWithOther
        label="Église"
        value={form.church_name}
        options={CHURCH_OPTIONS}
        onChange={(v) => setForm((f) => ({ ...f, church_name: v }))}
        maxLength={150}
      />
      <SelectWithOther
        label="Dénomination"
        value={form.denomination}
        options={DENOMINATION_OPTIONS}
        onChange={(v) => setForm((f) => ({ ...f, denomination: v }))}
        maxLength={100}
      />
      <Input label="Site web" type="url" value={form.website} onChange={setField('website')} placeholder="https://…" />

      <div className="flex gap-md justify-between" style={{ marginTop: 'var(--spacing-md)' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" variant="primary" isLoading={saving} disabled={!canSave}>Enregistrer</Button>
      </div>
    </form>
  );
};
