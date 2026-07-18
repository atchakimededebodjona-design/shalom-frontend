'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import billingService from '../../../services/billing.service';
import { uploadService } from '../../../services/upload.service';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { getApiError } from '../../../utils/apiError';
import { Users, FileText, Save, Camera, LoaderCircle } from 'lucide-react';
import styles from './billing.module.css';

const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5 Mo

export default function BillingHomePage() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '', address: '', phone: '', tax_id: '', currency: 'XOF', invoice_prefix: 'FAC', logo_url: '',
  });

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    setLoading(true);
    try {
      const res = await billingService.getMyBusiness();
      const b = res.data.business;
      setBusiness(b);
      setForm({
        name: b.name || '',
        address: b.address || '',
        phone: b.phone || '',
        tax_id: b.tax_id || '',
        currency: b.currency || 'XOF',
        invoice_prefix: b.invoice_prefix || 'FAC',
        logo_url: b.logo_url || '',
      });
      setNotFound(false);
    } catch (err) {
      if (err.response?.data?.code === 'BUSINESS_NOT_FOUND') {
        setNotFound(true);
      } else {
        setError(getApiError(err, 'Erreur lors du chargement.'));
      }
    } finally {
      setLoading(false);
    }
  };

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
      setError('Logo trop volumineux (max 5 Mo).');
      return;
    }

    setUploadingLogo(true);
    try {
      const res = await uploadService.uploadFile(file);
      setForm((f) => ({ ...f, logo_url: res.data.url }));
    } catch (err) {
      setError(getApiError(err, 'Échec du téléversement du logo.'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (notFound) {
        const res = await billingService.createBusiness(form);
        setBusiness(res.data.business);
        setNotFound(false);
      } else {
        const res = await billingService.updateMyBusiness(form);
        setBusiness(res.data.business);
      }
    } catch (err) {
      setError(getApiError(err, "Erreur lors de l'enregistrement."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Chargement…</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headRow}>
        <h1 className={styles.title}>Reçu+</h1>
      </div>
      <p className={styles.subtitle}>Gérez votre entreprise, vos clients et vos factures.</p>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {!notFound && business && (
        <div className={styles.hubGrid}>
          <Link href="/billing/clients" className={styles.hubCard}>
            <Users size={24} className={styles.hubCardIcon} />
            <span className={styles.hubCardTitle}>Clients</span>
            <span className={styles.hubCardDesc}>Créer et gérer vos clients</span>
          </Link>
          <Link href="/billing/invoices" className={styles.hubCard}>
            <FileText size={24} className={styles.hubCardIcon} />
            <span className={styles.hubCardTitle}>Factures</span>
            <span className={styles.hubCardDesc}>Créer et suivre vos factures</span>
          </Link>
        </div>
      )}

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>
          {notFound ? 'Créer mon entreprise' : 'Mon entreprise'}
        </h2>
        {notFound && (
          <p className={styles.helperText} style={{ marginBottom: 'var(--spacing-md)' }}>
            Déclarez votre entreprise pour commencer à créer des clients et des factures.
          </p>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.label}>Logo</label>
            <div className={styles.logoUploadRow}>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className={styles.logoPreview}
                title="Changer le logo"
              >
                {uploadingLogo ? (
                  <LoaderCircle size={22} className="animate-spin" />
                ) : form.logo_url ? (
                  <img src={resolveMediaUrl(form.logo_url)} alt="Logo" className={styles.logoImg} />
                ) : (
                  <Camera size={22} />
                )}
              </button>
              <div>
                <button type="button" onClick={() => logoInputRef.current?.click()} className={styles.btnSecondary}>
                  {form.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
                </button>
                <p className={styles.helperText}>PNG ou JPG, max 5 Mo. Apparaît sur vos factures.</p>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.colSpan2}>
              <label className={styles.label}>Nom de l&apos;entreprise</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className={styles.colSpan2}>
              <label className={styles.label}>Adresse</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className={styles.label}>Téléphone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className={styles.label}>NIF / RCCM</label>
              <input type="text" value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
            </div>
            <div>
              <label className={styles.label}>Devise</label>
              <input type="text" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
              <p className={styles.helperText}>3 lettres, ex : XOF</p>
            </div>
            <div>
              <label className={styles.label}>Préfixe de facture</label>
              <input type="text" value={form.invoice_prefix} onChange={(e) => setForm({ ...form, invoice_prefix: e.target.value.toUpperCase() })} />
              <p className={styles.helperText}>Ex : FAC → FAC-2026-0001</p>
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.btnPrimary}>
              <Save size={16} /> {saving ? 'Enregistrement…' : notFound ? 'Créer mon entreprise' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
