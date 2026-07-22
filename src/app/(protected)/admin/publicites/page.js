'use client';

import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Pencil, Trash2, Eye, EyeOff, Upload, X, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { adsService } from '../../../../services/ads.service';
import { uploadService } from '../../../../services/upload.service';
import { BackButton } from '../../../../components/ui/BackButton';
import { Button } from '../../../../components/ui/Button';
import styles from './publicites.module.css';

const emptyForm = { title: '', image_url: '', link_url: '', display_order: 0, is_active: true };

export default function AdminPublicitesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [ads, setAds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ouvert, setOuvert] = useState(null); // id de la pub dont les signalements sont dépliés
  const [reportsById, setReportsById] = useState({});
  const [loadingReports, setLoadingReports] = useState(false);

  // Garde d'accès : admins uniquement.
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!user.is_admin) { router.push('/dashboard'); }
  }, [user, loading, router]);

  const load = async () => {
    try {
      const res = await adsService.listAll();
      setAds(res.data.ads);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les publicités.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) load();
  }, [user]);

  if (loading || !user || !user.is_admin) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement…</div>
      </div>
    );
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadService.uploadFile(file);
      setForm((f) => ({ ...f, image_url: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.error || "Échec de l'upload de l'image.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const editAd = (ad) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      display_order: ad.display_order ?? 0,
      is_active: ad.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.image_url) { setError('Veuillez fournir une image (upload ou URL).'); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        image_url: form.image_url,
        link_url: form.link_url || null,
        display_order: Number(form.display_order) || 0,
        is_active: !!form.is_active,
      };
      if (editingId) await adsService.update(editingId, payload);
      else await adsService.create(payload);
      resetForm();
      await load();
    } catch (err) {
      setError(
        err.response?.data?.details?.[0]?.msg
        || err.response?.data?.error
        || 'Enregistrement impossible.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad) => {
    setError('');
    try {
      await adsService.update(ad.id, { is_active: !ad.is_active });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Action impossible.');
    }
  };

  const toggleReports = async (ad) => {
    if (ouvert === ad.id) { setOuvert(null); return; }
    setOuvert(ad.id);
    if (reportsById[ad.id]) return; // déjà chargé
    setLoadingReports(true);
    try {
      const res = await adsService.getReports(ad.id);
      setReportsById((prev) => ({ ...prev, [ad.id]: res.data.reports }));
    } catch {
      setReportsById((prev) => ({ ...prev, [ad.id]: [] }));
    } finally {
      setLoadingReports(false);
    }
  };

  const remove = async (ad) => {
    if (!window.confirm(`Supprimer la publicité « ${ad.title} » ?`)) return;
    setError('');
    try {
      await adsService.remove(ad.id);
      if (editingId === ad.id) resetForm();
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Suppression impossible.');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md"><BackButton fallbackHref="/dashboard" /></div>
      <h1 className="text-primary flex items-center gap-sm mb-sm">
        <Megaphone size={26} /> Publicités
      </h1>
      <p className="text-muted mb-lg">Le contenu de l'espace publicitaire du tableau de bord est géré ici, par les administrateurs.</p>

      <div className={styles.grid}>
        {/* Formulaire création / édition */}
        <div className={styles.card}>
          <h3>{editingId ? 'Modifier la publicité' : 'Nouvelle publicité'}</h3>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="title">Titre *</label>
              <input id="title" className={styles.input} value={form.title} onChange={set('title')} required maxLength={150} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Image *</label>
              <div className={styles.preview}>
                {form.image_url
                  ? <img src={form.image_url} alt="Aperçu" />
                  : <span>Aperçu de l'image</span>}
              </div>
              <div className={styles.row}>
                <label className={styles.iconBtn} style={{ cursor: uploading ? 'wait' : 'pointer' }}>
                  <Upload size={14} /> {uploading ? 'Envoi…' : 'Téléverser'}
                  <input type="file" accept="image/*" onChange={onPickImage} hidden disabled={uploading} />
                </label>
              </div>
              <input
                className={styles.input}
                placeholder="…ou coller une URL d'image"
                value={form.image_url}
                onChange={set('image_url')}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="link_url">Lien au clic (optionnel)</label>
              <input id="link_url" className={styles.input} placeholder="https://…" value={form.link_url} onChange={set('link_url')} />
            </div>

            <div className={styles.row}>
              <div className={styles.field} style={{ maxWidth: 120 }}>
                <label className={styles.label} htmlFor="order">Ordre</label>
                <input id="order" type="number" min="0" className={styles.input} value={form.display_order} onChange={set('display_order')} />
              </div>
              <label className={styles.checkbox}>
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Active
              </label>
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.actions}>
              <Button type="submit" variant="primary" isLoading={saving}>
                {editingId ? 'Enregistrer' : 'Créer la publicité'}
              </Button>
              {editingId && (
                <button type="button" className={styles.iconBtn} onClick={resetForm}>
                  <X size={14} /> Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className={styles.card}>
          <h3>Toutes les publicités</h3>
          {loadingList ? (
            <p className="animate-pulse text-muted">Chargement…</p>
          ) : ads.length === 0 ? (
            <p className={styles.empty}>Aucune publicité pour l'instant.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Image</th><th>Titre</th><th>Ordre</th><th>Statut</th><th>Signalements</th><th></th></tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <Fragment key={ad.id}>
                      <tr>
                        <td><img className={styles.thumb} src={ad.image_url} alt={ad.title} /></td>
                        <td>{ad.title}{ad.link_url ? <div className="text-muted text-sm">🔗 lien</div> : null}</td>
                        <td>{ad.display_order}</td>
                        <td>
                          <span className={`${styles.badge} ${ad.is_active ? styles.badgeOn : styles.badgeOff}`}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {ad.report_count > 0 ? (
                            <button
                              className={`${styles.badge} ${styles.badgeReport}`}
                              onClick={() => toggleReports(ad)}
                              title="Voir les motifs"
                            >
                              <Flag size={12} /> {ad.report_count}
                              {ouvert === ad.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          ) : (
                            <span className="text-muted text-sm">—</span>
                          )}
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button className={styles.iconBtn} onClick={() => editAd(ad)} title="Modifier"><Pencil size={14} /></button>
                            <button className={styles.iconBtn} onClick={() => toggleActive(ad)} title={ad.is_active ? 'Désactiver' : 'Activer'}>
                              {ad.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(ad)} title="Supprimer"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                      {ouvert === ad.id && (
                        <tr>
                          <td colSpan={6} className={styles.reportsDetail}>
                            {loadingReports && !reportsById[ad.id] ? (
                              <span className="text-muted">Chargement des motifs…</span>
                            ) : (reportsById[ad.id]?.length ?? 0) === 0 ? (
                              <span className="text-muted">Aucun motif renseigné.</span>
                            ) : (
                              <ul className={styles.reportsList}>
                                {reportsById[ad.id].map((r) => (
                                  <li key={r.id}>
                                    <strong>{r.display_name || r.email}</strong>
                                    {r.reason ? ` — ${r.reason}` : ' — (aucun motif)'}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
