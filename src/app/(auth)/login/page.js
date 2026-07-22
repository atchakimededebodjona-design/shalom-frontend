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
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <AuthLogo />
      <h1 className="text-center mb-xs" style={{ color: '#F8FAFC', fontSize: '1.75rem', marginTop: 'var(--spacing-md)' }}>Bon retour</h1>
      <p className="text-center mb-xl" style={{ color: '#94A3B8' }}>Connectez-vous pour continuer</p>

      {error && <div style={{ color: '#fff', backgroundColor: 'rgba(220,38,38,0.85)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(220,38,38,0.3)' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        />
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        />
        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '0.75rem', padding: 'var(--spacing-md)', fontSize: '1.1rem', background: 'var(--gradient-primary)', border: 'none', color: '#0A1626', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(201, 160, 56, 0.3)' }}>
          Se connecter
        </Button>
      </form>

      <p className="text-center text-sm mt-xl" style={{ color: '#94A3B8' }}>
        Pas encore de compte ? <Link href="/register" className="font-bold hover-lift" style={{ color: 'var(--primary)', display: 'inline-block' }}>S'inscrire</Link>
      </p>
    </div>
  );
}
