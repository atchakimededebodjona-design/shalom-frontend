'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Building2, Users, FileText, AlertCircle, Plus } from 'lucide-react';
import { useBilling } from './layout';
import { billingService } from '../../../services/billing.service';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { formatFCFA, formatDateFR } from '../../../utils/format';
import { getApiError } from '../../../utils/apiError';
import financeStyles from '../../../components/finance/finance.module.css';
import styles from '../../../components/billing/billing.module.css';
import { BusinessForm } from '../../../components/billing/BusinessForm';
import { InvoiceStatusBadge } from '../../../components/billing/InvoiceStatusBadge';

export default function BillingDashboard() {
  const { business, refreshBusiness } = useBilling();

  if (!business) return <Onboarding onCreated={refreshBusiness} />;
  return <Dashboard business={business} />;
}

function Onboarding({ onCreated }) {
  const [error, setError] = useState('');

  const handleCreate = async (payload) => {
    try {
      await billingService.createBusiness(payload);
      await onCreated();
    } catch (err) {
      setError(getApiError(err, "Impossible de créer l'entreprise"));
      throw err;
    }
  };

  return (
    <div className={styles.onboarding}>
      <div className={styles.onboardingIcon}><Building2 size={30} /></div>
      <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Bienvenue sur Reçu+</h2>
      <p className="text-muted mb-lg">
        Renseignez les coordonnées de votre entreprise (et son logo) pour commencer à
        générer des factures professionnelles pour vos clients.
      </p>
      {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}
      <div className={financeStyles.card} style={{ textAlign: 'left' }}>
        <BusinessForm onSubmit={handleCreate} submitLabel="Créer mon entreprise" />
      </div>
    </div>
  );
}

function Dashboard({ business }) {
  const [clientsTotal, setClientsTotal] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoicesTotal, setInvoicesTotal] = useState(null);
  const [unpaidCount, setUnpaidCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, recentRes, unpaidRes] = await Promise.all([
        billingService.listClients({ limit: 1 }),
        billingService.listInvoices({ limit: 5 }),
        billingService.listInvoices({ limit: 1, status: 'overdue' }),
      ]);
      setClientsTotal(clientsRes.data.pagination.total_count);
      setInvoices(recentRes.data.invoices);
      setInvoicesTotal(recentRes.data.pagination.total_count);
      setUnpaidCount(unpaidRes.data.pagination.total_count);
    } catch {
      // Tableau de bord non critique : on laisse les compteurs vides plutôt
      // que de bloquer toute la page sur une erreur d'agrégation.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      {/* Carte entreprise */}
      <div className={financeStyles.card}>
        <div className="flex items-center gap-md" style={{ flexWrap: 'wrap' }}>
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveMediaUrl(business.logo_url)} alt="Logo" className={styles.logoPreview} />
          ) : (
            <div className={styles.logoPlaceholder}><Building2 size={24} /></div>
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ margin: 0 }}>{business.name}</h2>
            <p className="text-muted text-sm" style={{ margin: '2px 0 0' }}>
              {[business.address, business.phone].filter(Boolean).join(' · ') || 'Coordonnées non renseignées'}
            </p>
          </div>
          <Link href="/billing/invoices/new" className="btn-primary flex items-center gap-xs" style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-md)' }}>
            <Plus size={16} /> Nouvelle facture
          </Link>
        </div>
      </div>

      {/* Stats rapides */}
      <div className={styles.statGrid}>
        <div className={financeStyles.stat}>
          <div className={financeStyles.statHead}><Users size={16} /> Clients</div>
          <div className={financeStyles.statValue}>{loading ? '—' : clientsTotal}</div>
        </div>
        <div className={financeStyles.stat}>
          <div className={financeStyles.statHead}><FileText size={16} /> Factures émises</div>
          <div className={financeStyles.statValue}>{loading ? '—' : invoicesTotal}</div>
        </div>
        <div className={financeStyles.stat}>
          <div className={financeStyles.statHead}><AlertCircle size={16} /> En retard</div>
          <div className={financeStyles.statValue} style={{ color: unpaidCount > 0 ? 'var(--out)' : undefined }}>
            {loading ? '—' : unpaidCount}
          </div>
        </div>
      </div>

      {/* Dernières factures */}
      <div className={financeStyles.card}>
        <div className={financeStyles.sectionHead}>
          <h3>Dernières factures</h3>
          <Link href="/billing/invoices" className="text-sm text-primary font-bold">Voir tout</Link>
        </div>
        {invoices.length === 0 ? (
          <p className={financeStyles.empty}>Aucune facture pour l&apos;instant.</p>
        ) : (
          invoices.map((inv) => (
            <Link key={inv.id} href={`/billing/invoices/${inv.id}`} className={styles.rowCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>{inv.invoice_number}</div>
                <div className={styles.rowMeta}>{formatDateFR(inv.issue_date)}</div>
              </div>
              <InvoiceStatusBadge status={inv.status} />
              <div className={styles.rowAmount}>{formatFCFA(inv.total - inv.discount_amount)}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
