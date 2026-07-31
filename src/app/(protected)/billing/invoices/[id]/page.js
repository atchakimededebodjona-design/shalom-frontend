'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, Download, Trash2, CircleDollarSign, X } from 'lucide-react';
import { billingService } from '../../../../../services/billing.service';
import { formatFCFA, formatDateFR } from '../../../../../utils/format';
import { getApiError } from '../../../../../utils/apiError';
import { Button } from '../../../../../components/ui/Button';
import { Modal } from '../../../../../components/ui/Modal';
import { InvoiceStatusBadge } from '../../../../../components/billing/InvoiceStatusBadge';
import { PaymentForm } from '../../../../../components/billing/PaymentForm';
import financeStyles from '../../../../../components/finance/finance.module.css';
import styles from '../../../../../components/billing/billing.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [invRes, payRes] = await Promise.all([
        billingService.getInvoice(id),
        billingService.listPayments(id),
      ]);
      setInvoice(invRes.data.invoice);
      setPayments(payRes.data.payments);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger la facture'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-muted">Chargement…</p>;
  if (error || !invoice) return <p className={financeStyles.errorMsg} role="alert">{error || 'Facture introuvable'}</p>;

  const balanceDue = invoice.total - invoice.discount_amount - invoice.amount_paid;

  const handlePrint = () => {
    window.open(`${API_URL}/billing/invoices/${id}/print`, '_blank');
  };

  const handleDownload = async () => {
    setSharing(true);
    setError('');
    try {
      // Importer dynamiquement pour ne pas alourdir la page
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      // Créer une iframe invisible pour rendre la facture exacte générée par le backend
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '720px';
      iframe.style.height = '1400px';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      
      const htmlRes = await fetch(`${API_URL}/billing/invoices/${id}/print`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // Si sécurisé
      });
      const htmlText = await htmlRes.text();
      
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(htmlText);
      iframe.contentWindow.document.close();
      
      // Attendre que l'image du logo soit chargée
      await new Promise(r => setTimeout(r, 1500));
      
      // Nettoyer l'iframe des éléments qui ne doivent pas apparaître sur le PDF (bouton Imprimer, statuts, etc.)
      const elementsToHide = iframe.contentWindow.document.querySelectorAll('.no-print');
      elementsToHide.forEach(el => el.remove());
      
      // Capturer le contenu de l'iframe
      const canvas = await html2canvas(iframe.contentWindow.document.body, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `Facture_${invoice.invoice_number}.pdf`;
      pdf.save(fileName);
      
      document.body.removeChild(iframe);
      
    } catch (err) {
      console.error(err);
      setError(getApiError(err, "Impossible de générer le PDF."));
    } finally {
      setSharing(false);
    }
  };

  const handleAddPayment = async (payload) => {
    await billingService.createPayment(id, payload);
    setPaymentModalOpen(false);
    await load();
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('Annuler ce paiement ? Le crédit correspondant sera repris sur le portefeuille.')) return;
    try {
      await billingService.deletePayment(paymentId);
      await load();
    } catch (err) {
      alert(getApiError(err, "Impossible d'annuler ce paiement"));
    }
  };

  const handleDeleteInvoice = async () => {
    const warn = invoice.amount_paid > 0
      ? `Cette facture a déjà reçu ${formatFCFA(invoice.amount_paid)} de paiements. La supprimer n'annule pas ces paiements sur votre portefeuille. Continuer ?`
      : 'Supprimer cette facture définitivement ?';
    if (!confirm(warn)) return;
    setDeleting(true);
    try {
      await billingService.deleteInvoice(id);
      router.push('/billing/invoices');
    } catch (err) {
      alert(getApiError(err, 'Impossible de supprimer cette facture'));
      setDeleting(false);
    }
  };

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      <div className={financeStyles.card}>
        <div className={financeStyles.sectionHead} style={{ flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0 }}>{invoice.invoice_number}</h2>
            <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>
              Émise le {formatDateFR(invoice.issue_date)}{invoice.due_date ? ` · Échéance ${formatDateFR(invoice.due_date)}` : ''}
            </p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
          <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-xs"><Printer size={16} /> Imprimer</Button>
          <Button variant="secondary" onClick={handleDownload} isLoading={sharing} className="flex items-center gap-xs"><Download size={16} /> Télécharger PDF</Button>
          {balanceDue > 0 && (
            <Button variant="accent" onClick={() => setPaymentModalOpen(true)} className="flex items-center gap-xs">
              <CircleDollarSign size={16} /> Enregistrer un paiement
            </Button>
          )}
          <Button variant="secondary" onClick={handleDeleteInvoice} isLoading={deleting} className="flex items-center gap-xs" style={{ color: 'var(--out)' }}>
            <Trash2 size={16} /> Supprimer
          </Button>
        </div>

        {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}

        {/* Articles */}
        <div className={styles.itemsTable} style={{ marginBottom: 'var(--spacing-md)' }}>
          <div className={styles.itemRow} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>Description</span><span>Qté</span><span>Prix unitaire</span><span>Total</span><span />
          </div>
          {invoice.items.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <span>{item.description}</span>
              <span>{Number(item.quantity)}</span>
              <span>{formatFCFA(item.unit_price)}</span>
              <span className={styles.lineTotal}>{formatFCFA(item.line_total)}</span>
              <span />
            </div>
          ))}
        </div>

        <div className={styles.totalsBox}>
          <div className={styles.totalsRow}><span>Sous-total</span><span>{formatFCFA(invoice.subtotal)}</span></div>
          <div className={styles.totalsRow}><span>TVA ({Number(invoice.tax_rate)}%)</span><span>{formatFCFA(invoice.tax_amount)}</span></div>
          {invoice.discount_amount > 0 && <div className={styles.totalsRow}><span>Remise</span><span>−{formatFCFA(invoice.discount_amount)}</span></div>}
          <div className={`${styles.totalsRow} grand`}><span>Total</span><span>{formatFCFA(invoice.total - invoice.discount_amount)}</span></div>
          <div className={styles.totalsRow}><span>Payé</span><span>{formatFCFA(invoice.amount_paid)}</span></div>
          <div className={styles.totalsRow} style={{ fontWeight: 700, color: balanceDue > 0 ? 'var(--out)' : 'var(--in)' }}>
            <span>Solde dû</span><span>{formatFCFA(balanceDue)}</span>
          </div>
        </div>

        {invoice.notes && (
          <p className="text-sm text-muted" style={{ marginTop: 'var(--spacing-md)' }}><strong>Notes :</strong> {invoice.notes}</p>
        )}
      </div>

      {/* Paiements */}
      <div className={financeStyles.card}>
        <h3 style={{ marginTop: 0 }}>Historique des paiements</h3>
        {payments.length === 0 ? (
          <p className={financeStyles.empty}>Aucun paiement enregistré pour l&apos;instant.</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className={styles.rowCard}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>{formatFCFA(p.amount)}</div>
                <div className={styles.rowMeta}>{formatDateFR(p.payment_date)} · {p.payment_method}{p.reference_id ? ` · ${p.reference_id}` : ''}</div>
              </div>
              <button type="button" className={`${financeStyles.iconBtn} ${financeStyles.iconBtnDanger}`} onClick={() => handleDeletePayment(p.id)} aria-label="Annuler ce paiement">
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Enregistrer un paiement">
        <PaymentForm maxAmount={balanceDue} onSubmit={handleAddPayment} onCancel={() => setPaymentModalOpen(false)} />
      </Modal>
    </div>
  );
}
