'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { financeService } from '../../../../services/finance.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { CategoryForm } from '../../../../components/finance/CategoryForm';
import styles from '../../../../components/finance/finance.module.css';

function Column({ title, icon, cats, onEdit, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.sectionHead}><h3 className="flex items-center gap-sm">{icon} {title}</h3></div>
      {cats.length === 0 ? (
        <p className="text-muted text-sm">Aucune catégorie.</p>
      ) : (
        <div className={styles.list}>
          {cats.map((c) => (
            <div key={c.id} className={styles.txRow}>
              <span className={styles.txIcon} style={{ background: 'var(--bg-color)' }}>{c.icon || '🏷️'}</span>
              <div className={styles.txMain}><div className={styles.txTitle}>{c.name}</div></div>
              <div className={styles.txActions}>
                <button className={styles.iconBtn} onClick={() => onEdit(c)} aria-label="Modifier"><Pencil size={16} /></button>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => onDelete(c)} aria-label="Supprimer"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | category
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await financeService.listCategories();
      setCats(res.data.categories);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const submit = async (payload) => {
    if (editing && editing !== 'new') await financeService.updateCategory(editing.id, payload);
    else await financeService.createCategory(payload);
    setEditing(null);
    await reload();
  };

  const remove = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie « ${cat.name} » ?`)) return;
    try { await financeService.deleteCategory(cat.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  const income = cats.filter((c) => c.type === 'income');
  const expense = cats.filter((c) => c.type === 'expense');

  return (
    <div>
      <div className="flex items-center justify-between mb-md">
        <p className="text-muted text-sm" style={{ margin: 0 }}>Organisez vos revenus et dépenses par catégorie.</p>
        <Button onClick={() => setEditing('new')}><span className="flex items-center gap-xs"><Plus size={16} /> Nouvelle catégorie</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
          <Column title="Revenus" icon={<TrendingUp size={18} style={{ color: 'var(--in)' }} />} cats={income} onEdit={setEditing} onDelete={remove} />
          <Column title="Dépenses" icon={<TrendingDown size={18} style={{ color: 'var(--out)' }} />} cats={expense} onEdit={setEditing} onDelete={remove} />
        </div>
      )}

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
        <CategoryForm
          initial={editing && editing !== 'new' ? editing : null}
          onSubmit={submit}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </div>
  );
}
