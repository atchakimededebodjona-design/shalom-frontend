'use client';

import { useState } from 'react';
import { Rocket, UploadCloud } from 'lucide-react';
import { FILIERES } from '../../app/camaj/filieres';
import { camajService } from '../../services/camaj.service';
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

const compterMots = (texte) => texte.trim().split(/\s+/).filter(Boolean).length;

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
  const [form, setForm] = useState(ETAT_INITIAL);
  const [soumis, setSoumis] = useState(false);
  const [descriptionTouche, setDescriptionTouche] = useState(false);
  const [soutiensTouche, setSoutiensTouche] = useState(false);
  const [fichierErreur, setFichierErreur] = useState('');
  const [associesTouche, setAssociesTouche] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const mots = compterMots(form.description);
  const motsSuffisants = mots >= MOTS_MIN;
  const soutiensManquants = form.soutiens.length === 0;
  const collectif = form.typeProjet === 'Projet collectif';
  const associesManquants = collectif && !form.associes.trim();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((precedent) => ({ ...precedent, [name]: value }));
    setSoumis(false);
  };

  const handleSoutien = (valeur) => {
    setForm((precedent) => ({
      ...precedent,
      soutiens: precedent.soutiens.includes(valeur)
        ? precedent.soutiens.filter((s) => s !== valeur)
        : [...precedent.soutiens, valeur],
    }));
    setSoumis(false);
  };

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
    setForm((precedent) => ({ ...precedent, fichier: fichier.name }));
    setSoumis(false);
  };

  // Le PDF n'est pas téléversé : seul son nom (form.fichier) est transmis.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDescriptionTouche(true);
    setSoutiensTouche(true);
    setAssociesTouche(true);
    if (!motsSuffisants || soutiensManquants || associesManquants) return;
    setErreur('');
    setEnvoi(true);
    try {
      await camajService.submit('faj', form);
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

      <form className={styles.card} onSubmit={handleSubmit}>
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

          <fieldset className={`${styles.field} ${styles.full}`} style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className={styles.label} style={{ padding: 0 }}>
              Type de projet<span className={styles.required}>*</span>
            </legend>
            <div className={styles.radioRow}>
              {['Projet individuel', 'Projet collectif'].map((choix) => (
                <label key={choix} className={styles.choice}>
                  <input
                    type="radio"
                    name="typeProjet"
                    value={choix}
                    checked={form.typeProjet === choix}
                    onChange={handleChange}
                  />
                  {choix}
                </label>
              ))}
            </div>
          </fieldset>

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

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="description">
              Description du projet<span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              value={form.description}
              onChange={handleChange}
              onBlur={() => setDescriptionTouche(true)}
              aria-describedby="compteur-description"
              required
            />
            <span
              id="compteur-description"
              className={`${styles.counter} ${motsSuffisants ? styles.counterOk : styles.counterShort}`}
            >
              {mots} / {MOTS_MIN} mots minimum
            </span>
            {descriptionTouche && !motsSuffisants && (
              <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                Développez un peu : il manque {MOTS_MIN - mots} mot{MOTS_MIN - mots > 1 ? 's' : ''}.
              </span>
            )}
          </div>

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

          <fieldset className={styles.field} style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className={styles.label} style={{ padding: 0 }}>
              Avez-vous suivi la formation CAMAJ ?<span className={styles.required}>*</span>
            </legend>
            <div className={styles.radioRow}>
              {['Oui', 'Non'].map((choix) => (
                <label key={choix} className={styles.choice}>
                  <input
                    type="radio"
                    name="formationCamaj"
                    value={choix}
                    checked={form.formationCamaj === choix}
                    onChange={handleChange}
                  />
                  {choix}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset
            className={`${styles.field} ${styles.full}`}
            style={{ border: 'none', padding: 0, margin: 0 }}
          >
            <legend className={styles.label} style={{ padding: 0 }}>
              Types de soutien<span className={styles.required}>*</span>
            </legend>
            <div className={styles.checkColumn}>
              {SOUTIENS.map((s) => (
                <label key={s} className={styles.choice}>
                  <input
                    type="checkbox"
                    name="soutiens"
                    value={s}
                    checked={form.soutiens.includes(s)}
                    onChange={() => handleSoutien(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
            {soutiensTouche && soutiensManquants && (
              <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                Choisissez au moins un type de soutien.
              </span>
            )}
          </fieldset>

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

          {soumis && (
            <p className={styles.notice} role="status">
              Votre projet a bien été soumis. Merci ! L&apos;équipe du CAMAJ examinera votre
              dossier et vous recontactera prochainement.
            </p>
          )}

          {erreur && (
            <p className={styles.noticeError} role="alert">{erreur}</p>
          )}

          <div className={styles.full}>
            <button type="submit" className={`hover-lift ${styles.submit}`} disabled={envoi}>
              {envoi ? 'Envoi…' : 'Soumettre le Projet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
