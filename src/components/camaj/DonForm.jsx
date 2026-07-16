'use client';

import { useState } from 'react';
import { Heart, Bell } from 'lucide-react';
import { camajService } from '../../services/camaj.service';
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
  const [form, setForm] = useState(ETAT_INITIAL);
  const [soumis, setSoumis] = useState(false);
  const [montantTouche, setMontantTouche] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const montantValide = Number(form.montant) > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((precedent) => ({ ...precedent, [name]: value }));
    setSoumis(false);
  };

  const handleMontant = (valeur) => {
    setForm((precedent) => ({ ...precedent, montant: String(valeur) }));
    setSoumis(false);
  };

  // On enregistre l'intention de don (aucun paiement n'est encaissé ici).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMontantTouche(true);
    if (!montantValide) return;
    setErreur('');
    setEnvoi(true);
    try {
      await camajService.submit('don', form);
      setSoumis(true);
    } catch (err) {
      setErreur(err.response?.data?.error || "L'envoi a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

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

      <form className={styles.card} onSubmit={handleSubmit}>
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

          <div className={styles.field}>
            <label className={styles.label} htmlFor="whatsapp">Numéro WhatsApp (Optionnel)</label>
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
              />
            </div>
          </div>

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

          {soumis && (
            <p className={styles.notice} role="status">
              Merci pour votre générosité ! Votre intention de don a bien été enregistrée.
              Aucun paiement n&apos;a été effectué : vous serez contacté(e) personnellement dès
              l&apos;ouverture de la collecte.
            </p>
          )}

          {erreur && (
            <p className={styles.noticeError} role="alert">{erreur}</p>
          )}

          <div className={styles.full}>
            <button type="submit" className={`hover-lift ${styles.submit}`} disabled={envoi}>
              {envoi ? 'Envoi…' : 'Confirmer le Don'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
