import { BackButton } from '../../../components/ui/BackButton';
import { ProjetFajForm } from '../../../components/camaj/ProjetFajForm';
import camaj from '../camaj.module.css';

export const metadata = {
  title: 'Soumettre un Projet FAJ — CAMAJ | SHALOM',
  description:
    "Candidatez au Fonds d'Appui à la Jeunesse (FAJ) du CAMAJ : présentez votre projet innovant à impact social ou environnemental pour un financement.",
};

// Server component : le formulaire, lui, est client (composant ProjetFajForm).
// Cela permet de conserver l'export `metadata`, impossible sous 'use client'.
export default function SoumettreProjetFajPage() {
  return (
    <div
      className={`container animate-fade-in ${camaj.theme}`}
      style={{ padding: 'var(--spacing-xl) 0', maxWidth: '860px' }}
    >
      <div className="mb-lg">
        <BackButton fallbackHref="/camaj" />
      </div>
      <ProjetFajForm />
    </div>
  );
}
