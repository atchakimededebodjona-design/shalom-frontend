'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useBilling } from '../layout';
import { billingService } from '../../../../services/billing.service';
import { formatFCFA, formatDateFR } from '../../../../utils/format';
import { getApiError } from '../../../../utils/apiError';
import { Button } from '../../../../components/ui/Button';
import { InvoiceStatusBadge } from '../../../../components/billing/InvoiceStatusBadge';
import financeStyles from '../../../../components/finance/finance.module.css';
import styles from '../../../../components/billing/billing.module.css';

const PAGE_SIZE = 20;
const STATUS_FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'partial', label: 'Partielles' },
  { value: 'paid', label: 'Payées' },
  { value: 'overdue', label: 'En retard' },
];

export default function BillingInvoicesPage() {
  const { business } = useBilling();
  const [status, setStatus] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (page, replace, statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      const res = await billingService.listInvoices(params);
      setInvoices((prev) => (replace ? res.data.invoices : [...prev, ...res.data.invoices]));
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les factures'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (business) fetchPage(1, true, status); }, [business, status, fetchPage]);

  if (!business) {
    return <p className={financeStyles.empty}>Configurez d&apos;abord votre entreprise depuis le tableau de bord.</p>;
  }

  return (
    <div>
      <div className={financeStyles.sectionHead}>
        <h2 style={{ margin: 0 }}>Factures</h2>
        <Link href="/billing/invoices/new" className="btn-primary flex items-center gap-xs" style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)' }}>
          <Plus size={16} /> Nouvelle facture
        </Link>
      </div>

      <div className={financeStyles.filters}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`${financeStyles.tab} ${status === f.value ? financeStyles.tabActive : ''}`}
            style={{ borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', padding: '4px 14px' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}

      {!loading && invoices.length === 0 ? (
        <p className={financeStyles.empty}>Aucune facture{status ? ' pour ce statut' : ''} pour l&apos;instant.</p>
      ) : (
        invoices.map((inv) => (
          <Link key={inv.id} href={`/billing/invoices/${inv.id}`} className={styles.rowCard} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.rowMain}>
              <div className={styles.rowTitle}>{inv.invoice_number}</div>
              <div className={styles.rowMeta}>
                {formatDateFR(inv.issue_date)}{inv.due_date ? ` · échéance ${formatDateFR(inv.due_date)}` : ''}
              </div>
            </div>
            <InvoiceStatusBadge status={inv.status} />
            <div className={styles.rowAmount}>{formatFCFA(inv.total - inv.discount_amount)}</div>
          </Link>
        ))
      )}

      {pagination?.has_next && (
        <div className="flex justify-center" style={{ marginTop: 'var(--spacing-md)' }}>
          <Button variant="secondary" isLoading={loading} onClick={() => fetchPage(pagination.page + 1, false, status)}>
            Charger plus
          </Button>
        </div>
      )}
    </div>
  );
}
