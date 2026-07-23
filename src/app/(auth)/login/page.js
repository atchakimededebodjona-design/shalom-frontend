'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AuthLogo } from '../../../components/layout/AuthLogo';
import { getApiError } from '../../../utils/apiError';
import Link from 'next/link';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getApiError(err, 'Erreur lors de la connexion'));
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <AuthLogo />
      <h1 className="text-center mb-xs mt-md" style={{ color: '#F8FAFC' }}>Bon retour</h1>
      <p className="text-center mb-xl text-muted">Connectez-vous pour continuer</p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%' }}>
          Se connecter
        </Button>
      </form>

      <p className="text-center text-sm mt-xl" style={{ color: '#94A3B8' }}>
        Pas encore de compte ? <Link href="/register" className="font-bold hover-lift" style={{ color: 'var(--primary)', display: 'inline-block' }}>S'inscrire</Link>
      </p>
    </div>
  );
}
