'use client';

import { useState } from 'react';
import { Rocket, UploadCloud } from 'lucide-react';
import { FILIERES } from '../../app/camaj/filieres';
import { PAYS, compterMots } from './camaj-constants';
import { useCamajForm } from './useCamajForm';
import { PhoneField, ChoiceGroup, WordCountedField, FormFeedback, SubmitButton } from './CamajFormFields';
import styles from './CamajForm.module.css';

// Accent vert pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-green)',
  '--form-accent-soft': 'rgba(50, 140, 40, 0.12)',
};

const CRITERES = [
  'Avoir entre 18 et 35 ans',
  'Projet innovant et viable',
  'Impact social ou environnemental',
  'Résider au Togo',
  'Engagement à plein temps',
];

const BUDGETS = [
  'Moins de 500 000 FCFA',
  '500 000 – 1 000 000 FCFA',
  '1 000 000 – 2 500 000 FCFA',
  '2 500 000 – 5 000 000 FCFA',
  'Plus de 5 000 000 FCFA',
];

const SOUTIENS = ['Financier', 'Mentorat', 'Équipement'];

const MOTS_MIN = 100;
const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

const ETAT_INITIAL = {
  nom: '',
  age: '',
  pays: 'Togo',
  ville: '',
  indicatif: '+228',
  whatsapp: '',
  email: '',
  projet: '',
  secteur: '',
  typeProjet: 'Projet individuel',
  associes: '',
  description: '',
  probleme: '',
  cibles: '',
  budget: '',
  formationCamaj: 'Non',
  soutiens: [],
  fichier: '',
};

