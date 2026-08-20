'use client';

import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { PROGRAMMES } from '../../app/camaj/programmes';
import { PAYS, compterMots } from './camaj-constants';
import { useCamajForm } from './useCamajForm';
import { PhoneField, ChoiceGroup, WordCountedField, FormFeedback, SubmitButton } from './CamajFormFields';
import styles from './CamajForm.module.css';

// Accent orange pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-orange)',
  '--form-accent-soft': 'rgba(254, 89, 1, 0.12)',
};

const SITUATIONS = [
  'Élève', 'Étudiant(e)', 'Diplômé(e) sans emploi', 'En recherche d\'emploi',
  'Salarié(e)', 'Entrepreneur(e)', 'Apprenti(e)', 'Autre',
];

const DISPONIBILITES = ['En semaine', 'Le week-end', 'En soirée'];

const MOTS_MIN = 50;

const ETAT_INITIAL = {
  nom: '',
  age: '',
  pays: 'Togo',
  ville: '',
  indicatif: '+228',
  whatsapp: '',
  email: '',
  situation: '',
  programme: '',
  defis: '',
  disponibilites: [],
  origine: '',
};

export const ProgrammeForm = () => {
  const { form, handleChange, toggleValue, soumis, envoi, erreur, handleSubmit } = useCamajForm('programme', ETAT_INITIAL);
  const [defisTouche, setDefisTouche] = useState(false);

  const motsSuffisants = compterMots(form.defis) >= MOTS_MIN;

  const onSubmit = (e) => handleSubmit(e, () => {
    setDefisTouche(true);
    return motsSuffisants;
  });

  return (
    <div style={ACCENT}>
      <div className={styles.header}>
        <span className={styles.iconBox} aria-hidden="true">
          <GraduationCap size={28} />
        </span>
        <h1 className="text-primary" style={{ marginBottom: 0 }}>Rejoindre le Programme</h1>
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
            <input id="age" name="age" type="number" min="15" max="99" value={form.age} onChange={handleChange} required />
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
            <label className={styles.label} htmlFor="situation">
              Situation Actuelle<span className={styles.required}>*</span>
            </label>
            <select id="situation" name="situation" value={form.situation} onChange={handleChange} required>
              <option value="">--</option>
              {SITUATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="programme">
              Programme Souhaité<span className={styles.required}>*</span>
            </label>
            <select id="programme" name="programme" value={form.programme} onChange={handleChange} required>
              <option value="">--</option>
              {PROGRAMMES.map(({ titre }) => <option key={titre} value={titre}>{titre}</option>)}
            </select>
          </div>

          <WordCountedField
            id="defis"
            label="Quels sont vos défis principaux ?"
            value={form.defis}
            onChange={handleChange}
            onBlur={() => setDefisTouche(true)}
            minWords={MOTS_MIN}
            touched={defisTouche}
          />

          <ChoiceGroup
            type="checkbox"
            name="disponibilites"
            legend="Disponibilité"
            options={DISPONIBILITES}
            value={form.disponibilites}
            onChange={(v) => toggleValue('disponibilites', v)}
          />

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="origine">Comment avez-vous connu CAMAJ ?</label>
            <input id="origine" name="origine" value={form.origine} onChange={handleChange} />
          </div>

          <FormFeedback
            soumis={soumis}
            successMessage="Votre candidature au programme a bien été envoyée. Merci ! L'équipe du CAMAJ vous recontactera prochainement."
            erreur={erreur}
          />

          <SubmitButton envoi={envoi} label="Postuler au Programme" />
        </div>
      </form>
    </div>
  );
};
