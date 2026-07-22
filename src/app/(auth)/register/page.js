'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AuthLogo } from '../../../components/layout/AuthLogo';
import Link from 'next/link';

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
    } catch (err) {
      const data = err.response?.data;
      const messages = Array.isArray(data?.details)
        ? [...new Set(data.details.map((d) => d.message))]
        : [];
      setError(
        messages.length
          ? messages.join(' ')
          : data?.error || 'Erreur lors de l\'inscription'
      );
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <AuthLogo />
      <h1 className="text-center mb-xs" style={{ color: '#F8FAFC', fontSize: '1.75rem', marginTop: 'var(--spacing-md)' }}>Rejoignez-nous</h1>
      <p className="text-center mb-xl" style={{ color: '#94A3B8' }}>Créez votre compte en quelques secondes</p>

      {error && <div style={{ color: '#fff', backgroundColor: 'rgba(220,38,38,0.85)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(220,38,38,0.3)' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={handleChange}
          required
          placeholder="Nom d'affichage"
          style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        />
        <Input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="E-mail"
          style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
        />
        <div className="flex-col gap-xs">
          <Input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Mot de passe"
            style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          />
          <p className="text-sm" style={{ color: '#94A3B8', margin: 0, marginTop: '4px' }}>
            Au moins 8 caractères, dont une majuscule et un chiffre.
          </p>
        </div>
        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '0.75rem', padding: 'var(--spacing-md)', fontSize: '1.1rem', background: 'var(--gradient-primary)', border: 'none', color: '#0A1626', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(201, 160, 56, 0.3)' }}>
          S'inscrire
        </Button>
      </form>

      <p className="text-center text-sm mt-xl" style={{ color: '#94A3B8' }}>
        Déjà un compte ? <Link href="/login" className="font-bold hover-lift" style={{ color: 'var(--primary)', display: 'inline-block' }}>Se connecter</Link>
      </p>
    </div>
  );
}
