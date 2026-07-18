'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import billingService from '../../../../../services/billing.service';
import { getApiError } from '../../../../../utils/apiError';
import { resolveMediaUrl } from '../../../../../utils/resolveMediaUrl';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import styles from '../../billing.module.css';

const emptyItem = () => ({ description: '', quantity: 1, unit_price: 0 });

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [business, setBusiness] = useState(null);
  const [currency, setCurrency] = useState('XOF');
  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [taxRate, setTaxRate] = useState(0);
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [clientsRes, businessRes] = await Promise.all([
          billingService.listClients({ limit: 100 }),
          billingService.getMyBusiness(),
        ]);
        setClients(clientsRes.data.clients || []);
        setBusiness(businessRes.data.business);
        setCurrency(businessRes.data.business.currency || 'XOF');
      } catch (err) {
        setError(getApiError(err, 'Erreur lors du chargement.'));
      } finally {
        setLoadingClients(false);
      }
    })();
  }, []);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseInt(item.unit_price, 10) || 0), 0);
    const tax = Math.round((sub * (parseFloat(taxRate) || 0)) / 100);
    return { subtotal: Math.round(sub), taxAmount: tax, total: Math.round(sub) + tax };
  }, [items, taxRate]);

  const formatAmount = (amount) => `${Number(amount).toLocaleString('fr-FR')} ${currency}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!clientId) {
      setError('Choisissez un client.');
      return;
    }
    setSaving(true);
    try {
      const res = await billingService.createInvoice({
        client_id: clientId,
        items: items.map((item, index) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseInt(item.unit_price, 10),
          sort_order: index,
        })),
        tax_rate: parseFloat(taxRate) || 0,
        issue_date: issueDate || undefined,
        due_date: dueDate || undefined,
        notes: notes || undefined,
      });
      router.push(`/billing/invoices/${res.data.invoice.id}`);
    } catch (err) {
      setError(getApiError(err, 'Erreur lors de la création de la facture.'));
      setSaving(false);
    }
  };

  if (loadingClients) {
    return (
      <div className={styles.containerWide}>
        <div className={styles.loadingState}>Chargement…</div>
      </div>
    );
  }

  return (
    <div className={styles.containerWide}>
      <Link href="/billing/invoices" className={styles.breadcrumb}>
        <ArrowLeft size={16} /> Factures
      </Link>

      <div className={styles.headRow}>
        <h1 className={styles.title}>Nouvelle facture</h1>
      </div>

      {business && (
        <div className={styles.letterhead}>
          {business.logo_url ? (
            <img src={resolveMediaUrl(business.logo_url)} alt={business.name} className={styles.letterheadLogo} />
          ) : null}
          <div>
            <div className={styles.letterheadName}>{business.name}</div>
            <div className={styles.letterheadMeta}>
              {[business.address, business.phone, business.tax_id && `NIF/RCCM : ${business.tax_id}`]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        </div>
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}

      {clients.length === 0 ? (
        <div className={styles.card}>
          <p>
            Vous n&apos;avez pas encore de client.{' '}
            <Link href="/billing/clients" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Créez-en un d&apos;abord
            </Link>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Informations générales</h2>
            <div className={styles.formGrid}>
              <div className={styles.colSpan2}>
                <label className={styles.label}>Client</label>
                <select required value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">— Sélectionner un client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Date d&apos;émission</label>
                <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                <p className={styles.helperText}>Vide = aujourd&apos;hui</p>
              </div>
              <div>
                <label className={styles.label}>Date d&apos;échéance</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>TVA (%)</label>
                <input type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
              <div className={styles.colSpan2}>
                <label className={styles.label}>Notes</label>
                <textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Articles</h2>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Description</th>
                  <th>Qté</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        required
                        placeholder="Description de l'article"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        style={{ width: '5rem' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                        style={{ width: '8rem' }}
                      />
                    </td>
                    <td>{formatAmount((parseFloat(item.quantity) || 0) * (parseInt(item.unit_price, 10) || 0))}</td>
                    <td>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className={styles.itemRemoveBtn}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addItem} className={styles.addItemBtn}>
              <Plus size={16} /> Ajouter un article
            </button>

            <div className={styles.totalsBox} style={{ marginTop: 'var(--spacing-xl)' }}>
              <div className={styles.totalsRow}><span>Sous-total</span><span>{formatAmount(subtotal)}</span></div>
              <div className={styles.totalsRow}><span>TVA ({taxRate || 0}%)</span><span>{formatAmount(taxAmount)}</span></div>
              <div className={`${styles.totalsRow} ${styles.totalsRowFinal}`}><span>Total</span><span>{formatAmount(total)}</span></div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => router.push('/billing/invoices')} className={styles.btnSecondary}>
              Annuler
            </button>
            <button type="submit" disabled={saving} className={styles.btnPrimary}>
              {saving ? 'Création…' : 'Créer la facture'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
