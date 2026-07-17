'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, MapPin, Users2, Trash2, CalendarDays } from 'lucide-react';
import { communityService } from '../../../../services/community.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import styles from '../../../../components/shared/panel.module.css';

const TYPES = [
  { v: 'retraite', l: '⛰️ Retraite' },
  { v: 'formation', l: '🎓 Formation' },
  { v: 'conference', l: '🎤 Conférence' },
  { v: 'autre', l: '📌 Autre' },
];
const STATUS_LABEL = { upcoming: 'À venir', ongoing: 'En cours', completed: 'Terminé', cancelled: 'Annulé' };

const fmt = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '');

function EventForm({ myGroups, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('formation');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [groupId, setGroupId] = useState('');
  const [max, setMax] = useState('');
  const [regRequired, setRegRequired] = useState(true);
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
      await onSubmit({
        title: title.trim(),
        event_type: type,
        description: description.trim() || null,
        start_date: new Date(start).toISOString(),
        end_date: end ? new Date(end).toISOString() : null,
        location_info: location.trim() || null,
        group_id: groupId || null,
        max_participants: max ? Number(max) : null,
        registration_required: regRequired,
      });
    } catch (err) {
      setError(err.response?.data?.error || "La création a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="ev-title">Titre</label>
          <input id="ev-title" className={styles.input} value={title} maxLength={200}
            onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ev-type">Type</label>
          <select id="ev-type" className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ev-group">Portée</label>
          <select id="ev-group" className={styles.select} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">🌍 Global (toute la communauté)</option>
            {myGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ev-start">Début</label>
          <input id="ev-start" className={styles.input} type="datetime-local" value={start}
            onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ev-end">Fin (facultatif)</label>
          <input id="ev-end" className={styles.input} type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ev-loc">Lieu / lien</label>
          <input id="ev-loc" className={styles.input} value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="Adresse ou lien visio" />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="ev-max">Capacité (facultatif)</label>
          <input id="ev-max" className={styles.input} type="number" min="1" value={max}
            onChange={(e) => setMax(e.target.value)} placeholder="Illimitée" />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className="flex items-center gap-sm">
            <input type="checkbox" checked={regRequired} onChange={(e) => setRegRequired(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span className={styles.label} style={{ margin: 0 }}>Inscription requise</span>
          </label>
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="ev-desc">Description</label>
          <textarea id="ev-desc" className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>Créer</Button>
      </div>
    </form>
  );
}

export default function CommunityEventsPage() {
  const [events, setEvents] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [filter, setFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (filter) params.event_type = filter;
      const [ev, gr] = await Promise.all([
        communityService.listEvents(params),
        communityService.myGroups(),
      ]);
      setEvents(ev.data.events);
      setMyGroups(gr.data.groups);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const create = async (payload) => { await communityService.createEvent(payload); setCreating(false); await reload(); };

  const toggleRegister = async (ev) => {
    setBusyId(ev.id);
    setError('');
    try {
      if (ev.is_registered) await communityService.unregister(ev.id);
      else await communityService.register(ev.id);
      await reload();
    } catch (err) {
      // 409 = complet / annulé — message renvoyé tel quel par l'API.
      setError(err.response?.data?.error || "L'inscription a échoué.");
    } finally { setBusyId(null); }
  };

  const remove = async (ev) => {
    if (!window.confirm(`Supprimer « ${ev.title} » ?`)) return;
    try { await communityService.deleteEvent(ev.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  return (
    <div>
      <div className={styles.filters}>
        <select className={styles.select} style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les types</option>
          {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setCreating(true)}><span className="flex items-center gap-xs"><Plus size={16} /> Créer</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : events.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <CalendarDays size={28} style={{ opacity: 0.5 }} />
          <p>Aucun événement à venir.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {events.map((ev) => {
            const full = ev.max_participants !== null && ev.registrations_count >= ev.max_participants && !ev.is_registered;
            return (
              <div key={ev.id} className={styles.card}>
                <div className={styles.sectionHead}>
                  <h3 style={{ fontSize: '1.05rem' }}>{ev.title}</h3>
                  <span className={ev.status === 'cancelled' ? styles.badgeWarn : styles.badge}>{STATUS_LABEL[ev.status]}</span>
                </div>
                <div className="flex items-center gap-sm mb-sm" style={{ flexWrap: 'wrap' }}>
                  <span className={styles.badgePrimary}>{TYPES.find((t) => t.v === ev.event_type)?.l || ev.event_type}</span>
                  <span className={styles.badge}>{ev.group_name ? `👥 ${ev.group_name}` : '🌍 Global'}</span>
                </div>
                {ev.description && <p className="text-sm text-muted" style={{ marginTop: 0 }}>{ev.description}</p>}
                <div className="flex-col gap-xs text-sm text-muted" style={{ display: 'flex' }}>
                  <span className="flex items-center gap-xs"><CalendarDays size={14} /> {fmt(ev.start_date)}{ev.end_date ? ` → ${fmt(ev.end_date)}` : ''}</span>
                  {ev.location_info && <span className="flex items-center gap-xs"><MapPin size={14} /> {ev.location_info}</span>}
                  <span className="flex items-center gap-xs">
                    <Users2 size={14} /> {ev.registrations_count} inscrit(s)
                    {ev.max_participants !== null ? ` / ${ev.max_participants}` : ''}
                    {full ? ' — complet' : ''}
                  </span>
                </div>
                <div className={styles.actions} style={{ marginTop: 'var(--spacing-md)' }}>
                  {ev.registration_required && ev.status !== 'cancelled' && (
                    <Button
                      variant={ev.is_registered ? 'secondary' : 'primary'}
                      onClick={() => toggleRegister(ev)}
                      isLoading={busyId === ev.id}
                      disabled={full}
                    >
                      {ev.is_registered ? 'Se désinscrire' : full ? 'Complet' : "S'inscrire"}
                    </Button>
                  )}
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(ev)} aria-label="Supprimer" title="Supprimer (organisateur)">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Créer un événement" maxWidth="620px">
        <EventForm myGroups={myGroups} onSubmit={create} onCancel={() => setCreating(false)} />
      </Modal>
    </div>
  );
}
