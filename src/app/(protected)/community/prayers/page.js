'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, HandHeart, Trash2, Check, Globe, Users2 } from 'lucide-react';
import { communityService } from '../../../../services/community.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { timeAgo } from '../../../../utils/date';
import styles from '../../../../components/shared/panel.module.css';

const STATUS_LABEL = { active: 'En cours', answered: 'Exaucée', closed: 'Clôturée' };

function PrayerForm({ myGroups, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [groupId, setGroupId] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    if (visibility === 'group' && !groupId) { setError('Choisissez un groupe.'); return; }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        visibility,
        group_id: visibility === 'group' ? groupId : null,
        is_anonymous: anonymous,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Le partage a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="sp-title">Sujet</label>
          <input id="sp-title" className={styles.input} value={title} maxLength={150}
            onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Priez pour mon examen" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="sp-vis">Visibilité</label>
          <select id="sp-vis" className={styles.select} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="public">🌍 Publique (toute la communauté)</option>
            <option value="group" disabled={myGroups.length === 0}>
              👥 Un de mes groupes{myGroups.length === 0 ? ' (aucun groupe)' : ''}
            </option>
          </select>
        </div>
        {visibility === 'group' && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="sp-group">Groupe</label>
            <select id="sp-group" className={styles.select} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">— Choisir —</option>
              {myGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="sp-desc">Détails (facultatif)</label>
          <textarea id="sp-desc" className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className="flex items-center gap-sm">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span className={styles.label} style={{ margin: 0 }}>Partager anonymement</span>
          </label>
          {anonymous && <p className="text-sm text-muted" style={{ margin: 0 }}>Votre nom ne sera visible par personne.</p>}
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>Partager</Button>
      </div>
    </form>
  );
}

export default function SharedPrayersPage() {
  const [prayers, setPrayers] = useState([]);
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
      if (filter) params.status = filter;
      const [pr, gr] = await Promise.all([
        communityService.listPrayers(params),
        communityService.myGroups(),
      ]);
      setPrayers(pr.data.prayers);
      setMyGroups(gr.data.groups);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const create = async (payload) => { await communityService.createPrayer(payload); setCreating(false); await reload(); };

  // Optimiste : on met à jour la carte tout de suite, l'API fait foi ensuite.
  const toggleSupport = async (p) => {
    setBusyId(p.id);
    try {
      const res = p.is_supported
        ? await communityService.unsupport(p.id)
        : await communityService.support(p.id);
      setPrayers((list) => list.map((x) => (x.id === p.id
        ? { ...x, is_supported: res.data.is_supported, supports_count: res.data.supports_count }
        : x)));
    } catch (err) {
      setError(err.response?.data?.error || 'Action impossible.');
    } finally { setBusyId(null); }
  };

  const markAnswered = async (p) => {
    const note = window.prompt('Comment Dieu a-t-il répondu ? (facultatif)') ?? '';
    try {
      await communityService.updatePrayer(p.id, { status: 'answered', answered_note: note.trim() || null });
      await reload();
    } catch (err) { setError(err.response?.data?.error || 'Action impossible.'); }
  };

  const remove = async (p) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    try { await communityService.deletePrayer(p.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  return (
    <div>
      <div className={styles.filters}>
        <select className={styles.select} style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Toutes</option>
          <option value="active">En cours</option>
          <option value="answered">Exaucées</option>
          <option value="closed">Clôturées</option>
        </select>
        <span style={{ flex: 1 }} />
        <Button onClick={() => setCreating(true)}><span className="flex items-center gap-xs"><Plus size={16} /> Partager</span></Button>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : prayers.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <HandHeart size={28} style={{ opacity: 0.5 }} />
          <p>Aucune demande partagée.</p>
        </div>
      ) : (
        <div className="flex-col gap-md" style={{ display: 'flex' }}>
          {prayers.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.sectionHead}>
                <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                  <span className={styles.badge}>
                    {p.visibility === 'public'
                      ? <><Globe size={12} /> Publique</>
                      : <><Users2 size={12} /> {p.group_name}</>}
                  </span>
                  <span className={p.status === 'answered' ? styles.badgeOk : styles.badge}>{STATUS_LABEL[p.status]}</span>
                  {p.is_mine && <span className={styles.badgePrimary}>Ma demande</span>}
                </div>
                {p.is_mine && (
                  <div className={styles.rowActions}>
                    {p.status !== 'answered' && (
                      <button className={styles.iconBtn} onClick={() => markAnswered(p)} aria-label="Marquer exaucée" title="Marquer exaucée">
                        <Check size={16} />
                      </button>
                    )}
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(p)} aria-label="Supprimer"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1.05rem', margin: '0 0 4px' }}>{p.title}</h3>
              {p.description && <p className="text-sm" style={{ marginTop: 0, whiteSpace: 'pre-wrap' }}>{p.description}</p>}
              {p.answered_note && (
                <p className="text-sm" style={{ color: 'var(--ok)' }}>🙌 {p.answered_note}</p>
              )}

              <div className="flex items-center justify-between" style={{ marginTop: 'var(--spacing-sm)' }}>
                <span className="text-sm text-muted">
                  {p.is_anonymous ? 'Anonyme' : (p.author_name || 'Membre')} · {timeAgo(p.created_at)}
                </span>
                <Button
                  variant={p.is_supported ? 'primary' : 'secondary'}
                  onClick={() => toggleSupport(p)}
                  isLoading={busyId === p.id}
                >
                  <span className="flex items-center gap-xs">
                    <HandHeart size={16} /> {p.is_supported ? 'Je prie' : 'Je prie pour toi'}
                    {p.supports_count > 0 ? ` · ${p.supports_count}` : ''}
                  </span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Partager une demande de prière" maxWidth="560px">
        <PrayerForm myGroups={myGroups} onSubmit={create} onCancel={() => setCreating(false)} />
      </Modal>
    </div>
  );
}
