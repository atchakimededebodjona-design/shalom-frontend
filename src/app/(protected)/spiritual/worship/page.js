'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Music, ListMusic, Search } from 'lucide-react';
import { spiritualService } from '../../../../services/spiritual.service';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import styles from '../../../../components/shared/panel.module.css';

function SongForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Le titre est requis.'); return; }
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        artist_or_author: author.trim() || null,
        category: category.trim() || null,
        lyrics: lyrics.trim() || null,
      });
    } catch (err) {
      setError(err.response?.data?.error || "L'enregistrement a échoué.");
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="s-title">Titre</label>
          <input id="s-title" className={styles.input} value={title} maxLength={200}
            onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="s-author">Auteur / artiste</label>
          <input id="s-author" className={styles.input} value={author} maxLength={150} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="s-cat">Catégorie</label>
          <input id="s-cat" className={styles.input} value={category} maxLength={50}
            onChange={(e) => setCategory(e.target.value)} placeholder="louange, adoration…" />
        </div>
        <div className={`${styles.field} ${styles.full}`}>
          <label className={styles.label} htmlFor="s-lyrics">Paroles (facultatif)</label>
          <textarea id="s-lyrics" className={styles.textarea} style={{ minHeight: 140 }} value={lyrics}
            onChange={(e) => setLyrics(e.target.value)} />
        </div>
      </div>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>Ajouter</Button>
      </div>
    </form>
  );
}

export default function WorshipPage() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [q, setQ] = useState('');
  const [addingSong, setAddingSong] = useState(false);
  const [newList, setNewList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [openList, setOpenList] = useState(null);
  const [viewSong, setViewSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (q) params.q = q;
      const [s, p] = await Promise.all([spiritualService.listSongs(params), spiritualService.listPlaylists()]);
      setSongs(s.data.songs);
      setPlaylists(p.data.playlists);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { reload(); }, [reload]);

  const createSong = async (payload) => { await spiritualService.createSong(payload); setAddingSong(false); await reload(); };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!listTitle.trim()) return;
    await spiritualService.createPlaylist({ title: listTitle.trim() });
    setListTitle(''); setNewList(false); await reload();
  };

  const removePlaylist = async (pl) => {
    if (!window.confirm(`Supprimer la playlist « ${pl.title} » ?`)) return;
    await spiritualService.deletePlaylist(pl.id); await reload();
  };

  const addToPlaylist = async (playlistId, songId) => {
    try { await spiritualService.addSongToPlaylist(playlistId, songId); await reload(); }
    catch (err) { setError(err.response?.data?.error || 'Ajout impossible.'); }
  };

  const showPlaylist = async (pl) => {
    const res = await spiritualService.getPlaylist(pl.id);
    setOpenList(res.data.playlist);
  };

  const removeFromPlaylist = async (playlistId, songId) => {
    await spiritualService.removeSongFromPlaylist(playlistId, songId);
    const res = await spiritualService.getPlaylist(playlistId);
    setOpenList(res.data.playlist);
    await reload();
  };

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {/* Playlists */}
      <div>
        <div className={styles.sectionHead}>
          <h3 className="flex items-center gap-sm"><ListMusic size={18} /> Mes playlists</h3>
          <Button variant="secondary" onClick={() => setNewList((v) => !v)}>
            <span className="flex items-center gap-xs"><Plus size={16} /> Playlist</span>
          </Button>
        </div>
        {newList && (
          <form onSubmit={createPlaylist} className="flex items-center gap-sm mb-md">
            <input className={styles.input} value={listTitle} onChange={(e) => setListTitle(e.target.value)}
              placeholder="Nom de la playlist" maxLength={150} autoFocus />
            <Button type="submit">Créer</Button>
          </form>
        )}
        {playlists.length === 0 ? (
          <p className="text-muted text-sm">Aucune playlist.</p>
        ) : (
          <div className={styles.grid}>
            {playlists.map((pl) => (
              <div key={pl.id} className={styles.card}>
                <div className={styles.sectionHead}>
                  <h3 style={{ fontSize: '1rem' }}>{pl.title}</h3>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => removePlaylist(pl)} aria-label="Supprimer"><Trash2 size={16} /></button>
                </div>
                <p className="text-sm text-muted" style={{ margin: 0 }}>{pl.songs_count} chant(s)</p>
                <div className={styles.actions} style={{ marginTop: 'var(--spacing-sm)' }}>
                  <Button variant="secondary" onClick={() => showPlaylist(pl)}>Ouvrir</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chants */}
      <div>
        <div className={styles.sectionHead}>
          <h3 className="flex items-center gap-sm"><Music size={18} /> Chants</h3>
          <Button onClick={() => setAddingSong(true)}><span className="flex items-center gap-xs"><Plus size={16} /> Chant</span></Button>
        </div>
        <div className={styles.filters}>
          <span className="flex items-center gap-xs" style={{ flex: 1, maxWidth: 320 }}>
            <Search size={16} className="text-muted" />
            <input className={styles.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un chant…" />
          </span>
        </div>
        <div className={styles.card}>
          {loading ? (
            <p className="animate-pulse text-muted">Chargement…</p>
          ) : songs.length === 0 ? (
            <div className={styles.empty}>Aucun chant.</div>
          ) : (
            <div className={styles.list}>
              {songs.map((s) => (
                <div key={s.id} className={styles.row}>
                  <span className={styles.rowIcon}>🎵</span>
                  <div className={styles.rowMain} style={{ cursor: 'pointer' }} onClick={() => setViewSong(s)}>
                    <div className={styles.rowTitle}>{s.title}</div>
                    <div className={styles.rowMeta}>
                      {s.artist_or_author || 'Auteur inconnu'}{s.category ? ` · ${s.category}` : ''}
                    </div>
                  </div>
                  {playlists.length > 0 && (
                    <select
                      className={styles.select}
                      style={{ width: 'auto', flex: 'none' }}
                      defaultValue=""
                      onChange={(e) => { if (e.target.value) { addToPlaylist(e.target.value, s.id); e.target.value = ''; } }}
                      aria-label="Ajouter à une playlist"
                    >
                      <option value="">Ajouter à…</option>
                      {playlists.map((pl) => <option key={pl.id} value={pl.id}>{pl.title}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={addingSong} onClose={() => setAddingSong(false)} title="Ajouter un chant" maxWidth="560px">
        <SongForm onSubmit={createSong} onCancel={() => setAddingSong(false)} />
      </Modal>

      <Modal isOpen={Boolean(viewSong)} onClose={() => setViewSong(null)} title={viewSong?.title || ''} maxWidth="560px">
        <p className="text-muted text-sm">{viewSong?.artist_or_author}{viewSong?.category ? ` · ${viewSong.category}` : ''}</p>
        <p style={{ whiteSpace: 'pre-wrap' }}>{viewSong?.lyrics || 'Aucune parole enregistrée.'}</p>
      </Modal>

      <Modal isOpen={Boolean(openList)} onClose={() => setOpenList(null)} title={openList?.title || ''} maxWidth="560px">
        {openList?.songs?.length ? (
          <div className={styles.list}>
            {openList.songs.map((s) => (
              <div key={s.id} className={styles.row}>
                <span className={styles.rowIcon}>{s.position}</span>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{s.title}</div>
                  <div className={styles.rowMeta}>{s.artist_or_author || ''}</div>
                </div>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={() => removeFromPlaylist(openList.id, s.id)} aria-label="Retirer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Playlist vide — ajoutez des chants depuis la liste.</p>
        )}
      </Modal>
    </div>
  );
}
