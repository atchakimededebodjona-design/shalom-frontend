'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import billingService from '../../../../services/billing.service';
import { getApiError } from '../../../../utils/apiError';
import { ArrowLeft, Plus } from 'lucide-react';
import styles from '../billing.module.css';

const STATUS_LABELS = { draft: 'Brouillon', partial: 'Partielle', paid: 'Payée', overdue: 'En retard' };
const STATUS_BADGE = {
  draft: styles.badgeDraft, partial: styles.badgePartial, paid: styles.badgePaid, overdue: styles.badgeOverdue,
};
const FILTERS = ['', 'draft', 'partial', 'paid', 'overdue'];

const formatAmount = (amount, currency) => `${Number(amount).toLocaleString('fr-FR')} ${currency || ''}`.trim();

export default function BillingInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [clientsById, setClientsById] = useState({});
  const [currency, setCurrency] = useState('XOF');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [status]);

  useEffect(() => {
    // Récupère les clients + la devise de l'entreprise une seule fois, pour
    // afficher le nom du client (l'API facture ne renvoie que client_id).
    (async () => {
      try {
        const [clientsRes, businessRes] = await Promise.all([
          billingService.listClients({ limit: 100 }),
          billingService.getMyBusiness(),
        ]);
        const map = {};
        for (const c of clientsRes.data.clients) map[c.id] = c.name;
        setClientsById(map);
        setCurrency(businessRes.data.business.currency || 'XOF');
      } catch {
        // silencieux — le nom du client repliera sur son id, non bloquant
      }
    })();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (status) params.status = status;
      const res = await billingService.listInvoices(params);
      setInvoices(res.data.invoices || []);
      setError('');
    } catch (err) {
      setError(getApiError(err, 'Erreur lors du chargement des factures.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.containerWide}>
      <Link href="/billing" className={styles.breadcrumb}>
        <ArrowLeft size={16} /> Reçu+
      </Link>

      <div className={styles.headRow}>
        <h1 className={styles.title}>Factures</h1>
        <button onClick={() => router.push('/billing/invoices/new')} className={styles.btnPrimary}>
          <Plus size={18} /> Nouvelle facture
        </button>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f || 'all'}
            onClick={() => setStatus(f)}
            className={`${styles.filterBtn} ${status === f ? styles.filterBtnActive : ''}`}
          >
            {f ? STATUS_LABELS[f] : 'Toutes'}
          </button>
        ))}
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div className={styles.loadingState}>Chargement…</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Statut</th>
                <th>Total</th>
                <th>Payé</th>
                <th>Échéance</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={styles.tableRowClickable}
                  onClick={() => router.push(`/billing/invoices/${inv.id}`)}
                >
                  <td>{inv.invoice_number}</td>
                  <td>{clientsById[inv.client_id] || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${STATUS_BADGE[inv.status] || styles.badgeDraft}`}>
                      {STATUS_LABELS[inv.status] || inv.status}
                    </span>
                  </td>
                  <td>{formatAmount(inv.total, currency)}</td>
                  <td>{formatAmount(inv.amount_paid, currency)}</td>
                  <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.emptyRow}>Aucune facture pour l&apos;instant.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
