'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, NotebookPen } from 'lucide-react';
import { spiritualService } from '../../../../services/spiritual.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { formatDateFR, todayISO } from '../../../../utils/format';
import styles from '../../../../components/shared/panel.module.css';

const MOODS = ['reconnaissant', 'en paix', 'en lutte', 'joyeux', 'fatigué', 'plein d\'espoir'];

function EntryForm({ initial, onSubmit, onCancel }) {
  const [content, setContent] = useState(initial?.content || '');
  const [entryType, setEntryType] = useState(initial?.entry_type || 'note');
  const [mood, setMood] = useState(initial?.mood || '');
  const [entryDate, setEntryDate] = useState(initial?.entry_date ? initial.entry_date.slice(0, 10) : todayISO());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) { setError('Le contenu est requis.'); return; }
    setSaving(true);
    try {
      await onSubmit({ content: content.trim(), entry_type: entryType, mood: mood || null, entry_date: entryDate });
    } catch (err) {
      setError(err.response?.data?.error || "L'enregistrement a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="j-type">Type</label>
          <select id="j-type" className={styles.select} value={entryType} onChange={(e) => setEntryType(e.target.value)}>
            <option value="note">Note</option>
            <option value="gratitude">Gratitude</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="j-date">Date</label>
          <input id="j-date" className={styles.input} type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="j-mood">Humeur (facultatif)</label>
          <select id="j-mood" className={styles.select} value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="">—</option>
            {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="j-content">Contenu</label>
          <textarea id="j-content" className={styles.textarea} style={{ minHeight: 140 }} value={content}
            maxLength={5000} onChange={(e) => setContent(e.target.value)} required />
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>{initial ? 'Enregistrer' : 'Ajouter'}</Button>
      </div>
    </form>
  );
}

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (filter) params.entry_type = filter;
      const res = await spiritualService.listEntries(params);
      setEntries(res.data.entries);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const submit = async (payload) => {
    if (editing && editing !== 'new') await spiritualService.updateEntry(editing.id, payload);
    else await spiritualService.createEntry(payload);
    setEditing(null);
    await reload();
  };

  const remove = async (entry) => {
    if (!window.confirm('Supprimer cette entrée ?')) return;
    try { await spiritualService.deleteEntry(entry.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  return (
    <div>
      <div className={styles.filters}>
        <select className={styles.select} style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Toutes les entrées</option>
          <option value="note">Notes</option>
          <option value="gratitude">Gratitude</option>
        </select>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setEditing('new')}><span className="flex items-center gap-xs"><Plus size={16} /> Nouvelle entrée</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : entries.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <NotebookPen size={28} style={{ opacity: 0.5 }} />
          <p>Aucune entrée pour l'instant.</p>
          <Button onClick={() => setEditing('new')}>Écrire ma première entrée</Button>
        </div>
      ) : (
        <div className="flex-col gap-md" style={{ display: 'flex' }}>
          {entries.map((e) => (
            <div key={e.id} className={styles.card}>
              <div className={styles.sectionHead}>
                <div className="flex items-center gap-sm">
                  <span className={e.entry_type === 'gratitude' ? styles.badgeOk : styles.badge}>
                    {e.entry_type === 'gratitude' ? '🙌 Gratitude' : '📝 Note'}
                  </span>
                  <span className="text-sm text-muted">{formatDateFR(e.entry_date)}</span>
                  {e.mood && <span className={styles.badgePrimary}>{e.mood}</span>}
                </div>
                <div className={styles.rowActions}>
                  <button className={styles.iconBtn} onClick={() => setEditing(e)} aria-label="Modifier"><Pencil size={16} /></button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(e)} aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{e.content}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? "Modifier l'entrée" : 'Nouvelle entrée'} maxWidth="560px">
        <EntryForm initial={editing && editing !== 'new' ? editing : null} onSubmit={submit} onCancel={() => setEditing(null)} />
      </Modal>
    </div>
  );
}
