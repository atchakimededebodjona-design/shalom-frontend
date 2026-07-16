'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AuthLogo } from '../../../components/layout/AuthLogo';
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
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
      <AuthLogo />
      <h1 className="text-center mb-sm" style={{ color: '#F3EFE4' }}>Bon retour</h1>
      <p className="text-center mb-lg" style={{ color: '#9AA5B4' }}>Connectez-vous pour continuer</p>

      {error && <div style={{ color: '#fff', backgroundColor: 'rgba(220,38,38,0.85)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

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
        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem', padding: 'var(--spacing-md)' }}>
          Entrer
        </Button>
      </form>

      <p className="text-center text-sm mt-md" style={{ color: '#9AA5B4' }}>
        Pas encore de compte ? <Link href="/register" className="font-bold" style={{ color: 'var(--primary)' }}>S'inscrire</Link>
      </p>
    </div>
  );
}
