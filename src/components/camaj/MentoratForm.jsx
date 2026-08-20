'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FILIERES } from '../../app/camaj/filieres';
import { PAYS } from './camaj-constants';
import { useCamajForm } from './useCamajForm';
import { PhoneField, ChoiceGroup, FormFeedback, SubmitButton } from './CamajFormFields';
import styles from './CamajForm.module.css';

// Accent vert pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-green)',
  '--form-accent-soft': 'rgba(50, 140, 40, 0.12)',
};

const SITUATIONS = [
  'Élève', 'Étudiant(e)', 'Diplômé(e) sans emploi', 'En recherche d\'emploi',
  'Salarié(e)', 'Entrepreneur(e)', 'Apprenti(e)', 'Autre',
];

const DISPONIBILITES = ['En semaine', 'Le week-end'];

const MODES = ['En ligne', 'En présentiel', 'Hybride'];

const ETAT_INITIAL = {
  nom: '',
  age: '',
  pays: 'Togo',
  ville: '',
  indicatif: '+228',
  whatsapp: '',
  email: '',
  situation: '',
  domaine: '',
  objectifs: '',
  disponibilites: [],
  mode: 'En ligne',
};

export const MentoratForm = () => {
  const { form, handleChange, toggleValue, soumis, envoi, erreur, handleSubmit } = useCamajForm('mentorat', ETAT_INITIAL);
  const [dispoTouche, setDispoTouche] = useState(false);

  const dispoManquante = form.disponibilites.length === 0;

  const onSubmit = (e) => handleSubmit(e, () => {
    setDispoTouche(true);
    return !dispoManquante;
  });

  return (
    <div style={ACCENT}>
      <div className={styles.header}>
        <span className={styles.iconBox} aria-hidden="true">
          <MessageSquare size={28} />
        </span>
        <h1 className="text-primary" style={{ marginBottom: 0 }}>Demander du Mentorat</h1>
      </div>
      <hr className={styles.rule} />

      <form className={styles.card} onSubmit={onSubmit}>
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
            <input id="age" name="age" type="number" min="12" max="99" value={form.age} onChange={handleChange} required />
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
              Adresse e-mail<span className={styles.required}>*</span>
            </label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="situation">
              Situation actuelle<span className={styles.required}>*</span>
            </label>
            <select id="situation" name="situation" value={form.situation} onChange={handleChange} required>
              <option value="">--</option>
              {SITUATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="domaine">
              Domaine de mentorat<span className={styles.required}>*</span>
            </label>
            <select id="domaine" name="domaine" value={form.domaine} onChange={handleChange} required>
              <option value="">--</option>
              {FILIERES.map(({ nom }) => <option key={nom} value={nom}>{nom}</option>)}
            </select>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="objectifs">
              Vos objectifs<span className={styles.required}>*</span>
            </label>
            <textarea
              id="objectifs"
              name="objectifs"
              className={styles.textarea}
              value={form.objectifs}
              onChange={handleChange}
              required
            />
          </div>

          <ChoiceGroup
            type="checkbox"
            name="disponibilites"
            legend="Disponibilité"
            required
            options={DISPONIBILITES}
            value={form.disponibilites}
            onChange={(v) => toggleValue('disponibilites', v)}
            error={dispoTouche && dispoManquante ? 'Choisissez au moins une disponibilité.' : null}
          />

          <ChoiceGroup
            type="radio"
            name="mode"
            legend="Mode préféré"
            required
            options={MODES}
            value={form.mode}
            onChange={handleChange}
          />

          <FormFeedback
            soumis={soumis}
            successMessage="Votre demande de mentorat a bien été envoyée. Merci ! L'équipe du CAMAJ vous recontactera prochainement."
            erreur={erreur}
          />

          <SubmitButton envoi={envoi} label="Demander un mentor" />
        </div>
      </form>
    </div>
  );
};
