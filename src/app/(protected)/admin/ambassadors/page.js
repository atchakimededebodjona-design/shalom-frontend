'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import ambassadorService from '../../../../services/ambassador.service';
import { getApiError } from '../../../../utils/apiError';
import { BackButton } from '../../../../components/ui/BackButton';
import styles from './ambassadors.module.css';

const PAGE_SIZE = 20;

const formaterDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const formaterFcfa = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

const badgeClass = (styles, value) => {
  const key = `badge${value ? value.charAt(0).toUpperCase() + value.slice(1) : ''}`;
  return styles[key] || '';
};

export default function AdminAmbassadorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('ambassadors');

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push('/login'); return; }
      if (!user.is_admin) router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || !user.is_admin) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md"><BackButton fallbackHref="/dashboard" /></div>
      <h1 className="text-primary flex items-center gap-sm mb-sm">
        <Award size={26} /> Ambassadeurs
      </h1>
      <p className="text-muted mb-lg">Certification, statuts, commissions et retraits du programme ambassadeur.</p>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'ambassadors' ? styles.tabActive : ''}`} onClick={() => setTab('ambassadors')}>Ambassadeurs</button>
        <button className={`${styles.tab} ${tab === 'commissions' ? styles.tabActive : ''}`} onClick={() => setTab('commissions')}>Commissions</button>
        <button className={`${styles.tab} ${tab === 'withdrawals' ? styles.tabActive : ''}`} onClick={() => setTab('withdrawals')}>Retraits</button>
      </div>

      {tab === 'ambassadors' && <AmbassadorsTab />}
      {tab === 'commissions' && <CommissionsTab />}
      {tab === 'withdrawals' && <WithdrawalsTab />}
    </div>
  );
}

// =========================================================================
// Onglet Ambassadeurs
// =========================================================================
function AmbassadorsTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ambassadorService.adminList({
        level: level || undefined, status: status || undefined, page, limit: PAGE_SIZE,
      });
      setItems(res.data.ambassadors);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les ambassadeurs'));
    } finally {
      setLoading(false);
    }
  }, [level, status, page]);

  useEffect(() => { charger(); }, [charger]);

  const changerLevel = (v) => { setLevel(v); setPage(1); };
  const changerStatus = (v) => { setStatus(v); setPage(1); };

  const toggleLevel = async (amb) => {
    const nouveauNiveau = amb.level === 'certified' ? 'standard' : 'certified';
    setBusyId(amb.id);
    setError('');
    try {
      await ambassadorService.adminSetLevel(amb.id, nouveauNiveau);
      setItems((prev) => prev.map((it) => (it.id === amb.id ? { ...it, level: nouveauNiveau } : it)));
    } catch (err) {
      setError(getApiError(err, 'Action impossible'));
    } finally {
      setBusyId(null);
    }
  };

  const changerStatutAmbassadeur = async (amb, nouveauStatut) => {
    setBusyId(amb.id);
    setError('');
    try {
      await ambassadorService.adminSetStatus(amb.id, nouveauStatut);
      setItems((prev) => prev.map((it) => (it.id === amb.id ? { ...it, status: nouveauStatut } : it)));
    } catch (err) {
      setError(getApiError(err, 'Action impossible'));
    } finally {
      setBusyId(null);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.card}>
      <div className={styles.filters}>
        <select className={styles.select} value={level} onChange={(e) => changerLevel(e.target.value)}>
          <option value="">Tous les niveaux</option>
          <option value="standard">Standard</option>
          <option value="certified">Certifié</option>
        </select>
        <select className={styles.select} value={status} onChange={(e) => changerStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="pending_review">En attente</option>
        </select>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Aucun ambassadeur pour ce filtre.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Nom</th><th>Email</th><th>Niveau</th><th>Statut</th><th>Parrainages</th><th>Solde</th><th>Depuis</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((amb) => (
                <tr key={amb.id}>
                  <td>{amb.display_name || '—'}</td>
                  <td>{amb.email}</td>
                  <td><span className={`${styles.badge} ${badgeClass(styles, amb.level)}`}>{amb.level === 'certified' ? 'Certifié' : 'Standard'}</span></td>
                  <td><span className={`${styles.badge} ${badgeClass(styles, amb.status)}`}>{amb.status}</span></td>
                  <td>{amb.total_referrals ?? 0}</td>
                  <td>{formaterFcfa(amb.available_balance)}</td>
                  <td>{formaterDate(amb.joined_at)}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconBtn}
                        disabled={busyId === amb.id}
                        onClick={() => toggleLevel(amb)}
                        title={amb.level === 'certified' ? 'Rétrograder en standard' : 'Certifier cet ambassadeur'}
                      >
                        {amb.level === 'certified' ? 'Rétrograder' : 'Certifier'}
                      </button>
                      <select
                        className={styles.select}
                        value={amb.status}
                        disabled={busyId === amb.id}
                        onChange={(e) => changerStatutAmbassadeur(amb, e.target.value)}
                      >
                        <option value="active">Actif</option>
                        <option value="suspended">Suspendu</option>
                        <option value="pending_review">En attente</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className={styles.pager}>
          <button className={styles.pagerBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Précédent</button>
          <span className="text-muted text-sm">Page {page} / {pages}</span>
          <button className={styles.pagerBtn} disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Suivant →</button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Onglet Commissions
// =========================================================================
function CommissionsTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ambassadorService.adminListCommissions({ status: status || undefined, page, limit: PAGE_SIZE });
      setItems(res.data.commissions);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les commissions'));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { charger(); }, [charger]);

  const approuver = async (com) => {
    setBusyId(com.id);
    setError('');
    try {
      await ambassadorService.adminApproveCommission(com.id);
      setItems((prev) => prev.map((it) => (it.id === com.id ? { ...it, status: 'approved' } : it)));
    } catch (err) {
      setError(getApiError(err, 'Action impossible'));
    } finally {
      setBusyId(null);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.card}>
      <div className={styles.filters}>
        <select className={styles.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvée</option>
          <option value="paid">Payée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Aucune commission pour ce filtre.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Ambassadeur</th><th>Filleul</th><th>Montant</th><th>Statut</th><th>Période</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((com) => (
                <tr key={com.id}>
                  <td>{com.ambassador_name || '—'}</td>
                  <td>{com.referred_name || '—'}</td>
                  <td>{formaterFcfa(com.amount)}</td>
                  <td><span className={`${styles.badge} ${badgeClass(styles, com.status)}`}>{com.status}</span></td>
                  <td>{com.period_month || '—'}</td>
                  <td>
                    {com.status === 'pending' && (
                      <button className={styles.iconBtn} disabled={busyId === com.id} onClick={() => approuver(com)}>
                        Approuver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className={styles.pager}>
          <button className={styles.pagerBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Précédent</button>
          <span className="text-muted text-sm">Page {page} / {pages}</span>
          <button className={styles.pagerBtn} disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Suivant →</button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Onglet Retraits
// =========================================================================
function WithdrawalsTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ambassadorService.adminListWithdrawals({ status: status || undefined, page, limit: PAGE_SIZE });
      setItems(res.data.withdrawals);
      setTotal(res.data.pagination.total);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les retraits'));
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => { charger(); }, [charger]);

  const traiter = async (w, nouveauStatut) => {
    setBusyId(w.id);
    setError('');
    try {
      await ambassadorService.adminProcessWithdrawal(w.id, { status: nouveauStatut });
      setItems((prev) => prev.map((it) => (it.id === w.id ? { ...it, status: nouveauStatut } : it)));
    } catch (err) {
      setError(getApiError(err, 'Action impossible'));
    } finally {
      setBusyId(null);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className={styles.card}>
      <div className={styles.filters}>
        <select className={styles.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="processing">En traitement</option>
          <option value="completed">Complété</option>
          <option value="failed">Échoué</option>
          <option value="cancelled">Annulé</option>
        </select>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>Aucun retrait pour ce filtre.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Ambassadeur</th><th>Montant</th><th>Opérateur</th><th>Téléphone</th><th>Statut</th><th>Demandé le</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((w) => (
                <tr key={w.id}>
                  <td>{w.ambassador_name || '—'}<div className="text-muted text-sm">{w.ambassador_email}</div></td>
                  <td>{formaterFcfa(w.amount)}</td>
                  <td>{w.operator}</td>
                  <td>{w.phone_number}</td>
                  <td><span className={`${styles.badge} ${badgeClass(styles, w.status)}`}>{w.status}</span></td>
                  <td>{formaterDate(w.requested_at)}</td>
                  <td>
                    <select
                      className={styles.select}
                      value={w.status}
                      disabled={busyId === w.id}
                      onChange={(e) => traiter(w, e.target.value)}
                    >
                      <option value="pending" disabled>En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="completed">Complété</option>
                      <option value="failed">Échoué</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className={styles.pager}>
          <button className={styles.pagerBtn} disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Précédent</button>
          <span className="text-muted text-sm">Page {page} / {pages}</span>
          <button className={styles.pagerBtn} disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Suivant →</button>
        </div>
      )}
    </div>
  );
}
