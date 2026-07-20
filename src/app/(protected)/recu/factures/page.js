'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Wallet } from 'lucide-react';
import { invoicesService } from '../../../../services/invoices.service';
import { clientsService } from '../../../../services/clients.service';
import { Button } from '../../../../components/ui/Button';
import { formatFCFA, formatDateFR } from '../../../../utils/format';
import styles from '../../../../components/recu/recu.module.css';

const emptyItem = () => ({ description: '', quantity: 1, unit_price: 0 });

const STATUS_LABELS = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  partially_paid: 'Partielle',
  paid: 'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée',
};
const statusClass = (s) => {
  if (s === 'paid') return styles.badgePaid;
  if (s === 'partially_paid') return styles.badgePartial;
  if (s === 'cancelled') return styles.badgeCancelled;
  return '';
};

export default function RecuFacturesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ invoice_number: '', client_id: '', tax_rate: 0, items: [emptyItem()] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [list, cl] = await Promise.all([
        invoicesService.list({ limit: 50 }),
        clientsService.list({ limit: 100 }),
      ]);
      setInvoices(list.data.invoices);
      setClients(cl.data.clients);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les factures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.unit_price || 0), 0);
    const tax = (subtotal * Number(form.tax_rate || 0)) / 100;
    return { subtotal, tax, total: subtotal + tax };
  }, [form.items, form.tax_rate]);

  const setItem = (idx, key, value) => {
    setForm({ ...form, items: form.items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)) });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, emptyItem()] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        invoice_number: form.invoice_number,
        tax_rate: Number(form.tax_rate || 0),
        items: form.items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
        })),
      };
      if (form.client_id) payload.client_id = form.client_id;
      await invoicesService.create(payload);
      setForm({ invoice_number: '', client_id: '', tax_rate: 0, items: [emptyItem()] });
      await load();
    } catch (err) {
      setError(err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  const encaisser = async (inv) => {
    const remaining = Number(inv.total) - Number(inv.amount_paid);
    if (remaining <= 0) return;
    setError('');
    setPayingId(inv.id);
    try {
      await invoicesService.addPayment(inv.id, { amount: remaining, method: 'cash' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Impossible d'enregistrer le paiement.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      {/* Formulaire de création */}
      <div className={styles.card}>
        <div className={styles.sectionHead}><h3>Nouvelle facture</h3></div>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.grid3}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="invoice_number">Numéro *</label>
              <input id="invoice_number" className={styles.input} placeholder="FA-2026-001"
                value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="client_id">Client</label>
              <select id="client_id" className={styles.select} value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                <option value="">— Aucun —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tax_rate">Taxe (%)</label>
              <input id="tax_rate" type="number" min="0" max="100" step="0.01" className={styles.input}
                value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
            </div>
          </div>

          <div>
            <label className={styles.label}>Lignes</label>
            <div className="flex-col gap-sm" style={{ display: 'flex', marginTop: 'var(--spacing-xs)' }}>
              {form.items.map((it, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <input className={styles.input} style={{ flex: 3 }} placeholder="Description"
                    value={it.description} onChange={(e) => setItem(idx, 'description', e.target.value)} required />
                  <input className={styles.input} style={{ flex: 1 }} type="number" min="0.01" step="0.01" placeholder="Qté"
                    value={it.quantity} onChange={(e) => setItem(idx, 'quantity', e.target.value)} required />
                  <input className={styles.input} style={{ flex: 1 }} type="number" min="0" step="0.01" placeholder="Prix unit."
                    value={it.unit_price} onChange={(e) => setItem(idx, 'unit_price', e.target.value)} required />
                  <button type="button" className={styles.iconBtn} onClick={() => removeItem(idx)}
                    disabled={form.items.length === 1} title="Supprimer la ligne">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="flex items-center gap-xs text-primary font-bold hover-lift"
              onClick={addItem} style={{ marginTop: 'var(--spacing-sm)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Plus size={16} /> Ajouter une ligne
            </button>
          </div>

          <div className={styles.totals}>
            <div>Sous-total : {formatFCFA(totals.subtotal)}</div>
            <div>Taxe : {formatFCFA(totals.tax)}</div>
            <div style={{ fontSize: '1.1rem' }}><strong>Total : {formatFCFA(totals.total)}</strong></div>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
          <div className={styles.actions}>
            <Button type="submit" variant="primary" isLoading={saving}>Créer la facture</Button>
          </div>
        </form>
      </div>

      {/* Liste */}
      <div className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>Mes factures</h3>
          <span className="text-muted text-sm flex items-center gap-xs"><Wallet size={14} /> « Encaisser » crédite le portefeuille</span>
        </div>
        {loading ? (
          <p className="animate-pulse text-muted">Chargement…</p>
        ) : invoices.length === 0 ? (
          <p className={styles.empty}>Aucune facture pour l'instant.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Numéro</th><th>Client</th><th>Date</th><th>Statut</th>
                  <th className={styles.alignRight}>Payé / Total</th><th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const remaining = Number(inv.total) - Number(inv.amount_paid);
                  const payable = inv.status !== 'paid' && inv.status !== 'cancelled' && remaining > 0;
                  return (
                    <tr key={inv.id}>
                      <td>{inv.invoice_number}</td>
                      <td>{inv.client_name || '—'}</td>
                      <td>{formatDateFR(inv.issue_date)}</td>
                      <td><span className={`${styles.badge} ${statusClass(inv.status)}`}>{STATUS_LABELS[inv.status] || inv.status}</span></td>
                      <td className={styles.alignRight}>{formatFCFA(inv.amount_paid)} / {formatFCFA(inv.total)}</td>
                      <td className={styles.alignRight}>
                        {payable && (
                          <Button variant="secondary" isLoading={payingId === inv.id}
                            onClick={() => encaisser(inv)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                            Encaisser
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
