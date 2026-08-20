'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { PREFERENCE_CONTACT } from '../../app/camaj/relation-aide/domaines';
import { camajService } from '../../services/camaj.service';
import { INDICATIFS } from './camaj-constants';
import styles from '../../app/camaj/relation-aide/relation-aide.module.css';
import champStyles from './CamajForm.module.css';

const hexVersDoux = (hex) => {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
};

const construireEtatInitial = (domaine) => {
  const etat = {
    prenom: '',
    ville: '',
    indicatif: '+228',
    whatsapp: '',
    preferenceContact: '',
    consentement: false,
  };
  if (domaine.age) etat.age = '';
  domaine.champs.forEach((c) => {
    etat[c.name] = c.type === 'checkboxes' ? [] : '';
  });
  return etat;
};

export const AccompagnementModal = ({ domaine, onClose }) => {
  const [form, setForm] = useState(() => construireEtatInitial(domaine));
  const [soumis, setSoumis] = useState(false);
  const [touche, setTouche] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  // Décalage du haut = hauteur réelle de la barre de navigation (elle est plus
  // haute une fois connecté) + une petite marge. Ainsi la modale démarre
  // toujours sous l'en-tête, quel que soit l'état de connexion.
  const [decalageHaut, setDecalageHaut] = useState(null);

  useLayoutEffect(() => {
    const nav = document.querySelector('nav');
    const h = nav ? nav.getBoundingClientRect().height : 72;
    setDecalageHaut(`${Math.ceil(h) + 20}px`);
  }, []);

  // Verrouille le défilement du fond et ferme sur Échap tant que la modale est ouverte.
  useEffect(() => {
    const precedent = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = precedent;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const ACCENT = {
    '--form-accent': domaine.submitCouleur,
    '--form-accent-soft': hexVersDoux(domaine.submitCouleur),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSoumis(false);
  };

  const handleCase = (name, valeur) => {
    setForm((p) => ({
      ...p,
      [name]: p[name].includes(valeur) ? p[name].filter((v) => v !== valeur) : [...p[name], valeur],
    }));
    setSoumis(false);
  };

  const groupes = domaine.champs.filter((c) => c.type === 'checkboxes');
  const groupeManquant = (name) => touche && form[name].length === 0;
  const consentManquant = touche && !form.consentement;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouche(true);
    const groupesOk = groupes.every((c) => form[c.name].length > 0);
    if (!groupesOk || !form.consentement) return;
    setErreur('');
    setEnvoi(true);
    try {
      await camajService.submit('relation_aide', { ...form, domaine: domaine.slug, domaineTitre: domaine.titre });
      setSoumis(true);
    } catch (err) {
      setErreur(err.response?.data?.error || "L'envoi a échoué. Vérifie ta connexion et réessaie.");
    } finally {
      setEnvoi(false);
    }
  };

  const renderChamp = (champ) => {
    if (champ.type === 'select') {
      return (
        <div key={champ.name} className={`${champStyles.field} ${champ.full ? champStyles.full : ''}`}>
          <label className={champStyles.label} htmlFor={champ.name}>
            {champ.label}<span className={champStyles.required}>*</span>
          </label>
          <select id={champ.name} name={champ.name} value={form[champ.name]} onChange={handleChange} required>
            <option value="">--</option>
            {champ.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }

    if (champ.type === 'textarea') {
      return (
        <div key={champ.name} className={`${champStyles.field} ${champStyles.full}`}>
          <label className={champStyles.label} htmlFor={champ.name}>
            {champ.label}<span className={champStyles.required}>*</span>
          </label>
          <textarea
            id={champ.name}
            name={champ.name}
            className={champStyles.textarea}
            value={form[champ.name]}
            onChange={handleChange}
            required
          />
        </div>
      );
    }

    if (champ.type === 'radios') {
      return (
        <fieldset key={champ.name} className={`${champStyles.field} ${champStyles.full}`} style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className={champStyles.label} style={{ padding: 0 }}>
            {champ.label}<span className={champStyles.required}>*</span>
          </legend>
          <div className={champStyles.radioRow}>
            {champ.options.map((o) => (
              <label key={o} className={champStyles.choice}>
                <input type="radio" name={champ.name} value={o} checked={form[champ.name] === o} onChange={handleChange} required />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
      );
    }

    // checkboxes
    return (
      <fieldset key={champ.name} className={`${champStyles.field} ${champStyles.full}`} style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className={champStyles.label} style={{ padding: 0 }}>
          {champ.label}<span className={champStyles.required}>*</span>
        </legend>
        <div className={champStyles.checkColumn}>
          {champ.options.map((o) => (
            <label key={o} className={champStyles.choice}>
              <input
                type="checkbox"
                name={champ.name}
                value={o}
                checked={form[champ.name].includes(o)}
                onChange={() => handleCase(champ.name, o)}
              />
              {o}
            </label>
          ))}
        </div>
        {groupeManquant(champ.name) && (
          <span className={champStyles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
            Choisis au moins une option.
          </span>
        )}
      </fieldset>
    );
  };

  // Portail vers <body> : sort l'overlay du conteneur animé de la page (dont le
  // `transform` casserait le `position: fixed` et ferait défiler la modale avec
  // la page). Ancré au viewport, il reste donc parfaitement fixe.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={domaine.titre}
      style={decalageHaut ? { '--nav-clearance': decalageHaut } : undefined}
    >
      <div className={styles.modal} style={ACCENT} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Fermer">
          <X size={20} />
        </button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitre} style={{ color: domaine.titreCouleur }}>{domaine.titre}</h2>
          <p className={styles.modalSubtitle}>Remplis ce formulaire pour demander un accompagnement.</p>
        </div>

        <div className={styles.modalBody}>
          {domaine.urgence && (
            <div className={styles.urgence} role="note">
              <AlertTriangle size={18} className={styles.urgenceIcon} aria-hidden="true" />
              <span>{domaine.urgence}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={champStyles.grid}>
            <div className={champStyles.field}>
              <label className={champStyles.label} htmlFor="prenom">
                Prénom<span className={champStyles.required}>*</span>
              </label>
              <input id="prenom" name="prenom" value={form.prenom} onChange={handleChange} required />
            </div>

            {domaine.age && (
              <div className={champStyles.field}>
                <label className={champStyles.label} htmlFor="age">
                  Âge<span className={champStyles.required}>*</span>
                </label>
                <input id="age" name="age" type="number" min="10" max="99" value={form.age} onChange={handleChange} required />
              </div>
            )}

            <div className={champStyles.field}>
              <label className={champStyles.label} htmlFor="ville">
                Ville<span className={champStyles.required}>*</span>
              </label>
              <input id="ville" name="ville" value={form.ville} onChange={handleChange} required />
            </div>

            <div className={`${champStyles.field} ${domaine.age ? '' : champStyles.full}`}>
              <label className={champStyles.label} htmlFor="whatsapp">
                WhatsApp<span className={champStyles.required}>*</span>
              </label>
              <div className={champStyles.phoneRow}>
                <select name="indicatif" value={form.indicatif} onChange={handleChange} aria-label="Indicatif téléphonique">
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

            {domaine.champs.map(renderChamp)}

            <fieldset className={`${champStyles.field} ${champStyles.full}`} style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend className={champStyles.label} style={{ padding: 0 }}>
                Préférence de contact<span className={champStyles.required}>*</span>
              </legend>
              <div className={champStyles.radioRow}>
                {PREFERENCE_CONTACT.map((o) => (
                  <label key={o} className={champStyles.choice}>
                    <input
                      type="radio"
                      name="preferenceContact"
                      value={o}
                      checked={form.preferenceContact === o}
                      onChange={handleChange}
                      required
                    />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={champStyles.full}>
              <label className={styles.consentBox}>
                <input type="checkbox" checked={form.consentement} onChange={(e) => { setForm((p) => ({ ...p, consentement: e.target.checked })); setSoumis(false); }} />
                <span>
                  Je comprends que mes informations resteront strictement confidentielles.
                  <span className={champStyles.required}>*</span>
                </span>
              </label>
              {consentManquant && (
                <span className={champStyles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                  Coche cette case pour envoyer ta demande.
                </span>
              )}
            </div>

            {soumis && (
              <p className={champStyles.notice} role="status">
                Merci pour ta confiance. Ta demande a bien été envoyée — un conseiller du CAMAJ
                te recontactera en toute confidentialité.
              </p>
            )}

            {erreur && (
              <p className={champStyles.noticeError} role="alert">{erreur}</p>
            )}

            <div className={champStyles.full}>
              <button type="submit" className={`hover-lift ${champStyles.submit}`} disabled={envoi}>
                {envoi ? 'Envoi…' : 'Envoyer ma demande'}
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};
