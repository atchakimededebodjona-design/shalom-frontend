'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { conseillersService } from '../../../../services/conseillers.service';
import { getApiError } from '../../../../utils/apiError';
import { BackButton } from '../../../../components/ui/BackButton';
import { Button } from '../../../../components/ui/Button';
import { Avatar } from '../../../../components/ui/Avatar';
import { MemberPicker } from './MemberPicker';
import styles from './conseillers.module.css';

const emptyForm = { selectedMember: null, telephone: '', specialite: '', bio: '', is_active: true };

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
      // Le membre désigné ne se change pas depuis l'édition (cf. backend) —
      // affiché à titre indicatif, non modifiable.
      selectedMember: { user_id: c.user_id, display_name: c.nom, avatar_url: c.avatar_url },
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
    if (!editingId && !form.selectedMember) {
      setError('Sélectionnez un membre à désigner comme conseiller.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        telephone: form.telephone || null,
        specialite: form.specialite || null,
        bio: form.bio || null,
        is_active: !!form.is_active,
      };
      if (editingId) {
        await conseillersService.update(editingId, payload);
      } else {
        await conseillersService.create({ ...payload, user_id: form.selectedMember.user_id });
      }
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
    if (!window.confirm(`Retirer « ${c.nom} » de la liste des conseillers ?`)) return;
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
      <p className="text-muted mb-lg">
        Désignez des membres SHALOM déjà inscrits comme conseillers certifiés, disponibles pour
        l&apos;accompagnement des membres.
      </p>

      <div className={styles.grid}>
        {/* Formulaire création / édition */}
        <div className={styles.card}>
          <h3>{editingId ? 'Modifier le conseiller' : 'Désigner un conseiller'}</h3>
          <form className={styles.form} onSubmit={submit}>
            <div className={styles.field}>
              <label className={styles.label}>Membre {editingId ? '' : '*'}</label>
              <MemberPicker
                selected={form.selectedMember}
                onSelect={(p) => setForm({ ...form, selectedMember: p })}
              />
              {editingId && <p className="text-muted text-sm" style={{ margin: 0 }}>Le membre désigné ne peut pas être changé — supprimez puis recréez si besoin.</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="telephone">Téléphone (ligne dédiée aux conseils)</label>
              <input id="telephone" className={styles.input} value={form.telephone} onChange={set('telephone')} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="specialite">Spécialité</label>
              <input id="specialite" className={styles.input} placeholder="Ex : Finances, Vie spirituelle, Orientation…" value={form.specialite} onChange={set('specialite')} maxLength={150} />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="bio">Bio (visible dans l&apos;annuaire)</label>
              <textarea id="bio" className={styles.textarea} value={form.bio} onChange={set('bio')} />
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Actif
            </label>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <div className={styles.actions}>
              <Button type="submit" variant="primary" isLoading={saving}>
                {editingId ? 'Enregistrer' : 'Désigner comme conseiller'}
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
                  <tr><th>Membre</th><th>Contact</th><th>Spécialité</th><th>Statut</th><th></th></tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className={styles.rowName}>
                          <Avatar src={c.avatar_url} name={c.nom} size={32} />
                          {c.nom}
                        </div>
                      </td>
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
                          <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(c)} title="Retirer"><Trash2 size={14} /></button>
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
