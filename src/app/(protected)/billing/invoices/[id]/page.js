'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import billingService from '../../../../../services/billing.service';
import { getApiError } from '../../../../../utils/apiError';
import { resolveMediaUrl } from '../../../../../utils/resolveMediaUrl';
import { ArrowLeft, Printer, MessageCircle, Trash2, Plus } from 'lucide-react';
import styles from '../../billing.module.css';

const STATUS_LABELS = { draft: 'Brouillon', partial: 'Partielle', paid: 'Payée', overdue: 'En retard' };
const STATUS_BADGE = {
  draft: styles.badgeDraft, partial: styles.badgePartial, paid: styles.badgePaid, overdue: styles.badgeOverdue,
};

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'card', label: 'Carte' },
  { value: 'other', label: 'Autre' },
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [business, setBusiness] = useState(null);
  const [clientName, setClientName] = useState('');
  const [currency, setCurrency] = useState('XOF');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: '', payment_method: 'cash', reference_id: '', payment_date: '' });

  const formatAmount = (amount) => `${Number(amount).toLocaleString('fr-FR')} ${currency}`;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [invoiceRes, paymentsRes, businessRes] = await Promise.all([
        billingService.getInvoiceById(invoiceId),
        billingService.listPaymentsByInvoice(invoiceId),
        billingService.getMyBusiness(),
      ]);
      setInvoice(invoiceRes.data.invoice);
      setPayments(paymentsRes.data.payments || []);
      setBusiness(businessRes.data.business);
      setCurrency(businessRes.data.business.currency || 'XOF');

      try {
        const clientsRes = await billingService.listClients({ limit: 100 });
        const client = clientsRes.data.clients.find((c) => c.id === invoiceRes.data.invoice.client_id);
        setClientName(client?.name || '');
      } catch {
        // non bloquant
      }
    } catch (err) {
      setError(getApiError(err, 'Erreur lors du chargement de la facture.'));
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteInvoice = async () => {
    if (!confirm('Supprimer cette facture ?')) return;
    try {
      await billingService.deleteInvoice(invoiceId);
      router.push('/billing/invoices');
    } catch (err) {
      setActionError(getApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  const handlePrint = async () => {
    setActionError('');
    try {
      await billingService.openPrintView(invoiceId);
    } catch (err) {
      setActionError(getApiError(err, "Erreur lors de l'ouverture de l'impression."));
    }
  };

  const handleWhatsapp = async () => {
    setActionError('');
    try {
      const res = await billingService.getWhatsappLink(invoiceId);
      window.open(res.data.whatsapp_url, '_blank');
    } catch (err) {
      setActionError(getApiError(err, "Erreur lors de la génération du lien WhatsApp."));
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setActionError('');
    setPaymentSaving(true);
    try {
      await billingService.createPayment(invoiceId, {
        amount: parseInt(paymentForm.amount, 10),
        payment_method: paymentForm.payment_method,
        reference_id: paymentForm.reference_id || undefined,
        payment_date: paymentForm.payment_date || undefined,
      });
      setShowPaymentForm(false);
      setPaymentForm({ amount: '', payment_method: 'cash', reference_id: '', payment_date: '' });
      fetchAll();
    } catch (err) {
      setActionError(getApiError(err, "Erreur lors de l'enregistrement du paiement."));
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('Annuler ce paiement ?')) return;
    setActionError('');
    try {
      await billingService.deletePayment(paymentId);
      fetchAll();
    } catch (err) {
      setActionError(getApiError(err, "Erreur lors de l'annulation du paiement."));
    }
  };

  if (loading) {
    return (
      <div className={styles.containerWide}>
        <div className={styles.loadingState}>Chargement…</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className={styles.containerWide}>
        <Link href="/billing/invoices" className={styles.breadcrumb}>
          <ArrowLeft size={16} /> Factures
        </Link>
        <div className={styles.errorBanner}>{error || 'Facture introuvable.'}</div>
      </div>
    );
  }

  const remaining = invoice.total - (invoice.discount_amount || 0) - invoice.amount_paid;

  return (
    <div className={styles.containerWide}>
      <Link href="/billing/invoices" className={styles.breadcrumb}>
        <ArrowLeft size={16} /> Factures
      </Link>

      {actionError && <div className={styles.errorBanner}>{actionError}</div>}

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

      <div className={styles.invoiceHeader}>
        <div>
          <div className={styles.invoiceNumber}>{invoice.invoice_number}</div>
          <div className={styles.invoiceMeta}>
            {clientName && <>Client : <strong>{clientName}</strong> · </>}
            Émise le {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
            {invoice.due_date && ` · Échéance le ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`}
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <span className={`${styles.badge} ${STATUS_BADGE[invoice.status] || styles.badgeDraft}`}>
              {STATUS_LABELS[invoice.status] || invoice.status}
            </span>
          </div>
        </div>
        <div className={styles.actionBar}>
          <button onClick={handlePrint} className={styles.btnSecondary}>
            <Printer size={16} /> Imprimer
          </button>
          <button onClick={handleWhatsapp} className={styles.btnSecondary}>
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button onClick={handleDeleteInvoice} className={styles.btnDanger}>
            <Trash2 size={16} /> Supprimer
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Articles</h2>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Description</th>
              <th>Qté</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{Number(item.quantity)}</td>
                <td>{formatAmount(item.unit_price)}</td>
                <td>{formatAmount(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totalsBox} style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className={styles.totalsRow}><span>Sous-total</span><span>{formatAmount(invoice.subtotal)}</span></div>
          <div className={styles.totalsRow}><span>TVA ({Number(invoice.tax_rate)}%)</span><span>{formatAmount(invoice.tax_amount)}</span></div>
          <div className={`${styles.totalsRow} ${styles.totalsRowFinal}`}><span>Total</span><span>{formatAmount(invoice.total)}</span></div>
          {invoice.discount_amount > 0 && (
            <div className={styles.totalsRow}><span>Remise</span><span>-{formatAmount(invoice.discount_amount)}</span></div>
          )}
          <div className={styles.totalsRow}><span>Payé</span><span>{formatAmount(invoice.amount_paid)}</span></div>
          <div className={`${styles.totalsRow} ${styles.totalsRowDue}`}><span>Solde dû</span><span>{formatAmount(remaining)}</span></div>
        </div>

        {invoice.notes && (
          <p className={styles.helperText} style={{ marginTop: 'var(--spacing-lg)' }}>
            <strong>Notes :</strong> {invoice.notes}
          </p>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.headRow} style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Paiements</h2>
          {remaining > 0 && !showPaymentForm && (
            <button onClick={() => setShowPaymentForm(true)} className={styles.btnPrimary}>
              <Plus size={16} /> Enregistrer un paiement
            </button>
          )}
        </div>

        {showPaymentForm && (
          <form onSubmit={handleAddPayment} className={styles.form} style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className={styles.formGrid}>
              <div>
                <label className={styles.label}>Montant</label>
                <input
                  type="number"
                  min="1"
                  max={remaining}
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
                <p className={styles.helperText}>Restant dû : {formatAmount(remaining)}</p>
              </div>
              <div>
                <label className={styles.label}>Méthode</label>
                <select value={paymentForm.payment_method} onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Référence</label>
                <input type="text" value={paymentForm.reference_id} onChange={(e) => setPaymentForm({ ...paymentForm, reference_id: e.target.value })} />
              </div>
              <div>
                <label className={styles.label}>Date de paiement</label>
                <input type="date" value={paymentForm.payment_date} onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowPaymentForm(false)} className={styles.btnSecondary}>Annuler</button>
              <button type="submit" disabled={paymentSaving} className={styles.btnPrimary}>
                {paymentSaving ? 'Enregistrement…' : 'Enregistrer le paiement'}
              </button>
            </div>
          </form>
        )}

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Référence</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.payment_date).toLocaleDateString('fr-FR')}</td>
                  <td>{formatAmount(p.amount)}</td>
                  <td>{PAYMENT_METHODS.find((m) => m.value === p.payment_method)?.label || p.payment_method}</td>
                  <td>{p.reference_id || '—'}</td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => handleDeletePayment(p.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>Aucun paiement enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
