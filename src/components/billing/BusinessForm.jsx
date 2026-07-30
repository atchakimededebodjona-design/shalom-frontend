'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/upload.service';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import { getApiError } from '../../utils/apiError';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import styles from './billing.module.css';
import financeStyles from '../finance/finance.module.css';

const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5 Mo

export const BusinessForm = ({ business, onSubmit, onCancel, submitLabel = 'Enregistrer' }) => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: business?.name || '',
    logo_url: business?.logo_url || '',
    address: business?.address || '',
    phone: business?.phone || '',
    tax_id: business?.tax_id || '',
    currency: business?.currency || 'XOF',
    invoice_prefix: business?.invoice_prefix || 'FAC',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Veuillez choisir une image.');
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setError('Le logo ne doit pas dépasser 5 Mo.');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      setForm((f) => ({ ...f, logo_url: res.data.url }));
    } catch (err) {
      setError(getApiError(err, 'Échec du téléversement du logo.'));
    } finally {
      setUploading(false);
    }
  };

  const canSave = form.name.trim().length > 0 && !saving && !uploading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        name: form.name.trim(),
        logo_url: form.logo_url || null,
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        tax_id: form.tax_id.trim() || null,
        currency: form.currency.trim().toUpperCase() || 'XOF',
        invoice_prefix: form.invoice_prefix.trim() || 'FAC',
      });
    } catch (err) {
      setError(getApiError(err, "Impossible d'enregistrer l'entreprise"));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={financeStyles.form}>
      {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}

      <div className={styles.logoPicker}>
        {form.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveMediaUrl(form.logo_url)} alt="Logo" className={styles.logoPreview} />
        ) : (
          <div className={styles.logoPlaceholder}><ImagePlus size={24} /></div>
        )}
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploading}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : (form.logo_url ? 'Changer le logo' : 'Ajouter un logo')}
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>PNG/JPG, 5 Mo max — apparaîtra sur vos factures.</p>
        </div>
      </div>

      <Input label="Nom de l'entreprise *" value={form.name} onChange={setField('name')} required maxLength={255} />
      <Input label="Adresse" value={form.address} onChange={setField('address')} maxLength={1000} />

      <div className={financeStyles.formGrid}>
        <Input label="Téléphone" value={form.phone} onChange={setField('phone')} maxLength={50} />
        <Input label="NIF / RCCM" value={form.tax_id} onChange={setField('tax_id')} maxLength={100} />
      </div>

      <div className={financeStyles.formGrid}>
        <Input label="Devise (ex: XOF)" value={form.currency} onChange={setField('currency')} maxLength={3} />
        <Input label="Préfixe des factures" value={form.invoice_prefix} onChange={setField('invoice_prefix')} maxLength={10} placeholder="FAC" />
      </div>
      <p className="text-muted text-sm" style={{ marginTop: '-8px' }}>
        Vos factures seront numérotées automatiquement, ex : {form.invoice_prefix || 'FAC'}-{new Date().getFullYear()}-0001
      </p>

      <div className={financeStyles.actions}>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>}
        <Button type="submit" variant="primary" isLoading={saving} disabled={!canSave}>{submitLabel}</Button>
      </div>
    </form>
  );
};
