'use client';

import { useState, useEffect } from 'react';
import ambassadorService from '../../../../services/ambassador.service';
import styles from '../ambassador.module.css';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); // '', 'registered', 'subscribed', 'qualified'

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter]);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await ambassadorService.getReferrals(params);
      setReferrals(response.data.referrals || []);
    } catch (error) {
      console.error('Erreur lors du chargement des filleuls', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, plan) => {
    if (plan === 'free' && (status === 'subscribed' || status === 'qualified')) {
      return <span className={`${styles.badge} ${styles.badgeDanger}`}>Non renouvelé</span>;
    }
    switch (status) {
      case 'registered': return <span className={`${styles.badge} ${styles.badgeInfo}`}>Inscrit</span>;
      case 'subscribed': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Abonné</span>;
      case 'qualified':  return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Qualifié</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div>
      <div className={styles.header} style={{ textAlign: 'left', marginBottom: 'var(--spacing-lg)' }}>
        <h2>Mes Filleuls</h2>
        <p className={styles.subtitle}>Consultez la liste des personnes que vous avez parrainées.</p>
      </div>

      {/* Filtres */}
      <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', gap: '8px' }}>
        <button 
          className={`${styles.navTab} ${statusFilter === '' ? styles.navTabActive : ''}`}
          onClick={() => setStatusFilter('')}
        >
          Tous
        </button>
        <button 
          className={`${styles.navTab} ${statusFilter === 'registered' ? styles.navTabActive : ''}`}
          onClick={() => setStatusFilter('registered')}
        >
          Inscrits
        </button>
        <button 
          className={`${styles.navTab} ${statusFilter === 'subscribed' ? styles.navTabActive : ''}`}
          onClick={() => setStatusFilter('subscribed')}
        >
          Abonnés
        </button>
        <button 
          className={`${styles.navTab} ${statusFilter === 'qualified' ? styles.navTabActive : ''}`}
          onClick={() => setStatusFilter('qualified')}
        >
          Qualifiés
        </button>
        <button 
          className={`${styles.navTab} ${statusFilter === 'expired' ? styles.navTabActive : ''}`}
          onClick={() => setStatusFilter('expired')}
        >
          Non renouvelés
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Chargement...</div>
        ) : referrals.length === 0 ? (
          <div className={styles.emptyState}>Aucun filleul trouvé pour ce filtre.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Source</th>
                <th>Statut</th>
                <th>Date d'inscription</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => (
                <tr key={ref.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-color)' }}>
                    {ref.referred_user_name || 'Utilisateur inconnu'}
                  </td>
                  <td>{ref.source || 'Lien/Code'}</td>
                  <td>{getStatusBadge(ref.status, ref.plan)}</td>
                  <td>{new Date(ref.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
