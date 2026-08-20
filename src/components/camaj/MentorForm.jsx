'use client';

import { Users } from 'lucide-react';
import { FILIERES } from '../../app/camaj/filieres';
import { PAYS } from './camaj-constants';
import { useCamajForm } from './useCamajForm';
import { PhoneField, ChoiceGroup, FormFeedback, SubmitButton } from './CamajFormFields';
import styles from './CamajForm.module.css';

// Accent marine pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-navy)',
  '--form-accent-soft': 'rgba(1, 41, 99, 0.10)',
};

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
  const { form, handleChange, soumis, envoi, erreur, handleSubmit } = useCamajForm('mentor', ETAT_INITIAL);

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

          <PhoneField form={form} handleChange={handleChange} />

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

          <ChoiceGroup
            type="radio"
            name="mode"
            legend="Mode de mentorat préféré"
            required
            options={MODES}
            value={form.mode}
            onChange={handleChange}
          />

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

          <FormFeedback
            soumis={soumis}
            successMessage="Votre candidature de mentor a bien été envoyée. Merci ! L'équipe du CAMAJ vous recontactera prochainement."
            erreur={erreur}
          />

          <SubmitButton envoi={envoi} label="Postuler comme Mentor" />
        </div>
      </form>
    </div>
  );
};
