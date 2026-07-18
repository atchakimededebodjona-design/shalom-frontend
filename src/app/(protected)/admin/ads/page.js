'use client';

import { useState, useEffect } from 'react';
import adsService, { resolveMediaUrl } from '../../../../services/ads.service';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import styles from './admin-ads.module.css';

export default function AdminAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    display_order: 0,
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await adsService.getAds({});
      setAds(res.data.data.ads || []);
    } catch (error) {
      console.error('Erreur chargement publicités', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ad = null) => {
    if (ad) {
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        link_url: ad.link_url || '',
        display_order: ad.display_order || 0,
        is_active: ad.is_active
      });
    } else {
      setEditingAd(null);
      setFormData({
        title: '',
        link_url: '',
        display_order: 0,
        is_active: true
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) return;
    try {
      await adsService.deleteAd(id);
      fetchAds();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('link_url', formData.link_url);
    payload.append('display_order', formData.display_order);
    payload.append('is_active', formData.is_active);
    if (imageFile) payload.append('image', imageFile);

    try {
      if (editingAd) {
        await adsService.updateAd(editingAd.id, payload);
      } else {
        await adsService.createAd(payload);
      }
      setIsModalOpen(false);
      fetchAds();
    } catch (error) {
      alert('Erreur lors de la sauvegarde: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Administration des publicités</h1>
          <p className={styles.subtitle}>Gérez l&apos;espace publicitaire affiché sur le fil d&apos;actualité.</p>
        </div>
        <button onClick={() => handleOpenModal()} className={styles.addBtn}>
          <Plus size={20} /> Ajouter une publicité
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingWrap}>Chargement des publicités...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Titre</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map(ad => (
                <tr key={ad.id}>
                  <td>
                    <img src={resolveMediaUrl(ad.image_url)} alt={ad.title} className={styles.thumb} />
                  </td>
                  <td>
                    <div className={styles.rowTitle}>{ad.title}</div>
                    <div className={styles.rowDate}>{new Date(ad.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>{ad.display_order}</td>
                  <td>
                    {ad.is_active ? (
                      <span className={`${styles.badge} ${styles.badgePublished}`}>
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeDraft}`}>
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => handleOpenModal(ad)} className={styles.iconBtn}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(ad.id)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {ads.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>Aucune publicité trouvée.</td>
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
                {editingAd ? 'Modifier la publicité' : 'Ajouter une publicité'}
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
                  <label className={styles.label}>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    required={!editingAd}
                    onChange={e => setImageFile(e.target.files[0])}
                  />
                  {editingAd?.image_url && !imageFile && <p className={styles.helperText}>Image actuelle : {editingAd.image_url}</p>}
                </div>

                <div className={styles.colSpan2}>
                  <label className={styles.label}>Lien de destination (optionnel)</label>
                  <input type="url" placeholder="https://..." value={formData.link_url} onChange={e => setFormData({ ...formData, link_url: e.target.value })} />
                </div>

                <div>
                  <label className={styles.label}>Ordre d&apos;affichage</label>
                  <input type="number" value={formData.display_order} onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} />
                </div>

                <div className={styles.checkboxRow}>
                  <input type="checkbox" id="is_active" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                  <label htmlFor="is_active" className={styles.checkboxLabel}>Publicité active</label>
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
