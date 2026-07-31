'use client';

import { useState } from 'react';
import { Flag, Check } from 'lucide-react';
import { reportsService } from '../../services/reports.service';
import { getApiError } from '../../utils/apiError';
import { Modal } from '../ui/Modal';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'contenu_inapproprie', label: 'Contenu inapproprié' },
  { value: 'harcelement', label: 'Harcèlement' },
  { value: 'faux_compte', label: 'Faux compte' },
  { value: 'autre', label: 'Autre' },
];

// Bouton de signalement réutilisable pour un post ou un commentaire.
// `targetType`: 'post' | 'comment' — `targetId`: UUID de la cible.
export const ReportButton = ({ targetType, targetId, size = 16 }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await reportsService.create({ target_type: targetType, target_id: targetId, reason, details: details.trim() });
      setDone(true);
      setOpen(false);
    } catch (err) {
      if (err.response?.data?.code === 'REPORT_ALREADY_EXISTS') {
        setDone(true);
        setOpen(false);
      } else {
        setError(getApiError(err, 'Impossible d\'envoyer le signalement'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <span
        className="flex items-center gap-xs text-muted text-sm"
        title="Signalé, merci"
        style={{ padding: 'var(--spacing-xs)' }}
      >
        <Check size={size} /> Signalé
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={targetType === 'post' ? 'Signaler la publication' : 'Signaler le commentaire'}
        title="Signaler"
        className="hover-lift"
        style={{ display: 'flex', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: 'var(--spacing-xs)' }}
      >
        <Flag size={size} />
      </button>

      <Modal isOpen={open} onClose={close} title={targetType === 'post' ? 'Signaler la publication' : 'Signaler le commentaire'}>
        <form onSubmit={submit} className="flex-col gap-md">
          <div className="flex-col gap-xs">
            {REASONS.map((r) => (
              <label key={r.value} className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>

          <div className="flex-col gap-xs">
            <label htmlFor="report-details" className="text-sm text-muted">Détails (facultatif)</label>
            <textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Précisez si besoin…"
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'red' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', fontWeight: 700 }}>
            {submitting ? 'Envoi…' : 'Envoyer le signalement'}
          </button>
        </form>
      </Modal>
    </>
  );
};
