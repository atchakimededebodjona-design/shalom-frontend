'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { authService } from '../../../services/auth.service';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AuthLogo } from '../../../components/layout/AuthLogo';
import { getApiError } from '../../../utils/apiError';
import Link from 'next/link';

function VerifyEmailForm() {
  const { verifyEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail(email, code);
    } catch (err) {
      if (err.response?.data?.code === 'ALREADY_VERIFIED') {
        router.push('/login');
        return;
      }
      setError(getApiError(err, 'Code de vérification invalide'));
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMessage('');
    setResending(true);
    try {
      await authService.resendVerification({ email });
      setResendMessage('Un nouveau code vient d\'être envoyé.');
    } catch (err) {
      setError(getApiError(err, 'Impossible de renvoyer le code'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <AuthLogo />
      <h1 className="text-center mb-xs" style={{ color: '#F8FAFC', fontSize: '1.75rem', marginTop: 'var(--spacing-md)' }}>
        Vérifiez votre email
      </h1>
      <p className="text-center mb-xl" style={{ color: '#94A3B8' }}>
        {email
          ? <>Un code à 6 chiffres a été envoyé à <strong style={{ color: '#F8FAFC' }}>{email}</strong></>
          : 'Saisissez le code reçu par email'}
      </p>

      {error && <div className="alert-error">{error}</div>}
      {resendMessage && (
        <div
          style={{
            color: '#fff',
            backgroundColor: 'rgba(22, 163, 74, 0.85)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          {resendMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          placeholder="Code à 6 chiffres"
          style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
        />
        <Button type="submit" variant="primary" isLoading={loading} disabled={code.length !== 6} style={{ width: '100%' }}>
          Vérifier
        </Button>
      </form>

      <p className="text-center text-sm mt-xl text-muted">
        Vous n&apos;avez rien reçu ?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || !email}
          className="font-bold hover-lift text-primary"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline' }}
        >
          {resending ? 'Envoi…' : 'Renvoyer le code'}
        </button>
      </p>

      <p className="text-center text-sm mt-md text-muted">
        <Link href="/login" className="font-bold hover-lift text-primary" style={{ display: 'inline-block' }}>
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
