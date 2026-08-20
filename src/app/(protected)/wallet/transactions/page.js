'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Undo2 } from 'lucide-react';
import { walletService } from '../../../../services/wallet.service';
import { usePaginatedFetch } from '../../../../hooks/usePaginatedFetch';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { MovementForm } from '../../../../components/wallet/MovementForm';
import { formatFCFA, formatDateFR } from '../../../../utils/format';
import styles from '../../../../components/finance/finance.module.css';

const PAGE_SIZE = 20;

const SOURCE_LABEL = {
  manual: 'Manuel',
  topup: 'Rechargement',
  withdrawal: 'Retrait',
  subscription: 'Abonnement',
  credit_purchase: 'Achat de crédits',
  invoice: 'Facture',
  commission: 'Commission',
  refund: 'Remboursement',
  reversal: 'Annulation',
  adjustment: 'Ajustement',
};

const STATUS_BADGE = {
  pending: { label: 'En attente', cls: '' },
  reversed: { label: 'Annulé', cls: 'badgeOut' },
  failed: { label: 'Échoué', cls: 'badgeOut' },
  cancelled: { label: 'Annulé', cls: 'badgeOut' },
};

export default function WalletTransactionsPage() {
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ type: '', source: '' });
  const [creating, setCreating] = useState(false);

  const fetchPage = useCallback(async (page) => {
    const params = { page, limit: PAGE_SIZE };
    if (filters.type) params.type = filters.type;
    if (filters.source) params.source = filters.source;
    const res = await walletService.listTransactions(params);
    return { items: res.data.transactions, pagination: res.data.pagination };
  }, [filters]);

  const { items, pagination, loading, error, setError, reload, loadMore } = usePaginatedFetch(fetchPage, {
    errorMessage: 'Chargement impossible.',
  });

  useEffect(() => {
    walletService.listCategories().then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const submitMovement = async (payload) => {
    const body = { amount: payload.amount, category_id: payload.category_id, description: payload.description };
    if (payload.type === 'credit') await walletService.createIncome(body);
    else await walletService.createExpense(body);
    setCreating(false);
    await reload();
  };

  const reverse = async (t) => {
    if (!window.confirm('Annuler ce mouvement ? Un mouvement inverse sera créé (rien n\'est supprimé).')) return;
    const reason = window.prompt('Raison de l\'annulation (facultatif) :', '') || undefined;
    try {
      await walletService.reverseTransaction(t.id, reason ? { reason } : {});
      await reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Annulation impossible.');
    }
  };

  return (
    <div>
      <div className={styles.filters}>
        <select className={styles.select} style={{ width: 'auto' }} value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="">Tous les types</option>
          <option value="credit">Crédits (entrées)</option>
          <option value="debit">Débits (sorties)</option>
        </select>
        <select className={styles.select} style={{ width: 'auto' }} value={filters.source}
          onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}>
          <option value="">Toutes sources</option>
          {Object.entries(SOURCE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setCreating(true)}><span className="flex items-center gap-xs"><Plus size={16} /> Nouveau</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.card}>
        {loading ? (
          <p className="animate-pulse text-muted">Chargement…</p>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            Aucun mouvement.{' '}
            <button className="text-primary font-bold" onClick={() => setCreating(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              En ajouter un
            </button>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {items.map((t) => {
                const isCredit = t.type === 'credit';
                const reversed = t.status === 'reversed';
                const badge = STATUS_BADGE[t.status];
                return (
                  <div key={t.id} className={styles.txRow}>
                    <span className={styles.txIcon} style={{ background: isCredit ? 'var(--in-soft)' : 'var(--out-soft)' }}>
                      {t.category_icon || (isCredit ? '💰' : '💸')}
                    </span>
                    <div className={styles.txMain}>
                      <div className={styles.txTitle} style={reversed ? { textDecoration: 'line-through', opacity: 0.7 } : undefined}>
                        {t.category_name || t.description || (isCredit ? 'Crédit' : 'Débit')}
                      </div>
                      <div className={styles.txMeta}>
                        {formatDateFR(t.created_at)} · {SOURCE_LABEL[t.source] || t.source}
                        {badge ? <span className={`${styles.badge} ${styles[badge.cls] || ''}`} style={{ marginLeft: 6 }}>{badge.label}</span> : null}
                      </div>
                    </div>
                    <span className={`${styles.txAmount} ${isCredit ? styles.amountIn : styles.amountOut}`}>
                      {isCredit ? '+' : '−'}{formatFCFA(t.amount)}
                    </span>
                    <div className={styles.txActions}>
                      {t.status === 'completed' && (
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => reverse(t)} aria-label="Annuler" title="Annuler ce mouvement">
                          <Undo2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {pagination?.has_next && (
              <div className="text-center mt-md">
                <Button variant="secondary" onClick={loadMore}>Charger plus</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Nouveau mouvement">
        <MovementForm
          initialType="debit"
          categories={categories}
          onSubmit={submitMovement}
          onCancel={() => setCreating(false)}
        />
      </Modal>
    </div>
  );
}
