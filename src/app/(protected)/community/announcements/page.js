'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pin, Trash2, Pencil, Megaphone, Globe, Users2 } from 'lucide-react';
import { communityService } from '../../../../services/community.service';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { timeAgo, } from '../../../../utils/date';
import { formatDateFR } from '../../../../utils/format';
import styles from '../../../../components/shared/panel.module.css';

function AnnouncementForm({ initial, manageableGroups, canPostGlobal, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState(initial?.content || '');
  const [groupId, setGroupId] = useState(initial?.group_id || (canPostGlobal ? '' : (manageableGroups[0]?.id || '')));
  const [pinned, setPinned] = useState(initial ? initial.is_pinned : true);
  const [priority, setPriority] = useState(String(initial?.priority ?? 0));
  const [expires, setExpires] = useState(initial?.expires_at ? initial.expires_at.slice(0, 10) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) { setError('Titre et contenu sont requis.'); return; }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        is_pinned: pinned,
        priority: Number(priority) || 0,
        expires_at: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
      };
      if (!isEdit) payload.group_id = groupId || null;
      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.error || "La publication a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="an-title">Titre</label>
          <input id="an-title" className={styles.input} value={title} maxLength={200}
            onChange={(e) => setTitle(e.target.value)} required />
        </div>
        {!isEdit && (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="an-scope">Portée</label>
            <select id="an-scope" className={styles.select} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              {canPostGlobal && <option value="">🌍 Globale (toute la communauté)</option>}
              {manageableGroups.map((g) => <option key={g.id} value={g.id}>👥 {g.name}</option>)}
            </select>
            {!canPostGlobal && manageableGroups.length === 0 && (
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                Il faut être admin/modérateur d'un groupe pour publier.
              </p>
            )}
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="an-prio">Priorité (0-100)</label>
          <input id="an-prio" className={styles.input} type="number" min="0" max="100" value={priority}
            onChange={(e) => setPriority(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="an-exp">Expire le (facultatif)</label>
          <input id="an-exp" className={styles.input} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className="flex items-center gap-sm" style={{ marginTop: 26 }}>
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} style={{ width: 18, height: 18 }} />
            <span className={styles.label} style={{ margin: 0 }}>Épingler</span>
          </label>
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="an-content">Contenu</label>
          <textarea id="an-content" className={styles.textarea} style={{ minHeight: 140 }} value={content}
            onChange={(e) => setContent(e.target.value)} required />
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>{isEdit ? 'Enregistrer' : 'Publier'}</Button>
      </div>
    </form>
  );
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Publier une annonce globale est réservé aux admins (le backend refuse sinon).
  const canPostGlobal = Boolean(user?.is_admin);
  const manageableGroups = myGroups.filter((g) => ['admin', 'moderateur'].includes(g.my_role));
  const canPost = canPostGlobal || manageableGroups.length > 0;

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [an, gr] = await Promise.all([
        communityService.listAnnouncements({ limit: 50 }),
        communityService.myGroups(),
      ]);
      setAnnouncements(an.data.announcements);
      setMyGroups(gr.data.groups);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const submit = async (payload) => {
    if (editing && editing !== 'new') await communityService.updateAnnouncement(editing.id, payload);
    else await communityService.createAnnouncement(payload);
    setEditing(null);
    await reload();
  };

  const remove = async (a) => {
    if (!window.confirm(`Supprimer « ${a.title} » ?`)) return;
    try { await communityService.deleteAnnouncement(a.id); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Suppression impossible.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-md">
        <p className="text-muted text-sm" style={{ margin: 0 }}>Annonces épinglées en premier, par priorité.</p>
        {canPost && (
          <Button onClick={() => setEditing('new')}><span className="flex items-center gap-xs"><Plus size={16} /> Publier</span></Button>
        )}
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : announcements.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <Megaphone size={28} style={{ opacity: 0.5 }} />
          <p>Aucune annonce pour le moment.</p>
        </div>
      ) : (
        <div className="flex-col gap-md" style={{ display: 'flex' }}>
          {announcements.map((a) => (
            <div key={a.id} className={styles.card}
              style={a.is_pinned ? { borderLeft: '3px solid var(--primary)' } : undefined}>
              <div className={styles.sectionHead}>
                <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                  {a.is_pinned && <span className={styles.badgePrimary}><Pin size={12} /> Épinglée</span>}
                  <span className={styles.badge}>
                    {a.group_name ? <><Users2 size={12} /> {a.group_name}</> : <><Globe size={12} /> Globale</>}
                  </span>
                  {a.priority > 0 && <span className={styles.badge}>Priorité {a.priority}</span>}
                </div>
                {a.posted_by === user?.id && (
                  <div className={styles.rowActions}>
                    <button className={styles.iconBtn} onClick={() => setEditing(a)} aria-label="Modifier"><Pencil size={16} /></button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(a)} aria-label="Supprimer"><Trash2 size={16} /></button>
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px' }}>{a.title}</h3>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }}>{a.content}</p>
              <div className="text-sm text-muted">
                {a.author_name || 'Membre'} · {timeAgo(a.created_at)}
                {a.expires_at ? ` · expire le ${formatDateFR(a.expires_at)}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)}
        title={editing && editing !== 'new' ? "Modifier l'annonce" : 'Publier une annonce'} maxWidth="620px">
        <AnnouncementForm
          initial={editing && editing !== 'new' ? editing : null}
          manageableGroups={manageableGroups}
          canPostGlobal={canPostGlobal}
          onSubmit={submit}
          onCancel={() => setEditing(null)}
        />
      </Modal>
    </div>
  );
}
