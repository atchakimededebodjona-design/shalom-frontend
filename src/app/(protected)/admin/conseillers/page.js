'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { conseillersService } from '../../../../services/conseillers.service';
import { getApiError } from '../../../../utils/apiError';
import { BackButton } from '../../../../components/ui/BackButton';
import { Button } from '../../../../components/ui/Button';
import styles from './conseillers.module.css';

const emptyForm = { nom: '', email: '', telephone: '', specialite: '', bio: '', is_active: true };

export default function AdminConseillersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    if (!user.is_admin) { router.push('/dashboard'); }
  }, [user, loading, router]);

  const load = async () => {
    setLoadingList(true);
    try {
      const res = await conseillersService.list({ limit: 100 });
      setItems(res.data.conseillers);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les conseillers.'));
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
  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const editConseiller = (c) => {
    setEditingId(c.id);
    setForm({
      nom: c.nom,
      email: c.email || '',
      telephone: c.telephone || '',
      specialite: c.specialite || '',
      bio: c.bio || '',
      is_active: c.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        nom: form.nom,
        email: form.email || null,
        telephone: form.telephone || null,
        specialite: form.specialite || null,
        bio: form.bio || null,
        is_active: !!form.is_active,
      };
      if (editingId) await conseillersService.update(editingId, payload);
      else await conseillersService.create(payload);
      resetForm();
      await load();
    } catch (err) {
      setError(getApiError(err, 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    setError('');
    try {
      await conseillersService.update(c.id, { is_active: !c.is_active });
      await load();
    } catch (err) {
      setError(getApiError(err, 'Action impossible.'));
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Supprimer le conseiller « ${c.nom} » ?`)) return;
    setError('');
    try {
      await conseillersService.remove(c.id);
      if (editingId === c.id) resetForm();
      await load();
    } catch (err) {
      setError(getApiError(err, 'Suppression impossible.'));
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md"><BackButton fallbackHref="/dashboard" /></div>
      <h1 className="text-primary flex items-center gap-sm mb-sm">
        <Users size={26} /> Conseillers en accompagnement
      </h1>
      <p className="text-muted mb-lg">Annuaire interne des conseillers disponibles pour l&apos;accompagnement des membres.</p>

      <div className={styles.grid}>
        {/* Formulaire création / édition */}
        <div className={styles.card}>
          <h3>{editingId ? 'Modifier le conseiller' : 'Nouveau conseiller'}</h3>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nom">Nom *</label>
              <input id="nom" className={styles.input} value={form.nom} onChange={set('nom')} required maxLength={150} />
            </div>

            <div className={styles.row}>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="email">E-mail</label>
                <input id="email" type="email" className={styles.input} value={form.email} onChange={set('email')} />
              </div>
              <div className={styles.field} style={{ flex: 1 }}>
                <label className={styles.label} htmlFor="telephone">Téléphone</label>
                <input id="telephone" className={styles.input} value={form.telephone} onChange={set('telephone')} />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="specialite">Spécialité</label>
              <input id="specialite" className={styles.input} placeholder="Ex : Finances, Vie spirituelle, Orientation…" value={form.specialite} onChange={set('specialite')} maxLength={150} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="bio">Bio</label>
              <textarea id="bio" className={styles.textarea} value={form.bio} onChange={set('bio')} />
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Actif
            </label>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.actions}>
              <Button type="submit" variant="primary" isLoading={saving}>
                {editingId ? 'Enregistrer' : 'Ajouter le conseiller'}
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
          <h3>Tous les conseillers</h3>
          {loadingList ? (
            <p className="animate-pulse text-muted">Chargement…</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>Aucun conseiller pour l&apos;instant.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th>Nom</th><th>Contact</th><th>Spécialité</th><th>Statut</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td>{c.nom}</td>
                      <td>
                        {c.email && <div className="text-sm">{c.email}</div>}
                        {c.telephone && <div className="text-muted text-sm">{c.telephone}</div>}
                        {!c.email && !c.telephone && '—'}
                      </td>
                      <td>{c.specialite || '—'}</td>
                      <td>
                        <span className={`${styles.badge} ${c.is_active ? styles.badgeOn : styles.badgeOff}`}>
                          {c.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button className={styles.iconBtn} onClick={() => editConseiller(c)} title="Modifier"><Pencil size={14} /></button>
                          <button className={styles.iconBtn} onClick={() => toggleActive(c)} title={c.is_active ? 'Désactiver' : 'Activer'}>
                            {c.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(c)} title="Supprimer"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
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
