'use client';

import { useState, useEffect } from 'react';
import shalomTvService from '../../../../services/shalom-tv.service';
import { Plus, Edit2, Trash2, Video, Headphones, FileText, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import styles from './admin-shalom-tv.module.css';

export default function AdminShalomTvPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    target_audience: 'adult',
    duration_seconds: 0,
    is_published: false,
    content_text: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await shalomTvService.getContents({});
      setContents(res.data.data.contents || []);
    } catch (error) {
      console.error('Erreur chargement SHALOM TV', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (content = null) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        title: content.title,
        description: content.description || '',
        type: content.type,
        target_audience: content.target_audience,
        duration_seconds: content.duration_seconds || 0,
        is_published: content.is_published,
        content_text: content.content_text || ''
      });
    } else {
      setEditingContent(null);
      setFormData({
        title: '',
        description: '',
        type: 'video',
        target_audience: 'adult',
        duration_seconds: 0,
        is_published: false,
        content_text: ''
      });
    }
    setMediaFile(null);
    setThumbnailFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;
    try {
      await shalomTvService.deleteContent(id);
      fetchContents();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('type', formData.type);
    payload.append('target_audience', formData.target_audience);
    payload.append('duration_seconds', formData.duration_seconds);
    payload.append('is_published', formData.is_published);
    if (formData.type === 'text') {
      payload.append('content_text', formData.content_text);
    }

    if (mediaFile) payload.append('media', mediaFile);
    if (thumbnailFile) payload.append('thumbnail', thumbnailFile);

    try {
      if (editingContent) {
        await shalomTvService.updateContent(editingContent.id, payload);
      } else {
        await shalomTvService.createContent(payload);
      }
      setIsModalOpen(false);
      fetchContents();
    } catch (error) {
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={18} />;
      case 'audio': return <Headphones size={18} />;
      case 'text': return <FileText size={18} />;
      case 'photo': return <ImageIcon size={18} />;
      default: return null;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Administration SHALOM TV</h1>
          <p className={styles.subtitle}>Gérez les vidéos, podcasts et articles pour adultes et enfants.</p>
        </div>
        <button onClick={() => handleOpenModal()} className={styles.addBtn}>
          <Plus size={20} /> Ajouter un contenu
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>Chargement des contenus...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Audience</th>
                <th>Statut</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contents.map(content => (
                <tr key={content.id}>
                  <td>
                    <div className={styles.rowTitle}>{content.title}</div>
                    <div className={styles.rowDate}>{new Date(content.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div className={styles.typeCell}>
                      {getTypeIcon(content.type)}
                      <span>{content.type}</span>
                    </div>
                  </td>
                  <td>
                    {content.target_audience === 'child' ? '👦 Enfants' : content.target_audience === 'adult' ? '👨 Adultes' : 'Tous'}
                  </td>
                  <td>
                    {content.is_published ? (
                      <span className={`${styles.badge} ${styles.badgePublished}`}>
                        <CheckCircle size={14} /> Publié
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeDraft}`}>
                        <XCircle size={14} /> Brouillon
                      </span>
                    )}
                  </td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => handleOpenModal(content)} className={styles.iconBtn}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(content.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {contents.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>Aucun contenu trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'édition/création */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingContent ? 'Modifier le contenu' : 'Ajouter un contenu'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.colSpan2}>
                  <label className={styles.label}>Titre</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className={styles.colSpan2}>
                  <label className={styles.label}>Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                </div>

                <div>
                  <label className={styles.label}>Type de contenu</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="video">Vidéo</option>
                    <option value="audio">Podcast (Audio)</option>
                    <option value="text">Article de blog</option>
                    <option value="photo">Photo</option>
                  </select>
                </div>

                <div>
                  <label className={styles.label}>Audience</label>
                  <select value={formData.target_audience} onChange={e => setFormData({ ...formData, target_audience: e.target.value })}>
                    <option value="adult">Adultes</option>
                    <option value="child">Enfants</option>
                    <option value="all">Tous</option>
                  </select>
                </div>

                {formData.type === 'text' && (
                  <div className={styles.colSpan2}>
                    <label className={styles.label}>Contenu de l&apos;article (Texte enrichi / Markdown supporté plus tard)</label>
                    <textarea rows="10" required value={formData.content_text} onChange={e => setFormData({ ...formData, content_text: e.target.value })} style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}></textarea>
                  </div>
                )}

                {(formData.type === 'video' || formData.type === 'audio' || formData.type === 'photo') && (
                  <>
                    <div className={styles.colSpan2}>
                      <label className={styles.label}>
                        {formData.type === 'photo' ? 'Image' : 'Fichier Média (Vidéo/Audio)'}
                      </label>
                      <input
                        type="file"
                        accept={formData.type === 'video' ? 'video/*' : formData.type === 'audio' ? 'audio/*' : 'image/*'}
                        onChange={e => setMediaFile(e.target.files[0])}
                      />
                      {editingContent?.media_url && !mediaFile && <p className={styles.helperText}>Fichier actuel : {editingContent.media_url}</p>}
                    </div>
                    {formData.type !== 'photo' && (
                      <div>
                        <label className={styles.label}>Durée (en secondes)</label>
                        <input type="number" min="0" value={formData.duration_seconds} onChange={e => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) })} />
                      </div>
                    )}
                  </>
                )}

                <div className={styles.colSpan2}>
                  <label className={styles.label}>Image de miniature (Thumbnail)</label>
                  <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} />
                  {editingContent?.thumbnail_url && !thumbnailFile && <p className={styles.helperText}>Fichier actuel : {editingContent.thumbnail_url}</p>}
                </div>

                <div className={styles.checkboxRow}>
                  <input type="checkbox" id="is_published" checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} />
                  <label htmlFor="is_published" className={styles.checkboxLabel}>Publier ce contenu</label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={submitLoading} className={styles.submitBtn}>
                  {submitLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
