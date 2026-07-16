'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Flèche de retour vers la page précédente (historique navigateur).
// Repli vers `fallbackHref` s'il n'y a pas de page précédente (accès direct par URL).
export const BackButton = ({ label = 'Retour', fallbackHref = '/', className = '', ...props }) => {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label}
      className={`hover-lift ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-color)',
        borderRadius: 'var(--radius-full)',
        padding: 'var(--spacing-xs) var(--spacing-md)',
        fontWeight: 'bold',
      }}
      {...props}
    >
      <ArrowLeft size={18} />
      {label && <span>{label}</span>}
    </button>
  );
};
