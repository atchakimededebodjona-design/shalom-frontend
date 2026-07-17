'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Check, HandHeart } from 'lucide-react';
import { spiritualService } from '../../../../services/spiritual.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { formatDateFR } from '../../../../utils/format';
import styles from '../../../../components/shared/panel.module.css';

const STATUS_LABEL = { pending: 'En attente', ongoing: 'En cours', answered: 'Exaucé' };
const REMINDERS = [{ v: 'none', l: 'Aucun' }, { v: 'daily', l: 'Quotidien' }, { v: 'weekly', l: 'Hebdomadaire' }];

function PrayerForm({ initial, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [reminder, setReminder] = useState(initial?.reminder_frequency || 'none');
  const [status, setStatus] = useState(initial?.status || 'pending');
  const [answeredNote, setAnsweredNote] = useState(initial?.answered_note || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        reminder_frequency: reminder,
      };
      if (isEdit) {
        payload.status = status;
        if (status === 'answered' && answeredNote.trim()) payload.answered_note = answeredNote.trim();
      }
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.error || "L'enregistrement a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="pr-title">Sujet</label>
          <input id="pr-title" className={styles.input} value={title} maxLength={150}
            onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Pour ma famille" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pr-cat">Catégorie (facultatif)</label>
          <input id="pr-cat" className={styles.input} value={category} maxLength={50}
            onChange={(e) => setCategory(e.target.value)} placeholder="famille, santé, travail…" />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="pr-rem">Rappel</label>
          <select id="pr-rem" className={styles.select} value={reminder} onChange={(e) => setReminder(e.target.value)}>
            {REMINDERS.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
          </select>
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="pr-desc">Détails (facultatif)</label>
          <textarea id="pr-desc" className={styles.textarea} value={description} maxLength={2000}
            onChange={(e) => setDescription(e.target.value)} />
        </div>
        {isEdit && (
          <>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="pr-status">Statut</label>
              <select id="pr-status" className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {status === 'answered' && (
              <div className={`${styles.field} ${styles.full}`}>
                <label className={styles.label} htmlFor="pr-note">Comment Dieu a répondu</label>
                <textarea id="pr-note" className={styles.textarea} value={answeredNote} maxLength={2000}
                  onChange={(e) => setAnsweredNote(e.target.value)} />
              </div>
            )}
          </>
        )}
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Button>
      </div>
    </form>
  );
}

export default function PrayersPage() {
  const [prayers, setPrayers] = useState([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (filter) params.status = filter;
      const res = await spiritualService.listPrayers(params);
      setPrayers(res.data.prayers);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const submit = async (payload) => {
    if (editing && editing !== 'new') await spiritualService.updatePrayer(editing.id, payload);
    else await spiritualService.createPrayer(payload);
    setEditing(null);
    await reload();
  };

  const markAnswered = async (p) => {
    await spiritualService.updatePrayer(p.id, { status: 'answered' });
    await reload();
  };

  const remove = async (p) => {
    if (!window.confirm(`Supprimer « ${p.title} » ?`)) return;
    try { await spiritualService.deletePrayer(p.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  return (
    <div>
      <div className={styles.filters}>
        <select className={styles.select} style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les sujets</option>
          <option value="pending">En attente</option>
          <option value="ongoing">En cours</option>
          <option value="answered">Exaucés</option>
        </select>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setEditing('new')}><span className="flex items-center gap-xs"><Plus size={16} /> Nouveau sujet</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.card}>
        {loading ? (
          <p className="animate-pulse text-muted">Chargement…</p>
        ) : prayers.length === 0 ? (
          <div className={styles.empty}>
            <HandHeart size={28} style={{ opacity: 0.5 }} />
            <p>Aucun sujet de prière.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {prayers.map((p) => (
              <div key={p.id} className={styles.row}>
                <span className={styles.rowIcon}>🙏</span>
                <div className={styles.rowMain}>
                  <div className={`${styles.rowTitle} ${p.status === 'answered' ? styles.done : ''}`}>{p.title}</div>
                  <div className={styles.rowMeta}>
                    <span className={p.status === 'answered' ? styles.badgeOk : styles.badge}>
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    {p.category ? ` · ${p.category}` : ''}
                    {p.answered_at ? ` · exaucé le ${formatDateFR(p.answered_at)}` : ''}
                  </div>
                  {p.answered_note && <div className="text-sm" style={{ marginTop: 4 }}>{p.answered_note}</div>}
                </div>
                <div className={styles.rowActions}>
                  {p.status !== 'answered' && (
                    <button className={styles.iconBtn} onClick={() => markAnswered(p)} aria-label="Marquer exaucé" title="Marquer exaucé">
                      <Check size={16} />
                    </button>
                  )}
                  <button className={styles.iconBtn} onClick={() => setEditing(p)} aria-label="Modifier"><Pencil size={16} /></button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(p)} aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? 'Modifier le sujet' : 'Nouveau sujet de prière'}>
        <PrayerForm initial={editing && editing !== 'new' ? editing : null} onSubmit={submit} onCancel={() => setEditing(null)} />
      </Modal>
    </div>
  );
}
