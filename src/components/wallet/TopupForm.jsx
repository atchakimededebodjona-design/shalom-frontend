'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { getApiError } from '../../utils/apiError';
import styles from '../finance/finance.module.css';

// cinetpay et paygate sont des intégrations réelles côté backend ; fedapay
// reste en stub (voir wallet.service.js backend).
const PROVIDERS = [
  { v: 'cinetpay', l: 'CinetPay' },
  { v: 'paygate', l: 'PayGate Global' },
  { v: 'fedapay', l: 'FedaPay' },
];

// Seules ces deux valeurs sont acceptées par le backend (wallet.validator.js) —
// select fermé, jamais de saisie libre pour ce champ.
const PAYGATE_NETWORKS = [
  { v: 'FLOOZ', l: 'Flooz (Moov Africa)' },
  { v: 'TMONEY', l: 'T-Money (Togocom)' },
];

// Rechargement du portefeuille via un provider. Le crédit réel n'a lieu qu'à la
// confirmation du provider (webhook) — jamais à l'initiation, quel que soit le
// provider. ⚠️ fedapay reste en stub côté backend : l'URL renvoyée est factice.
export const TopupForm = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('cinetpay');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState('FLOOZ');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [payment, setPayment] = useState(null);

  const isPaygate = provider === 'paygate';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!(Number(amount) > 0)) { setError('Le montant doit être supérieur à 0.'); return; }
    if (isPaygate && !phoneNumber.trim()) { setError('Le numéro Mobile Money est requis pour PayGate.'); return; }
    if (isPaygate && !PAYGATE_NETWORKS.some((n) => n.v === network)) { setError('Choisissez un réseau valide.'); return; }

    setSaving(true);
    try {
      // Ces contrôles sont un confort UX uniquement — le backend revalide
      // tout (montant, format, provider) et reste seul décisionnaire.
      const body = isPaygate
        ? { amount: Number(amount), provider, phone_number: phoneNumber.trim(), network }
        : { amount: Number(amount), provider };
      const result = await onSubmit(body);
      setPayment(result); // { payment_url, provider_tx_id, reference, stub, ... }
    } catch (err) {
      setError(getApiError(err, "L'initiation du rechargement a échoué."));
    } finally {
      setSaving(false);
    }
  };

  if (payment) {
    // PayGate (push USSD) ne renvoie pas de payment_url : l'utilisateur
    // confirme directement sur son téléphone, il n'y a rien à "ouvrir".
    return (
      <div className="flex-col gap-md" style={{ display: 'flex' }}>
        <p className="text-sm text-muted" style={{ margin: 0 }}>
          {payment.payment_url
            ? "Rechargement initié. Ouvrez la page de paiement pour finaliser — le solde sera crédité après confirmation du provider."
            : 'Une demande de paiement a été envoyée sur votre téléphone. Confirmez-la pour finaliser — le solde sera crédité après confirmation du provider, pas avant.'}
        </p>
        {payment.stub && (
          <p className={styles.errorMsg} style={{ color: 'var(--primary)' }}>
            ⚠️ Provider en test : l'URL ci-dessous est factice (intégration réelle à venir).
          </p>
        )}
        {payment.payment_url && (
          <a href={payment.payment_url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
            <Button type="button">
              <span className="flex items-center gap-xs"><ExternalLink size={16} /> Ouvrir le paiement</span>
            </Button>
          </a>
        )}
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onCancel}>Fermer</Button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tp-amount">Montant (FCFA)</label>
          <input
            id="tp-amount" className={styles.input} type="number" min="1" inputMode="numeric"
            placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tp-provider">Moyen de paiement</label>
          <select id="tp-provider" className={styles.select} value={provider} onChange={(e) => setProvider(e.target.value)}>
            {PROVIDERS.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
          </select>
        </div>

        {isPaygate && (
          <>
            <div className={`${styles.field} ${styles.full}`}>
              <label className={styles.label} htmlFor="tp-phone">Numéro Mobile Money</label>
              <input
                id="tp-phone" className={styles.input} type="tel" inputMode="tel" autoComplete="tel"
                placeholder="Ex : 90010203" value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)} required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tp-network">Réseau</label>
              <select id="tp-network" className={styles.select} value={network} onChange={(e) => setNetwork(e.target.value)}>
                {PAYGATE_NETWORKS.map((n) => <option key={n.v} value={n.v}>{n.l}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>Recharger</Button>
      </div>
    </form>
  );
};
