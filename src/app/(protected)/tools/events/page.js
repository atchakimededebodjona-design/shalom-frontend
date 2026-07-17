'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { toolsService } from '../../../../services/tools.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import styles from '../../../../components/shared/panel.module.css';

const TYPES = [
  { v: 'jeune', l: '🕊️ Jeûne' },
  { v: 'retraite', l: '⛰️ Retraite' },
  { v: 'priere', l: '🙏 Prière' },
  { v: 'autre', l: '📌 Autre' },
];
const STATUS_LABEL = { planned: 'Planifié', completed: 'Terminé', cancelled: 'Annulé' };

// <input type="datetime-local"> attend 'YYYY-MM-DDTHH:mm' en heure locale.
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function EventForm({ initial, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title || '');
  const [type, setType] = useState(initial?.event_type || 'jeune');
  const [description, setDescription] = useState(initial?.description || '');
  const [start, setStart] = useState(toLocalInput(initial?.start_date) || '');
  const [end, setEnd] = useState(toLocalInput(initial?.end_date) || '');
  const [reminder, setReminder] = useState(Boolean(initial?.reminder_enabled));
  const [before, setBefore] = useState(String(initial?.reminder_before_minutes ?? 60));
  const [status, setStatus] = useState(initial?.status || 'planned');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    if (!start) { setError('La date de début est requise.'); return; }
    if (end && new Date(end) < new Date(start)) { setError('La fin ne peut pas précéder le début.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        event_type: type,
        description: description.trim() || null,
        start_date: new Date(start).toISOString(),
        end_date: end ? new Date(end).toISOString() : null,
        reminder_enabled: reminder,
        reminder_before_minutes: Number(before) || 60,
      };
      if (isEdit) payload.status = status;
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
          <label className={styles.label} htmlFor="e-title">Titre</label>
          <input id="e-title" className={styles.input} value={title} maxLength={150}
            onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Jeûne de 3 jours" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="e-type">Type</label>
          <select id="e-type" className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </div>
        {isEdit && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="e-status">Statut</label>
            <select id="e-status" className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="e-start">Début</label>
          <input id="e-start" className={styles.input} type="datetime-local" value={start}
            onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="e-end">Fin (facultatif)</label>
          <input id="e-end" className={styles.input} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className="flex items-center gap-sm">
            <input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span className={styles.label} style={{ margin: 0 }}>Me rappeler</span>
          </label>
          {reminder && (
            <div className="flex items-center gap-sm mt-sm">
              <input className={styles.input} type="number" min="0" max="10080" value={before}
                onChange={(e) => setBefore(e.target.value)} style={{ maxWidth: 120 }} />
              <span className="text-sm text-muted">minutes avant</span>
            </div>
          )}
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="e-desc">Description (facultatif)</label>
          <textarea id="e-desc" className={styles.textarea} value={description} maxLength={2000}
            onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>{isEdit ? 'Enregistrer' : 'Planifier'}</Button>
      </div>
    </form>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
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
      const res = await toolsService.listEvents(params);
      setEvents(res.data.events);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const submit = async (payload) => {
    if (editing && editing !== 'new') await toolsService.updateEvent(editing.id, payload);
    else await toolsService.createEvent(payload);
    setEditing(null);
    await reload();
  };

  const remove = async (ev) => {
    if (!window.confirm(`Supprimer « ${ev.title} » ?`)) return;
    await toolsService.deleteEvent(ev.id);
    await reload();
  };

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '');

  return (
    <div>
      <div className={styles.filters}>
        <select className={styles.select} style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous</option>
          <option value="planned">Planifiés</option>
          <option value="completed">Terminés</option>
          <option value="cancelled">Annulés</option>
        </select>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setEditing('new')}><span className="flex items-center gap-xs"><Plus size={16} /> Planifier</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.card}>
        {loading ? (
          <p className="animate-pulse text-muted">Chargement…</p>
        ) : events.length === 0 ? (
          <div className={styles.empty}>
            <CalendarDays size={28} style={{ opacity: 0.5 }} />
            <p>Aucun événement planifié.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {events.map((ev) => (
              <div key={ev.id} className={styles.row}>
                <span className={styles.rowIcon}>{(TYPES.find((t) => t.v === ev.event_type)?.l || '📌').split(' ')[0]}</span>
                <div className={styles.rowMain}>
                  <div className={`${styles.rowTitle} ${ev.status === 'cancelled' ? styles.done : ''}`}>{ev.title}</div>
                  <div className={styles.rowMeta}>
                    {fmt(ev.start_date)}{ev.end_date ? ` → ${fmt(ev.end_date)}` : ''}
                    {ev.reminder_enabled ? ` · 🔔 ${ev.reminder_before_minutes} min avant` : ''}
                  </div>
                </div>
                <span className={ev.status === 'completed' ? styles.badgeOk : styles.badge}>{STATUS_LABEL[ev.status]}</span>
                <div className={styles.rowActions}>
                  <button className={styles.iconBtn} onClick={() => setEditing(ev)} aria-label="Modifier"><Pencil size={16} /></button>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(ev)} aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title={editing && editing !== 'new' ? "Modifier l'événement" : 'Planifier un événement'} maxWidth="560px">
        <EventForm initial={editing && editing !== 'new' ? editing : null} onSubmit={submit} onCancel={() => setEditing(null)} />
      </Modal>
    </div>
  );
}
