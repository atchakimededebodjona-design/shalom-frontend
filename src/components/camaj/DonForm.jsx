'use client';

import { useState } from 'react';
import { Heart, Bell } from 'lucide-react';
import { PAYS } from './camaj-constants';
import { useCamajForm } from './useCamajForm';
import { PhoneField, FormFeedback, SubmitButton } from './CamajFormFields';
import styles from './CamajForm.module.css';

// Accent orange pour ce formulaire (cf. CamajForm.module.css).
const ACCENT = {
  '--form-accent': 'var(--camaj-orange)',
  '--form-accent-soft': 'rgba(254, 89, 1, 0.12)',
};

const IMPACTS = [
  { texte: '5K FCFA forme un jeune en leadership', couleur: '#012963' },
  { texte: '25K FCFA financent un micro-projet', couleur: '#FE5901' },
  { texte: '100K FCFA équipe une startup', couleur: '#328C28' },
];

const MONTANTS = [5000, 10000, 25000, 50000, 100000];

const DEDICACES = [
  'Là où le besoin est le plus grand',
  'Formation & Leadership',
  'Financement de micro-projets',
  'Équipement de startups',
  "Relation d'aide & accompagnement",
];

const ETAT_INITIAL = {
  nom: '',
  email: '',
  pays: 'Togo',
  indicatif: '+228',
  whatsapp: '',
  montant: '',
  dedicace: '',
  message: '',
};

export const DonForm = () => {
  const { form, handleChange, setField, soumis, envoi, erreur, handleSubmit } = useCamajForm('don', ETAT_INITIAL);
  const [montantTouche, setMontantTouche] = useState(false);

  const montantValide = Number(form.montant) > 0;

  const handleMontant = (valeur) => setField('montant', String(valeur));

  // On enregistre l'intention de don (aucun paiement n'est encaissé ici).
  const onSubmit = (e) => handleSubmit(e, () => {
    setMontantTouche(true);
    return montantValide;
  });

  return (
    <div style={ACCENT}>
      <div className={styles.headerDon}>
        <span className={styles.iconCircle} aria-hidden="true">
          <Heart size={30} />
        </span>
        <h1 className="text-primary" style={{ marginBottom: 0 }}>Faire un Don</h1>
        <p className={styles.subtitle}>Soutenez la jeunesse togolaise</p>
      </div>
      <hr className={styles.rule} />

      <div className={styles.impactGrid}>
        {IMPACTS.map(({ texte, couleur }) => (
          <div key={texte} className={styles.impactCard} style={{ backgroundColor: couleur }}>
            {texte}
          </div>
        ))}
      </div>

      <div className={styles.banner} role="note">
        <Bell size={20} className={styles.bannerIcon} aria-hidden="true" />
        <span>
          <strong>Collecte de fonds bientôt disponible.</strong>{' '}
          La collecte de fonds du CAMAJ n&apos;est pas encore opérationnelle. Nous travaillons activement à sa mise en place pour
          vous offrir un système de don sécurisé et transparent. En remplissant le formulaire
          ci-dessous, vous manifestez votre intention de soutenir le CAMAJ. Vous serez contacté(e)
          personnellement dès que la collecte sera ouverte. Merci pour votre générosité et votre
          confiance !
        </span>
      </div>

      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="nom">
              Nom complet<span className={styles.required}>*</span>
            </label>
            <input id="nom" name="nom" value={form.nom} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Adresse e-mail<span className={styles.required}>*</span>
            </label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="pays">Pays (Optionnel)</label>
            <select id="pays" name="pays" value={form.pays} onChange={handleChange}>
              {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <PhoneField form={form} handleChange={handleChange} required={false} label="Numéro WhatsApp (Optionnel)" />

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="montant">
              Montant (FCFA)<span className={styles.required}>*</span>
            </label>
            <div className={styles.montantChips}>
              {MONTANTS.map((valeur) => (
                <button
                  key={valeur}
                  type="button"
                  onClick={() => handleMontant(valeur)}
                  className={`${styles.montantChip} ${form.montant === String(valeur) ? styles.montantChipActive : ''}`}
                >
                  {valeur.toLocaleString('fr-FR')}
                </button>
              ))}
            </div>
            <input
              id="montant"
              name="montant"
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="Un montant..."
              value={form.montant}
              onChange={handleChange}
              onBlur={() => setMontantTouche(true)}
              required
            />
            {montantTouche && !montantValide && (
              <span className={styles.counterShort} style={{ fontSize: '0.8rem' }} role="alert">
                Indiquez un montant supérieur à 0.
              </span>
            )}
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="dedicace">
              Dédicace du don<span className={styles.required}>*</span>
            </label>
            <select id="dedicace" name="dedicace" value={form.dedicace} onChange={handleChange} required>
              <option value="">--</option>
              {DEDICACES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label className={styles.label} htmlFor="message">Message (facultatif)</label>
            <textarea
              id="message"
              name="message"
              className={styles.textarea}
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <FormFeedback
            soumis={soumis}
            successMessage="Merci pour votre générosité ! Votre intention de don a bien été enregistrée. Aucun paiement n'a été effectué : vous serez contacté(e) personnellement dès l'ouverture de la collecte."
            erreur={erreur}
          />

          <SubmitButton envoi={envoi} label="Confirmer le Don" />
        </div>
      </form>
    </div>
  );
};
