'use client';

import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

const btnStyle = { padding: '1rem 2rem', fontSize: '1.1rem' };

// Boutons d'action du hero de la page d'accueil.
// - Visiteur non connecté : « S'inscrire » / « Se connecter ».
// - Utilisateur déjà connecté (arrivé ici via le logo) : on masque ces boutons
//   et on propose plutôt un accès direct au tableau de bord.
export function HomeCta() {
  const { user, loading } = useAuth();

  if (loading) return null; // évite d'afficher les boutons avant de connaître l'état

  if (user) {
    return (
      <div className="flex gap-md justify-center mt-lg">
        <Link href="/dashboard">
          <Button variant="primary" style={btnStyle}>Accéder au tableau de bord</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-md justify-center mt-lg">
      <Link href="/register">
        <Button variant="primary" style={btnStyle}>S'inscrire</Button>
      </Link>
      <Link href="/login">
        <Button variant="primary" style={btnStyle}>Se connecter</Button>
      </Link>
    </div>
  );
}
