'use client';

import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { PROGRAMMES } from '../../app/camaj/programmes';
import { camajService } from '../../services/camaj.service';
import styles from './CamajForm.module.css';

// Accent orange pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-orange)',
  '--form-accent-soft': 'rgba(254, 89, 1, 0.12)',
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

const SITUATIONS = [
  'Élève', 'Étudiant(e)', 'Diplômé(e) sans emploi', 'En recherche d\'emploi',
  'Salarié(e)', 'Entrepreneur(e)', 'Apprenti(e)', 'Autre',
];

const DISPONIBILITES = ['En semaine', 'Le week-end', 'En soirée'];

const MOTS_MIN = 50;

const compterMots = (texte) => texte.trim().split(/\s+/).filter(Boolean).length;

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
  const [form, setForm] = useState(ETAT_INITIAL);
  const [soumis, setSoumis] = useState(false);
  const [defisTouche, setDefisTouche] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const mots = compterMots(form.defis);
  const motsSuffisants = mots >= MOTS_MIN;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((precedent) => ({ ...precedent, [name]: value }));
    setSoumis(false);
  };

  const handleDisponibilite = (valeur) => {
    setForm((precedent) => ({
      ...precedent,
      disponibilites: precedent.disponibilites.includes(valeur)
        ? precedent.disponibilites.filter((d) => d !== valeur)
        : [...precedent.disponibilites, valeur],
    }));
    setSoumis(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDefisTouche(true);
    if (!motsSuffisants) return;
    setErreur('');
    setEnvoi(true);
    try {
      await camajService.submit('programme', form);
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
          <GraduationCap size={28} />
        </span>
        <h1 className="text-primary" style={{ marginBottom: 0 }}>Rejoindre le Programme</h1>
      </div>
      <hr className={styles.rule} />

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

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="defis">
              Quels sont vos défis principaux ?<span className={styles.required}>*</span>
            </label>
            <textarea
              id="defis"
              name="defis"
              className={styles.textarea}
              value={form.defis}
              onChange={handleChange}
              onBlur={() => setDefisTouche(true)}
              aria-describedby="compteur-defis"
              required
            />
            <span
              id="compteur-defis"
              className={`${styles.counter} ${motsSuffisants ? styles.counterOk : styles.counterShort}`}
            >
              {mots} / {MOTS_MIN} mots minimum
            </span>
            {defisTouche && !motsSuffisants && (
              <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                Développez un peu : il manque {MOTS_MIN - mots} mot{MOTS_MIN - mots > 1 ? 's' : ''}.
              </span>
            )}
          </div>

          <fieldset
            className={`${styles.field} ${styles.full}`}
            style={{ border: 'none', padding: 0, margin: 0 }}
          >
            <legend className={styles.label} style={{ padding: 0 }}>Disponibilité</legend>
            <div className={styles.checkColumn}>
              {DISPONIBILITES.map((d) => (
                <label key={d} className={styles.choice}>
                  <input
                    type="checkbox"
                    name="disponibilites"
                    value={d}
                    checked={form.disponibilites.includes(d)}
                    onChange={() => handleDisponibilite(d)}
                  />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="origine">Comment avez-vous connu CAMAJ ?</label>
            <input id="origine" name="origine" value={form.origine} onChange={handleChange} />
          </div>

          {soumis && (
            <p className={styles.notice} role="status">
              Votre candidature au programme a bien été envoyée. Merci ! L&apos;équipe du CAMAJ
              vous recontactera prochainement.
            </p>
          )}

          {erreur && (
            <p className={styles.noticeError} role="alert">{erreur}</p>
          )}

          <div className={styles.full}>
            <button type="submit" className={`hover-lift ${styles.submit}`} disabled={envoi}>
              {envoi ? 'Envoi…' : 'Postuler au Programme'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
