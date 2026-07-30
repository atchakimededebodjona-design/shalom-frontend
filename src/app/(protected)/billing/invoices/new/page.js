'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { useBilling } from '../../layout';
import { billingService } from '../../../../../services/billing.service';
import { formatFCFA, todayISO } from '../../../../../utils/format';
import { getApiError } from '../../../../../utils/apiError';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import { Modal } from '../../../../../components/ui/Modal';
import { ClientForm } from '../../../../../components/billing/ClientForm';
import financeStyles from '../../../../../components/finance/finance.module.css';
import styles from '../../../../../components/billing/billing.module.css';

const emptyItem = () => ({ description: '', quantity: '1', unit_price: '' });

export default function NewInvoicePage() {
  const { business } = useBilling();
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientModalOpen, setClientModalOpen] = useState(false);

  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [taxRate, setTaxRate] = useState('0');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [downPayment, setDownPayment] = useState('0');
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    try {
      const res = await billingService.listClients({ limit: 100 });
      setClients(res.data.clients);
      if (res.data.clients.length > 0 && !clientId) setClientId(res.data.clients[0].id);
    } catch {
      // géré via l'état vide du sélecteur
    } finally {
      setClientsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (business) loadClients(); }, [business, loadClients]);

  const currency = business?.currency === 'XOF' || !business?.currency ? '' : ` ${business.currency}`;
  const money = (n) => (currency ? `${Number(n).toLocaleString('fr-FR')}${currency}` : formatFCFA(n));

  // --- Articles ---
  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const lineTotal = (item) => {
    const q = parseFloat(item.quantity) || 0;
    const p = parseInt(item.unit_price, 10) || 0;
    return Math.round(q * p);
  };

  // --- Totaux (miroir exact du calcul backend, cf. billing.service.js) ---
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + lineTotal(it), 0);
    const rate = parseFloat(taxRate) || 0;
    const taxAmount = Math.round((subtotal * rate) / 100);
    const total = subtotal + taxAmount;
    const discount = parseInt(discountAmount, 10) || 0;
    const netDue = total - discount;
    const down = parseInt(downPayment, 10) || 0;
    return { subtotal, taxAmount, total, discount, netDue, down, balance: netDue - down };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, taxRate, discountAmount, downPayment]);

  const canSave =
    clientId &&
    items.every((it) => it.description.trim() && Number(it.quantity) > 0 && it.unit_price !== '') &&
    totals.discount <= totals.total &&
    totals.down <= totals.netDue &&
    !saving;

  const handleClientCreated = async (payload) => {
    const res = await billingService.createClient(payload);
    setClientModalOpen(false);
    await loadClients();
    setClientId(res.data.client.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      const res = await billingService.createInvoice({
        client_id: clientId,
        items: items.map((it, i) => ({
          description: it.description.trim(),
          quantity: parseFloat(it.quantity),
          unit_price: parseInt(it.unit_price, 10),
          sort_order: i,
        })),
        tax_rate: parseFloat(taxRate) || 0,
        discount_amount: parseInt(discountAmount, 10) || 0,
        down_payment: parseInt(downPayment, 10) || 0,
        issue_date: issueDate,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      });
      router.push(`/billing/invoices/${res.data.invoice.id}`);
    } catch (err) {
      setError(getApiError(err, 'Impossible de créer la facture'));
      setSaving(false);
    }
  };

  if (!business) {
    return <p className={financeStyles.empty}>Configurez d&apos;abord votre entreprise depuis le tableau de bord.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={financeStyles.form}>
      <h2 style={{ margin: 0 }}>Nouvelle facture</h2>
      {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}

      {/* Client */}
      <div className={financeStyles.card}>
        <div className={financeStyles.sectionHead}>
          <h3>Client</h3>
          <Button type="button" variant="secondary" onClick={() => setClientModalOpen(true)} className="flex items-center gap-xs">
            <UserPlus size={16} /> Nouveau client
          </Button>
        </div>
        {clientsLoading ? (
          <p className="text-muted text-sm">Chargement des clients…</p>
        ) : clients.length === 0 ? (
          <p className="text-muted text-sm">Aucun client enregistré — créez-en un pour continuer.</p>
        ) : (
          <select className={financeStyles.select} value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.phone ? ` — ${c.phone}` : ''}</option>
            ))}
          </select>
        )}
      </div>

      {/* Articles */}
      <div className={financeStyles.card}>
        <h3 style={{ marginTop: 0 }}>Articles</h3>
        <div className={styles.itemsTable}>
          <div className={styles.itemRow} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>Description</span><span>Qté</span><span>Prix unitaire</span><span>Total</span><span />
          </div>
          {items.map((item, i) => (
            <div key={i} className={styles.itemRow}>
              <input
                className={financeStyles.input}
                placeholder="Ex : Prestation de service"
                value={item.description}
                onChange={(e) => updateItem(i, 'description', e.target.value)}
              />
              <input
                className={financeStyles.input}
                type="number"
                min="0.01"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(i, 'quantity', e.target.value)}
              />
              <input
                className={financeStyles.input}
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={item.unit_price}
                onChange={(e) => updateItem(i, 'unit_price', e.target.value)}
              />
              <span className={styles.lineTotal}>{money(lineTotal(item))}</span>
              <button type="button" className={styles.removeItemBtn} onClick={() => removeItem(i)} disabled={items.length === 1} aria-label="Retirer l'article">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={addItem} className="flex items-center gap-xs" style={{ marginTop: 'var(--spacing-sm)' }}>
          <Plus size={16} /> Ajouter un article
        </Button>
      </div>

      {/* Conditions */}
      <div className={financeStyles.card}>
        <h3 style={{ marginTop: 0 }}>Conditions</h3>
        <div className={financeStyles.formGrid}>
          <Input label="TVA (%)" type="number" min="0" max="100" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          <Input label="Remise (montant)" type="number" min="0" step="1" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
          <Input label="Acompte reçu à l'émission" type="number" min="0" step="1" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />
          <div />
          <Input label="Date d'émission" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          <Input label="Échéance" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className={financeStyles.field} style={{ marginTop: 'var(--spacing-md)' }}>
          <label className={financeStyles.label} htmlFor="notes">Notes (visibles sur la facture)</label>
          <textarea id="notes" className={financeStyles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} />
        </div>
      </div>

      {/* Totaux */}
      <div className={financeStyles.card}>
        <div className={styles.totalsBox} style={{ marginLeft: 0, maxWidth: '100%' }}>
          <div className={styles.totalsRow}><span>Sous-total</span><span>{money(totals.subtotal)}</span></div>
          <div className={styles.totalsRow}><span>TVA</span><span>{money(totals.taxAmount)}</span></div>
          {totals.discount > 0 && <div className={styles.totalsRow}><span>Remise</span><span>−{money(totals.discount)}</span></div>}
          <div className={`${styles.totalsRow} grand`}><span>Net à payer</span><span>{money(totals.netDue)}</span></div>
          {totals.down > 0 && (
            <>
              <div className={styles.totalsRow}><span>Acompte reçu</span><span>−{money(totals.down)}</span></div>
              <div className={styles.totalsRow}><span>Solde restant</span><span>{money(totals.balance)}</span></div>
            </>
          )}
        </div>
        {totals.discount > totals.total && <p className={financeStyles.errorMsg}>La remise ne peut pas dépasser le total.</p>}
        {totals.down > totals.netDue && <p className={financeStyles.errorMsg}>L&apos;acompte ne peut pas dépasser le net à payer.</p>}
      </div>

      <div className={financeStyles.actions}>
        <Button type="button" variant="secondary" onClick={() => router.push('/billing/invoices')}>Annuler</Button>
        <Button type="submit" variant="primary" isLoading={saving} disabled={!canSave}>Créer la facture</Button>
      </div>

      <Modal isOpen={clientModalOpen} onClose={() => setClientModalOpen(false)} title="Nouveau client">
        <ClientForm onSubmit={handleClientCreated} onCancel={() => setClientModalOpen(false)} />
      </Modal>
    </form>
  );
}
