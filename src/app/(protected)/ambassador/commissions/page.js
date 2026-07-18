'use client';

import { useState, useEffect } from 'react';
import ambassadorService from '../../../../services/ambassador.service';
import styles from '../ambassador.module.css';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [commRes, sumRes] = await Promise.all([
        ambassadorService.getCommissions(),
        ambassadorService.getCommissionSummary()
      ]);
      setCommissions(commRes.data.commissions || []);
      setSummary(sumRes.data.summary);
    } catch (error) {
      console.error('Erreur lors du chargement des commissions', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className={`${styles.badge} ${styles.badgeWarning}`}>En attente</span>;
      case 'approved': return <span className={`${styles.badge} ${styles.badgeInfo}`}>Approuvée</span>;
      case 'paid':  return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Payée</span>;
      case 'cancelled': return <span className={styles.badge}>Annulée</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'subscription': return 'Nouvel Abonnement';
      case 'renewal': return 'Renouvellement';
      default: return type;
    }
  };

  return (
    <div>
      <div className={styles.header} style={{ textAlign: 'left', marginBottom: 'var(--spacing-lg)' }}>
        <h2>Historique des Commissions</h2>
        <p className={styles.subtitle}>Suivez les revenus générés par vos filleuls.</p>
      </div>

      {summary && (
        <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>En Attente</div>
            <div className={styles.statValue} style={{ color: '#ca8a04' }}>
              {parseInt(summary.pending.total, 10).toLocaleString('fr-FR')} FCFA
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Approuvées (Disponibles)</div>
            <div className={styles.statValue} style={{ color: '#2563eb' }}>
              {parseInt(summary.approved.total, 10).toLocaleString('fr-FR')} FCFA
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Déjà Payées</div>
            <div className={styles.statValue} style={{ color: '#16a34a' }}>
              {parseInt(summary.paid.total, 10).toLocaleString('fr-FR')} FCFA
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Chargement...</div>
        ) : commissions.length === 0 ? (
          <div className={styles.emptyState}>Aucune commission trouvée.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Montant</th>
                <th>Taux</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((comm) => (
                <tr key={comm.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-color)' }}>
                    {getTypeLabel(comm.type)}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {parseInt(comm.amount, 10).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{comm.rate_applied}%</td>
                  <td>{getStatusBadge(comm.status)}</td>
                  <td>{new Date(comm.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
