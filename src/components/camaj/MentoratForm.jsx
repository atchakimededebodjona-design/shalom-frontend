'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FILIERES } from '../../app/camaj/filieres';
import { camajService } from '../../services/camaj.service';
import styles from './CamajForm.module.css';

// Accent vert pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-green)',
  '--form-accent-soft': 'rgba(50, 140, 40, 0.12)',
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
  const [form, setForm] = useState(ETAT_INITIAL);
  const [soumis, setSoumis] = useState(false);
  const [dispoTouche, setDispoTouche] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const dispoManquante = form.disponibilites.length === 0;

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
    setDispoTouche(true);
    if (dispoManquante) return;
    setErreur('');
    setEnvoi(true);
    try {
      await camajService.submit('mentorat', form);
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
          <MessageSquare size={28} />
        </span>
        <h1 className="text-primary" style={{ marginBottom: 0 }}>Demander du Mentorat</h1>
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

          <fieldset
            className={`${styles.field} ${styles.full}`}
            style={{ border: 'none', padding: 0, margin: 0 }}
          >
            <legend className={styles.label} style={{ padding: 0 }}>
              Disponibilité<span className={styles.required}>*</span>
            </legend>
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
            {dispoTouche && dispoManquante && (
              <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                Choisissez au moins une disponibilité.
              </span>
            )}
          </fieldset>

          <fieldset className={`${styles.field} ${styles.full}`} style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className={styles.label} style={{ padding: 0 }}>
              Mode préféré<span className={styles.required}>*</span>
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

          {soumis && (
            <p className={styles.notice} role="status">
              Votre demande de mentorat a bien été envoyée. Merci ! L&apos;équipe du CAMAJ
              vous recontactera prochainement.
            </p>
          )}

          {erreur && (
            <p className={styles.noticeError} role="alert">{erreur}</p>
          )}

          <div className={styles.full}>
            <button type="submit" className={`hover-lift ${styles.submit}`} disabled={envoi}>
              {envoi ? 'Envoi…' : 'Demander un mentor'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
