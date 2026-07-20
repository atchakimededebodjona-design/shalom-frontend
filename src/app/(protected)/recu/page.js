'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Wallet, Check, Clock, Plus } from 'lucide-react';
import { invoicesService } from '../../../services/invoices.service';
import { StatCard } from '../../../components/finance/StatCard';
import { formatFCFA, formatDateFR } from '../../../utils/format';
import styles from '../../../components/recu/recu.module.css';

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

export default function RecuOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [ov, list] = await Promise.all([
          invoicesService.overview(),
          invoicesService.list({ limit: 5 }),
        ]);
        setOverview(ov.data.overview);
        setInvoices(list.data.invoices);
      } catch (err) {
        setError(err.response?.data?.error || 'Impossible de charger les données de facturation.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="animate-pulse text-muted" style={{ padding: 'var(--spacing-xl)' }}>Chargement…</div>;
  }
  if (error) {
    return <p className={styles.errorMsg} role="alert" style={{ padding: 'var(--spacing-md)' }}>{error}</p>;
  }

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      <div className="flex items-center justify-between">
        <span className="text-muted text-sm">Chaque paiement crédite automatiquement votre portefeuille SHALOM.</span>
        <Link href="/recu/factures"><span className="flex items-center gap-xs text-primary font-bold hover-lift"><Plus size={18} /> Nouvelle facture</span></Link>
      </div>

      <div className={styles.statGrid}>
        <StatCard label="Factures" value={overview?.invoices_count ?? 0} icon={<FileText size={18} />} tone="navy" />
        <StatCard label="Total facturé" value={formatFCFA(overview?.total_invoiced)} icon={<FileText size={18} />} tone="primary" />
        <StatCard label="Encaissé" value={formatFCFA(overview?.total_paid)} icon={<Check size={18} />} tone="in" />
        <StatCard label="Restant dû" value={formatFCFA(overview?.total_outstanding)} icon={<Clock size={18} />} tone="out" />
      </div>

      <div className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>Dernières factures</h3>
          <Link href="/recu/factures" className="text-sm text-primary font-bold">Voir tout</Link>
        </div>
        {invoices.length === 0 ? (
          <p className={styles.empty}>Aucune facture pour l'instant.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Numéro</th><th>Client</th><th>Date</th><th>Statut</th><th className={styles.alignRight}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoice_number}</td>
                    <td>{inv.client_name || '—'}</td>
                    <td>{formatDateFR(inv.issue_date)}</td>
                    <td><span className={`${styles.badge} ${statusClass(inv.status)}`}>{STATUS_LABELS[inv.status] || inv.status}</span></td>
                    <td className={styles.alignRight}>{formatFCFA(inv.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-xs text-sm text-muted">
        <Wallet size={14} /> Les encaissements apparaissent dans votre <Link href="/wallet" className="text-primary">Portefeuille</Link> (source « Facture Reçu+ »).
      </div>
    </div>
  );
}
