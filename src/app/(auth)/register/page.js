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
      // Le backend renvoie les raisons précises dans `details` (règles de mot
      // de passe, nom manquant…). On les affiche plutôt que le générique
      // « Erreurs de validation » porté par `error`.
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
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>
      <AuthLogo />
      <h1 className="text-center mb-sm" style={{ color: '#F3EFE4' }}>Rejoignez-nous</h1>
      <p className="text-center mb-lg" style={{ color: '#9AA5B4' }}>Créez votre compte en quelques secondes</p>

      {error && <div style={{ color: '#fff', backgroundColor: 'rgba(220,38,38,0.85)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

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
          <p className="text-sm" style={{ color: '#9AA5B4', margin: 0 }}>
            Au moins 8 caractères, dont une majuscule et un chiffre.
          </p>
        </div>
        <Button type="submit" variant="primary" isLoading={loading} style={{ width: '100%', marginTop: '0.5rem', padding: 'var(--spacing-md)' }}>
          S'inscrire
        </Button>
      </form>

      <p className="text-center text-sm mt-md" style={{ color: '#9AA5B4' }}>
        Déjà un compte ? <Link href="/login" className="font-bold" style={{ color: 'var(--primary)' }}>Se connecter</Link>
      </p>
    </div>
  );
}
