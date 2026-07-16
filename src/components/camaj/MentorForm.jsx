'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { FILIERES } from '../../app/camaj/filieres';
import { camajService } from '../../services/camaj.service';
import styles from './CamajForm.module.css';

// Accent marine pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-navy)',
  '--form-accent-soft': 'rgba(1, 41, 99, 0.10)',
};

const PAYS = [
  'Togo', 'Bénin', 'Burkina Faso', "Côte d'Ivoire", 'Ghana', 'Mali', 'Niger',
  'Nigeria', 'Sénégal', 'Cameroun', 'Gabon', 'Congo', 'RD Congo',
  'France', 'Canada', 'Belgique', 'Autre',
];

const INDICATIFS = [
  { code: 'TG', tel: '+228' }, { code: 'BJ', tel: '+229' }, { code: 'BF', tel: '+226' },
  { code: 'CI', tel: '+225' }, { code: 'GH', tel: '+233' }, { code: 'ML', tel: '+223' },
  { code: 'NE', tel: '+227' }, { code: 'NG', tel: '+234' }, { code: 'SN', tel: '+221' },
  { code: 'CM', tel: '+237' }, { code: 'GA', tel: '+241' }, { code: 'CG', tel: '+242' },
  { code: 'CD', tel: '+243' }, { code: 'FR', tel: '+33' }, { code: 'BE', tel: '+32' },
  { code: 'CA', tel: '+1' },
];

const EXPERIENCE = ['Moins de 2 ans', '2 à 5 ans', '5 à 10 ans', 'Plus de 10 ans'];

const DISPONIBILITE = ['1 à 2 heures', '3 à 5 heures', '6 à 10 heures', 'Plus de 10 heures'];

const MODES = ['En ligne', 'En présentiel', 'Hybride'];

const ETAT_INITIAL = {
  nom: '',
  age: '',
  pays: 'Togo',
  ville: '',
  indicatif: '+228',
  whatsapp: '',
  email: '',
  profession: '',
  domaine: '',
  experience: '',
  disponibilite: '',
  mode: 'En ligne',
  motivation: '',
  lien: '',
};

export const MentorForm = () => {
  const [form, setForm] = useState(ETAT_INITIAL);
  const [soumis, setSoumis] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((precedent) => ({ ...precedent, [name]: value }));
    setSoumis(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await camajService.submit('mentor', form);
      setSoumis(true);
    } catch (err) {
      setErreur(err.response?.data?.error || "L'envoi a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div style={ACCENT}>
      <div className={styles.header}>
        <span className={styles.iconBox} aria-hidden="true">
          <Users size={28} />
        </span>
        <h1 className="text-primary" style={{ marginBottom: 0 }}>Devenir Mentor</h1>
      </div>
      <hr className={styles.rule} />

      <form className={styles.card} onSubmit={handleSubmit} noValidate={false}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nom">
              Nom complet<span className={styles.required}>*</span>
            </label>
            <input id="nom" name="nom" value={form.nom} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="age">
              Âge<span className={styles.required}>*</span>
            </label>
            <input id="age" name="age" type="number" min="18" max="99" value={form.age} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="pays">
              Pays<span className={styles.required}>*</span>
            </label>
            <select id="pays" name="pays" value={form.pays} onChange={handleChange} required>
              {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="ville">
              Ville<span className={styles.required}>*</span>
            </label>
            <input id="ville" name="ville" value={form.ville} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="whatsapp">
              Numéro WhatsApp<span className={styles.required}>*</span>
            </label>
            <div className={styles.phoneRow}>
              <select
                name="indicatif"
                value={form.indicatif}
                onChange={handleChange}
                aria-label="Indicatif téléphonique"
              >
                {INDICATIFS.map(({ code, tel }) => (
                  <option key={code} value={tel}>{`${code} (${tel})`}</option>
                ))}
              </select>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                placeholder="Numéro WhatsApp"
                value={form.whatsapp}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Adresse Email<span className={styles.required}>*</span>
            </label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profession">
              Profession actuelle<span className={styles.required}>*</span>
            </label>
            <input id="profession" name="profession" value={form.profession} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="domaine">
              Domaine d&apos;expertise<span className={styles.required}>*</span>
            </label>
            <select id="domaine" name="domaine" value={form.domaine} onChange={handleChange} required>
              <option value="">--</option>
              {FILIERES.map(({ nom }) => <option key={nom} value={nom}>{nom}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="experience">
              Années d&apos;expérience<span className={styles.required}>*</span>
            </label>
            <select id="experience" name="experience" value={form.experience} onChange={handleChange} required>
              <option value="">--</option>
              {EXPERIENCE.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="disponibilite">
              Disponibilité mensuelle<span className={styles.required}>*</span>
            </label>
            <select id="disponibilite" name="disponibilite" value={form.disponibilite} onChange={handleChange} required>
              <option value="">--</option>
              {DISPONIBILITE.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <fieldset className={`${styles.field} ${styles.full}`} style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className={styles.label} style={{ padding: 0 }}>
              Mode de mentorat préféré<span className={styles.required}>*</span>
            </legend>
            <div className={styles.radioRow}>
              {MODES.map((m) => (
                <label key={m} className={styles.choice}>
                  <input
                    type="radio"
                    name="mode"
                    value={m}
                    checked={form.mode === m}
                    onChange={handleChange}
                  />
                  {m}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="motivation">
              Pourquoi devenir mentor ?<span className={styles.required}>*</span>
            </label>
            <textarea
              id="motivation"
              name="motivation"
              className={styles.textarea}
              value={form.motivation}
              onChange={handleChange}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="lien">Lien LinkedIn ou CV URL</label>
            <input
              id="lien"
              name="lien"
              type="url"
              placeholder="https://"
              value={form.lien}
              onChange={handleChange}
            />
          </div>

          {soumis && (
            <p className={styles.notice} role="status">
              Votre candidature de mentor a bien été envoyée. Merci ! L&apos;équipe du CAMAJ
              vous recontactera prochainement.
            </p>
          )}

          {erreur && (
            <p className={styles.noticeError} role="alert">{erreur}</p>
          )}

          <div className={styles.full}>
            <button type="submit" className={`hover-lift ${styles.submit}`} disabled={envoi}>
              {envoi ? 'Envoi…' : 'Postuler comme Mentor'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
