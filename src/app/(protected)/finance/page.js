'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown, PiggyBank, Target, Plus } from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { StatCard } from '../../../components/finance/StatCard';
import { formatFCFA, formatDateFR, currentYearMonth, yearMonthLabel } from '../../../utils/format';
import styles from '../../../components/finance/finance.module.css';

const shiftMonth = (ym, delta) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function FinanceOverviewPage() {
  const [month, setMonth] = useState(currentYearMonth());
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, sm, tx, gl] = await Promise.all([
        financeService.getOverview(),
        financeService.getSummary(month),
        financeService.listTransactions({ limit: 5 }),
        financeService.listGoals('active'),
      ]);
      setOverview(ov.data.overview);
      setSummary(sm.data.summary);
      setRecent(tx.data.transactions);
      setGoals(gl.data.goals);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les données financières.');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  if (loading && !summary) {
    return <div className="animate-pulse text-muted" style={{ padding: 'var(--spacing-xl)' }}>Chargement…</div>;
  }
  if (error) {
    return <p className={styles.errorMsg} role="alert" style={{ padding: 'var(--spacing-md)' }}>{error}</p>;
  }

  const income = Number(summary?.total_income) || 0;
  const expense = Number(summary?.total_expense) || 0;
  const monthBalance = income - expense;
  const rate = Number(summary?.savings_rate) || 0;
  const breakdown = Object.entries(summary?.category_breakdown || {}).sort((a, b) => b[1] - a[1]);
  const totalExp = breakdown.reduce((sum, [, v]) => sum + Number(v), 0);

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      {/* Sélecteur de mois */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <button className={styles.iconBtn} onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Mois précédent"><ChevronLeft size={20} /></button>
          <strong style={{ minWidth: 150, textAlign: 'center', textTransform: 'capitalize' }}>{yearMonthLabel(month)}</strong>
          <button className={styles.iconBtn} onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Mois suivant"><ChevronRight size={20} /></button>
        </div>
        <Link href="/finance/transactions"><span className="flex items-center gap-xs text-primary font-bold hover-lift"><Plus size={18} /> Ajouter</span></Link>
      </div>

      {/* Stats du mois */}
      <div className={styles.statGrid}>
        <StatCard label="Revenus du mois" value={formatFCFA(income)} icon={<TrendingUp size={18} />} tone="in" />
        <StatCard label="Dépenses du mois" value={formatFCFA(expense)} icon={<TrendingDown size={18} />} tone="out" />
        <StatCard label="Solde du mois" value={formatFCFA(monthBalance)} icon={<Wallet size={18} />} tone={monthBalance >= 0 ? 'in' : 'out'} />
        <StatCard label="Taux d'épargne" value={`${rate.toFixed(0)} %`} icon={<PiggyBank size={18} />} tone="primary" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {/* Répartition des dépenses */}
        <div className={styles.card}>
          <div className={styles.sectionHead}><h3>Dépenses par catégorie</h3></div>
          {breakdown.length === 0 ? (
            <p className="text-muted text-sm">Aucune dépense ce mois-ci.</p>
          ) : (
            <div>
              {breakdown.map(([name, total]) => {
                const share = totalExp ? (Number(total) / totalExp) * 100 : 0;
                return (
                  <div key={name} className={styles.breakdownRow}>
                    <span style={{ flex: '0 0 32%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                    <span style={{ flex: 1, height: 8, background: 'var(--bg-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${Math.max(2, share)}%`, background: 'var(--out)' }} />
                    </span>
                    <span style={{ flex: 'none', textAlign: 'right', minWidth: 92 }}>
                      <span className="text-sm font-bold" style={{ display: 'block' }}>{formatFCFA(total)}</span>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>{share.toFixed(0)} % du total</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Objectifs actifs */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <h3>Objectifs</h3>
            <Link href="/finance/goals" className="text-sm text-primary font-bold">Voir tout</Link>
          </div>
          {goals.length === 0 ? (
            <p className="text-muted text-sm">Aucun objectif actif. <Link href="/finance/goals" className="text-primary">En créer un</Link>.</p>
          ) : (
            <div className="flex-col gap-md" style={{ display: 'flex' }}>
              {goals.slice(0, 3).map((g) => {
                const pct = Math.min(100, (Number(g.current_amount) / Number(g.target_amount)) * 100 || 0);
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">{g.title}</span>
                      <span className="text-muted">{pct.toFixed(0)} %</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={`${styles.progressFill} ${pct >= 100 ? styles.progressFillDone : ''}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-sm text-muted">{formatFCFA(g.current_amount)} / {formatFCFA(g.target_amount)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Transactions récentes */}
      <div className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>Transactions récentes</h3>
          <Link href="/finance/transactions" className="text-sm text-primary font-bold">Voir tout</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted text-sm">Aucune transaction pour l'instant.</p>
        ) : (
          <div className={styles.list}>
            {recent.map((t) => (
              <div key={t.id} className={styles.txRow}>
                <span className={styles.txIcon} style={{ background: t.type === 'income' ? 'var(--in-soft)' : 'var(--out-soft)' }}>
                  {t.category_icon || (t.type === 'income' ? '💰' : '💸')}
                </span>
                <div className={styles.txMain}>
                  <div className={styles.txTitle}>{t.category_name || t.note || (t.type === 'income' ? 'Revenu' : 'Dépense')}</div>
                  <div className={styles.txMeta}>{formatDateFR(t.transaction_date)}</div>
                </div>
                <span className={`${styles.txAmount} ${t.type === 'income' ? styles.amountIn : styles.amountOut}`}>
                  {t.type === 'income' ? '+' : '−'}{formatFCFA(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Récap global */}
      <div className="flex items-center gap-md text-sm text-muted" style={{ flexWrap: 'wrap' }}>
        <span className="flex items-center gap-xs"><Wallet size={14} /> Solde global : <strong style={{ color: 'var(--text-color)' }}>{formatFCFA(overview?.balance)}</strong></span>
        <span className="flex items-center gap-xs"><Target size={14} /> {overview?.active_goals || 0} objectif(s) actif(s)</span>
      </div>
    </div>
  );
}
