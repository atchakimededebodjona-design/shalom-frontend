'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from '../finance/finance.module.css';

const PROVIDERS = [
  { v: 'cinetpay', l: 'CinetPay' },
  { v: 'fedapay', l: 'FedaPay' },
];

// Rechargement du portefeuille via un provider. Le crédit réel n'a lieu qu'à la
// confirmation du provider (webhook). Ici on obtient une URL de paiement.
// ⚠️ Provider en stub côté backend : l'URL renvoyée est factice pour l'instant.
export const TopupForm = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('cinetpay');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [payment, setPayment] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!(Number(amount) > 0)) { setError('Le montant doit être supérieur à 0.'); return; }
    setSaving(true);
    try {
      const result = await onSubmit({ amount: Number(amount), provider });
      setPayment(result); // { payment_url, provider_tx_id, stub, ... }
    } catch (err) {
      setError(err.response?.data?.error || "L'initiation du rechargement a échoué.");
    } finally {
      setSaving(false);
    }
  };

  if (payment) {
    return (
      <div className="flex-col gap-md" style={{ display: 'flex' }}>
        <p className="text-sm text-muted" style={{ margin: 0 }}>
          Rechargement initié. Ouvrez la page de paiement pour finaliser — le solde
          sera crédité après confirmation du provider.
        </p>
        {payment.stub && (
          <p className={styles.errorMsg} style={{ color: 'var(--primary)' }}>
            ⚠️ Provider en test : l'URL ci-dessous est factice (intégration réelle à venir).
          </p>
        )}
        <a href={payment.payment_url} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
          <Button type="button">
            <span className="flex items-center gap-xs"><ExternalLink size={16} /> Ouvrir le paiement</span>
          </Button>
        </a>
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
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" isLoading={saving}>Recharger</Button>
      </div>
    </form>
  );
};
