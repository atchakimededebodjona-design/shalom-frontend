'use client';

import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { AuthLogo } from '../../../components/layout/AuthLogo';
import { getApiError } from '../../../utils/apiError';
import Link from 'next/link';

export default function Register() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      await register(payload);
    } catch (err) {
      const data = err.response?.data;
      const messages = Array.isArray(data?.details)
        ? [...new Set(data.details.map((d) => d.message))]
        : [];
      setError(
        messages.length
          ? messages.join(' ')
          : getApiError(err, 'Erreur lors de l\'inscription')
      );
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <AuthLogo />
      <h1 className="text-center mb-xs" style={{ color: '#F8FAFC', fontSize: '1.75rem', marginTop: 'var(--spacing-md)' }}>Rejoignez-nous</h1>
      <p className="text-center mb-xl" style={{ color: '#94A3B8' }}>Créez votre compte en quelques secondes</p>

      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={handleChange}
          required
          placeholder="Nom d'affichage"
        />
        <Input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="E-mail"
        />
        <div className="flex-col gap-xs">
          <Input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Mot de passe"
          />
          <p className="text-sm text-muted" style={{ margin: 0, marginTop: '4px' }}>
            Au moins 8 caractères, dont une majuscule et un chiffre.
          </p>
        </div>
        <Input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Confirmer le mot de passe"
        />
        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%' }}>
          S'inscrire
        </Button>
      </form>

      <p className="text-center text-sm mt-xl text-muted">
        Déjà un compte ? <Link href="/login" className="font-bold hover-lift text-primary" style={{ display: 'inline-block' }}>Se connecter</Link>
      </p>
    </div>
  );
}