export const ProjetFajForm = () => {
  const { form, setField, handleChange, toggleValue, soumis, envoi, erreur, handleSubmit } = useCamajForm('faj', ETAT_INITIAL);
  const [descriptionTouche, setDescriptionTouche] = useState(false);
  const [soutiensTouche, setSoutiensTouche] = useState(false);
  const [fichierErreur, setFichierErreur] = useState('');
  const [associesTouche, setAssociesTouche] = useState(false);

  const motsSuffisants = compterMots(form.description) >= MOTS_MIN;
  const soutiensManquants = form.soutiens.length === 0;
  const collectif = form.typeProjet === 'Projet collectif';
  const associesManquants = collectif && !form.associes.trim();

  const handleFichier = (e) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    if (fichier.type !== 'application/pdf') {
      setFichierErreur('Le fichier doit être au format PDF.');
      return;
    }
    if (fichier.size > TAILLE_MAX) {
      setFichierErreur('Le fichier dépasse la taille maximale de 5 Mo.');
      return;
    }
    setFichierErreur('');
    setField('fichier', fichier.name);
  };

  // Le PDF n'est pas téléversé : seul son nom (form.fichier) est transmis.
  const onSubmit = (e) => handleSubmit(e, () => {
    setDescriptionTouche(true);
    setSoutiensTouche(true);
    setAssociesTouche(true);
    return motsSuffisants && !soutiensManquants && !associesManquants;
  });

  return (
    <div style={ACCENT}>
      <div className={styles.header}>
        <span className={styles.iconBox} aria-hidden="true">
          <Rocket size={28} />
        </span>
        <h1 className="text-primary" style={{ marginBottom: 0 }}>Soumettre un Projet FAJ</h1>
      </div>
      <hr className={styles.rule} />

      <section className={styles.criteres}>
        <h2 className={styles.criteresTitre}>Critères d&apos;éligibilité</h2>
        <ul className={styles.criteresList}>
          {CRITERES.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

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
              Âge (18-35)<span className={styles.required}>*</span>
            </label>
            <input id="age" name="age" type="number" min="18" max="35" value={form.age} onChange={handleChange} required />
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
            <label className={styles.label} htmlFor="projet">
              Nom du Projet<span className={styles.required}>*</span>
            </label>
            <input id="projet" name="projet" value={form.projet} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="secteur">
              Secteur d&apos;Activité<span className={styles.required}>*</span>
            </label>
            <select id="secteur" name="secteur" value={form.secteur} onChange={handleChange} required>
              <option value="">--</option>
              {FILIERES.map(({ nom }) => <option key={nom} value={nom}>{nom}</option>)}
            </select>
          </div>

          <ChoiceGroup
            type="radio"
            name="typeProjet"
            legend="Type de projet"
            required
            options={['Projet individuel', 'Projet collectif']}
            value={form.typeProjet}
            onChange={handleChange}
          />

          {collectif && (
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.label} htmlFor="associes">
                Noms des associés<span className={styles.required}>*</span>
              </label>
              {/* Pas d'attribut `required` natif : la validation custom
                  (associesManquants) gère le champ et affiche un message stylé
                  cohérent avec le reste du formulaire, y compris pour une
                  saisie composée uniquement d'espaces. */}
              <textarea
                id="associes"
                name="associes"
                className={styles.textarea}
                value={form.associes}
                onChange={handleChange}
                onBlur={() => setAssociesTouche(true)}
                placeholder="Un associé par ligne (nom et prénom)"
              />
              {associesTouche && associesManquants && (
                <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                  Renseignez le nom des associés du projet.
                </span>
              )}
            </div>
          )}

          <WordCountedField
            id="description"
            label="Description du projet"
            value={form.description}
            onChange={handleChange}
            onBlur={() => setDescriptionTouche(true)}
            minWords={MOTS_MIN}
            touched={descriptionTouche}
          />

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="probleme">
              Problème résolu<span className={styles.required}>*</span>
            </label>
            <textarea
              id="probleme"
              name="probleme"
              className={styles.textarea}
              value={form.probleme}
              onChange={handleChange}
              required
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="cibles">
              Cibles<span className={styles.required}>*</span>
            </label>
            <textarea
              id="cibles"
              name="cibles"
              className={styles.textarea}
              value={form.cibles}
              onChange={handleChange}
              placeholder="À qui s'adresse votre projet ? (public cible, bénéficiaires visés)"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="budget">
              Budget estimé<span className={styles.required}>*</span>
            </label>
            <select id="budget" name="budget" value={form.budget} onChange={handleChange} required>
              <option value="">--</option>
              {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <ChoiceGroup
            type="radio"
            name="formationCamaj"
            legend="Avez-vous suivi la formation CAMAJ ?"
            required
            full={false}
            options={['Oui', 'Non']}
            value={form.formationCamaj}
            onChange={handleChange}
          />

          <ChoiceGroup
            type="checkbox"
            name="soutiens"
            legend="Types de soutien"
            required
            options={SOUTIENS}
            value={form.soutiens}
            onChange={(v) => toggleValue('soutiens', v)}
            error={soutiensTouche && soutiensManquants ? 'Choisissez au moins un type de soutien.' : null}
          />

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="fichier">Plan d&apos;affaires (PDF)</label>
            <label className={styles.dropzone}>
              <UploadCloud size={28} aria-hidden="true" />
              {form.fichier ? (
                <span className={styles.fileName}>{form.fichier}</span>
              ) : (
                <>
                  <span>Cliquez pour télécharger</span>
                  <span className={styles.dropzoneHint}>Format : .pdf (Taille maximale : 5 Mo)</span>
                </>
              )}
              <input
                id="fichier"
                name="fichier"
                type="file"
                accept="application/pdf"
                onChange={handleFichier}
                hidden
              />
            </label>
            {fichierErreur && (
              <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                {fichierErreur}
              </span>
            )}
          </div>

          <FormFeedback
            soumis={soumis}
            successMessage="Votre projet a bien été soumis. Merci ! L'équipe du CAMAJ examinera votre dossier et vous recontactera prochainement."
            erreur={erreur}
          />

          <SubmitButton envoi={envoi} label="Soumettre le Projet" />
        </div>
      </form>
    </div>
  );
};
