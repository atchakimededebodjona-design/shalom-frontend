'use client';

import { useState, useEffect } from 'react';
import ambassadorService from '../../../../services/ambassador.service';
import styles from '../ambassador.module.css';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Formulaire de retrait
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState('moov');
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [withRes, dashRes] = await Promise.all([
        ambassadorService.getWithdrawals(),
        ambassadorService.getDashboard()
      ]);
      setWithdrawals(withRes.data.withdrawals || []);
      setBalance(parseInt(dashRes.data.profile.available_balance, 10));
    } catch (error) {
      console.error('Erreur lors du chargement des retraits', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestWithdrawal = async (e) => {
    e.preventDefault();
    setRequesting(true);
    setError(null);
    setSuccess(false);

    try {
      await ambassadorService.requestWithdrawal({
        amount: parseInt(amount, 10),
        phone_number: phoneNumber,
        operator
      });
      setSuccess(true);
      setAmount('');
      setPhoneNumber('');
      fetchData(); // Rafraîchir la liste et le solde
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la demande de retrait.');
    } finally {
      setRequesting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className={`${styles.badge} ${styles.badgeWarning}`}>En cours</span>;
      case 'completed': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Effectué</span>;
      case 'failed': return <span className={`${styles.badge} ${styles.badgeInfo}`} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Échoué</span>;
      default: return <span className={styles.badge}>{status}</span>;
    }
  };

  return (
    <div>
      <div className={styles.header} style={{ textAlign: 'left', marginBottom: 'var(--spacing-lg)' }}>
        <h2>Retraits Mobile Money</h2>
        <p className={styles.subtitle}>Retirez vos commissions gagnées vers votre compte Mobile Money.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-2xl)' }}>
        
        {/* Formulaire de demande */}
        <div className={styles.joinContainer} style={{ margin: 0, padding: 'var(--spacing-xl)', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--secondary)' }}>Nouveau Retrait</h3>
          <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'rgba(194, 152, 47, 0.1)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Solde disponible</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {balance.toLocaleString('fr-FR')} FCFA
            </div>
          </div>

          {error && <div className={`${styles.badge} ${styles.badgeWarning}`} style={{ width: '100%', marginBottom: '1rem', padding: '1rem', display: 'block' }}>{error}</div>}
          {success && <div className={`${styles.badge} ${styles.badgeSuccess}`} style={{ width: '100%', marginBottom: '1rem', padding: '1rem', display: 'block' }}>Demande envoyée avec succès !</div>}

          <form onSubmit={handleRequestWithdrawal}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Montant (FCFA)</label>
              <input
                type="number"
                required
                min="5000"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 10000"
                style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              />
              <small style={{ color: 'var(--text-muted)' }}>Minimum: 5 000 FCFA</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Opérateur Mobile</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                <option value="moov">Moov Africa</option>
                <option value="mtn">MTN</option>
                <option value="orange">Orange</option>
                <option value="wave">Wave</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Numéro de Téléphone</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Ex: +22890000000"
                style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              />
              <small style={{ color: 'var(--text-muted)' }}>Format international requis (+228...)</small>
            </div>

            <button 
              type="submit" 
              className={styles.btnSubmit} 
              disabled={requesting || balance < 5000 || !amount || parseInt(amount, 10) < 5000 || parseInt(amount, 10) > balance}
            >
              {requesting ? 'Traitement...' : 'Demander le Retrait'}
            </button>
          </form>
        </div>

        {/* Historique des retraits */}
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--secondary)' }}>Historique</h3>
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.emptyState}>Chargement...</div>
            ) : withdrawals.length === 0 ? (
              <div className={styles.emptyState}>Aucune demande de retrait effectuée.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Opérateur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td>{new Date(w.requested_at).toLocaleDateString('fr-FR')}</td>
                      <td style={{ fontWeight: 700 }}>
                        {parseInt(w.amount, 10).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>{w.operator || 'Mobile Money'}</td>
                      <td>{getStatusBadge(w.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
