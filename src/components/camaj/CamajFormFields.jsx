'use client';

import { INDICATIFS, compterMots } from './camaj-constants';
import styles from './CamajForm.module.css';

// Bloc "indicatif + numéro WhatsApp" — identique dans 4 des 5 formulaires
// (Don le rend optionnel, sans astérisque ni attribut `required`).
export const PhoneField = ({ form, handleChange, required = true, label = 'Numéro WhatsApp' }) => (
  <div className={styles.field}>
    <label className={styles.label} htmlFor="whatsapp">
      {label}{required && <span className={styles.required}>*</span>}
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
        required={required}
      />
    </div>
  </div>
);

// Groupe de choix (checkbox multi-valeurs ou radio mono-valeur) — couvre
// disponibilités, soutiens, mode de mentorat, type de projet, etc.
// `onChange` : pour un checkbox, reçoit la valeur cliquée (toggleValue) ;
// pour un radio, reçoit l'évènement natif (handleChange), comme avant.
export const ChoiceGroup = ({
  type = 'checkbox', name, options, value, onChange, legend, required = false, full = true, error,
}) => {
  const isMulti = type === 'checkbox';
  return (
    <fieldset
      className={full ? `${styles.field} ${styles.full}` : styles.field}
      style={{ border: 'none', padding: 0, margin: 0 }}
    >
      <legend className={styles.label} style={{ padding: 0 }}>
        {legend}{required && <span className={styles.required}>*</span>}
      </legend>
      <div className={type === 'radio' ? styles.radioRow : styles.checkColumn}>
        {options.map((opt) => (
          <label key={opt} className={styles.choice}>
            <input
              type={type}
              name={name}
              value={opt}
              checked={isMulti ? value.includes(opt) : value === opt}
              onChange={isMulti ? () => onChange(opt) : onChange}
            />
            {opt}
          </label>
        ))}
      </div>
      {error && (
        <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
};

// Textarea pleine largeur avec compteur de mots et seuil minimum — utilisé
// pour "Quels sont vos défis principaux ?" (Programme) et "Description du
// projet" (Projet FAJ).
export const WordCountedField = ({ id, label, value, onChange, onBlur, minWords, touched, required = true }) => {
  const mots = compterMots(value);
  const ok = mots >= minWords;
  return (
    <div className={`${styles.field} ${styles.full}`}>
      <label className={styles.label} htmlFor={id}>
        {label}{required && <span className={styles.required}>*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        className={styles.textarea}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-describedby={`compteur-${id}`}
        required={required}
      />
      <span
        id={`compteur-${id}`}
        className={`${styles.counter} ${ok ? styles.counterOk : styles.counterShort}`}
      >
        {mots} / {minWords} mots minimum
      </span>
      {touched && !ok && (
        <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
          Développez un peu : il manque {minWords - mots} mot{minWords - mots > 1 ? 's' : ''}.
        </span>
      )}
    </div>
  );
};

// Message de succès / erreur affiché juste au-dessus du bouton d'envoi.
export const FormFeedback = ({ soumis, successMessage, erreur }) => (
  <>
    {soumis && (
      <p className={styles.notice} role="status">{successMessage}</p>
    )}
    {erreur && (
      <p className={styles.noticeError} role="alert">{erreur}</p>
    )}
  </>
);

export const SubmitButton = ({ envoi, label, busyLabel = 'Envoi…' }) => (
  <div className={styles.full}>
    <button type="submit" className={`hover-lift ${styles.submit}`} disabled={envoi}>
      {envoi ? busyLabel : label}
    </button>
  </div>
);
