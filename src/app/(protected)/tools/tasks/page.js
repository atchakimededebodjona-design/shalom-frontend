'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, ListChecks } from 'lucide-react';
import { toolsService } from '../../../../services/tools.service';
import { Button } from '../../../../components/ui/Button';
import { formatDateFR } from '../../../../utils/format';
import styles from '../../../../components/shared/panel.module.css';

export default function TasksPage() {
  const [lists, setLists] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newDue, setNewDue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLists = useCallback(async () => {
    const res = await toolsService.listLists();
    setLists(res.data.lists);
    return res.data.lists;
  }, []);

  const loadDetail = useCallback(async (id) => {
    if (!id) { setDetail(null); return; }
    const res = await toolsService.getList(id);
    setDetail(res.data.list);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const ls = await loadLists();
        const first = ls[0]?.id || null;
        setActiveId(first);
        if (first) await loadDetail(first);
      } catch (err) {
        setError(err.response?.data?.error || 'Chargement impossible.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadLists, loadDetail]);

  const refresh = async () => { await loadLists(); await loadDetail(activeId); };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const res = await toolsService.createList({ title: newListTitle.trim() });
    setNewListTitle('');
    const id = res.data.list.id;
    await loadLists();
    setActiveId(id);
    await loadDetail(id);
  };

  const removeList = async (l) => {
    if (!window.confirm(`Supprimer la liste « ${l.title} » et ses tâches ?`)) return;
    await toolsService.deleteList(l.id);
    const ls = await loadLists();
    const next = ls[0]?.id || null;
    setActiveId(next);
    await loadDetail(next);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !activeId) return;
    try {
      await toolsService.createTask({ list_id: activeId, content: newTask.trim(), due_date: newDue || null });
      setNewTask(''); setNewDue('');
      await refresh();
    } catch (err) { setError(err.response?.data?.error || "Ajout impossible."); }
  };

  const toggle = async (t) => {
    await toolsService.updateTask(t.id, { is_completed: !t.is_completed });
    await refresh();
  };

  const removeTask = async (t) => {
    await toolsService.deleteTask(t.id);
    await refresh();
  };

  // Déplacement d'une tâche : on renvoie l'ordre complet au backend, qui
  // renumérote les positions 1..n de façon transactionnelle.
  const move = async (index, dir) => {
    const tasks = detail?.tasks || [];
    const target = index + dir;
    if (target < 0 || target >= tasks.length) return;
    const ids = tasks.map((t) => t.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      const res = await toolsService.reorderTasks(activeId, ids);
      setDetail((d) => ({ ...d, tasks: res.data.tasks }));
    } catch (err) { setError(err.response?.data?.error || 'Réordonnancement impossible.'); }
  };

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;

  return (
    <div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2.2fr', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        {/* Colonne listes */}
        <div className={styles.card}>
          <div className={styles.sectionHead}><h3 className="flex items-center gap-sm"><ListChecks size={18} /> Mes listes</h3></div>
          {lists.length === 0 ? (
            <p className="text-muted text-sm">Aucune liste.</p>
          ) : (
            <div className={styles.list}>
              {lists.map((l) => (
                <div key={l.id} className={styles.row} style={{ padding: 'var(--spacing-sm) 0' }}>
                  <button
                    className={styles.rowMain}
                    onClick={async () => { setActiveId(l.id); await loadDetail(l.id); }}
                    style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit' }}
                  >
                    <div className={styles.rowTitle} style={{ color: l.id === activeId ? 'var(--primary)' : 'inherit' }}>{l.title}</div>
                    <div className={styles.rowMeta}>{l.completed_count}/{l.tasks_count} terminée(s)</div>
                  </button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => removeList(l)} aria-label="Supprimer la liste">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={createList} className="flex items-center gap-sm mt-md">
            <input className={styles.input} value={newListTitle} maxLength={150}
              onChange={(e) => setNewListTitle(e.target.value)} placeholder="Nouvelle liste" />
            <Button type="submit"><Plus size={16} /></Button>
          </form>
        </div>

        {/* Colonne tâches */}
        <div className={styles.card}>
          {!detail ? (
            <div className={styles.empty}>Créez une liste pour commencer.</div>
          ) : (
            <>
              <div className={styles.sectionHead}><h3>{detail.title}</h3></div>

              <form onSubmit={addTask} className={styles.filters}>
                <input className={styles.input} style={{ flex: 1, minWidth: 180 }} value={newTask} maxLength={300}
                  onChange={(e) => setNewTask(e.target.value)} placeholder="Ajouter une tâche…" />
                <input className={styles.input} style={{ width: 'auto' }} type="date" value={newDue}
                  onChange={(e) => setNewDue(e.target.value)} aria-label="Échéance" />
                <Button type="submit"><Plus size={16} /></Button>
              </form>

              {detail.tasks.length === 0 ? (
                <div className={styles.empty}>Aucune tâche dans cette liste.</div>
              ) : (
                <div className={styles.list}>
                  {detail.tasks.map((t, i) => (
                    <div key={t.id} className={styles.row}>
                      <input
                        type="checkbox" checked={t.is_completed} onChange={() => toggle(t)}
                        style={{ width: 18, height: 18, flex: 'none' }} aria-label="Terminer la tâche"
                      />
                      <div className={styles.rowMain}>
                        <div className={`${styles.rowTitle} ${t.is_completed ? styles.done : ''}`}>{t.content}</div>
                        {t.due_date && <div className={styles.rowMeta}>Échéance : {formatDateFR(t.due_date)}</div>}
                      </div>
                      <div className={styles.rowActions}>
                        <button className={styles.iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter"><ChevronUp size={16} /></button>
                        <button className={styles.iconBtn} onClick={() => move(i, 1)} disabled={i === detail.tasks.length - 1} aria-label="Descendre"><ChevronDown size={16} /></button>
                        <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => removeTask(t)} aria-label="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
