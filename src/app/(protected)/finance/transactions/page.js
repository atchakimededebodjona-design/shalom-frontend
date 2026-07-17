'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { financeService } from '../../../../services/finance.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { TransactionForm } from '../../../../components/finance/TransactionForm';
import { formatFCFA, formatDateFR } from '../../../../utils/format';
import styles from '../../../../components/finance/finance.module.css';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ type: '', category_id: '' });
  const [editing, setEditing] = useState(null); // null | 'new' | transaction
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (page, replace) => {
    const params = { page, limit: PAGE_SIZE };
    if (filters.type) params.type = filters.type;
    if (filters.category_id) params.category_id = filters.category_id;
    const res = await financeService.listTransactions(params);
    setPagination(res.data.pagination);
    setItems((prev) => (replace ? res.data.transactions : [...prev, ...res.data.transactions]));
  }, [filters]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try { await fetchPage(1, true); }
    catch (err) { setError(err.response?.data?.error || 'Chargement impossible.'); }
    finally { setLoading(false); }
  }, [fetchPage]);

  useEffect(() => {
    financeService.listCategories().then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const submit = async (payload) => {
    if (editing && editing !== 'new') await financeService.updateTransaction(editing.id, payload);
    else await financeService.createTransaction(payload);
    setEditing(null);
    await reload();
  };

  const remove = async (tx) => {
    if (!window.confirm('Supprimer cette transaction ?')) return;
    try { await financeService.deleteTransaction(tx.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  return (
    <div>
      <div className={styles.filters}>
        <select className={styles.select} style={{ width: 'auto' }} value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="">Tous les types</option>
          <option value="income">Revenus</option>
          <option value="expense">Dépenses</option>
        </select>
        <select className={styles.select} style={{ width: 'auto' }} value={filters.category_id}
          onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value }))}>
          <option value="">Toutes catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setEditing('new')}><span className="flex items-center gap-xs"><Plus size={16} /> Nouvelle</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.card}>
        {loading ? (
          <p className="animate-pulse text-muted">Chargement…</p>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            Aucune transaction.{' '}
            <button className="text-primary font-bold" onClick={() => setEditing('new')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              En ajouter une
            </button>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {items.map((t) => (
                <div key={t.id} className={styles.txRow}>
                  <span className={styles.txIcon} style={{ background: t.type === 'income' ? 'var(--in-soft)' : 'var(--out-soft)' }}>
                    {t.category_icon || (t.type === 'income' ? '💰' : '💸')}
                  </span>
                  <div className={styles.txMain}>
                    <div className={styles.txTitle}>{t.category_name || (t.type === 'income' ? 'Revenu' : 'Dépense')}</div>
                    <div className={styles.txMeta}>
                      {formatDateFR(t.transaction_date)}{t.note ? ` · ${t.note}` : ''}
                      {t.is_recurring ? ' · 🔁' : ''}
                    </div>
                  </div>
                  <span className={`${styles.txAmount} ${t.type === 'income' ? styles.amountIn : styles.amountOut}`}>
                    {t.type === 'income' ? '+' : '−'}{formatFCFA(t.amount)}
                  </span>
                  <div className={styles.txActions}>
                    <button className={styles.iconBtn} onClick={() => setEditing(t)} aria-label="Modifier"><Pencil size={16} /></button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(t)} aria-label="Supprimer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            {pagination?.has_next && (
              <div className="text-center mt-md">
                <Button variant="secondary" onClick={() => fetchPage(pagination.page + 1, false)}>Charger plus</Button>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Modifier la transaction' : 'Nouvelle transaction'}>
        <TransactionForm
          initial={editing && editing !== 'new' ? editing : null}
          categories={categories}
          onSubmit={submit}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </div>
  );
}
