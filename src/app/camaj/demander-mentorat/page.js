import { BackButton } from '../../../components/ui/BackButton';
import { MentoratForm } from '../../../components/camaj/MentoratForm';
import camaj from '../camaj.module.css';

export const metadata = {
  title: 'Demander du Mentorat — CAMAJ | SHALOM',
  description:
    "Faites-vous accompagner : sollicitez un mentor du CAMAJ pour avancer dans vos études, votre carrière ou votre projet.",
};

// Server component : le formulaire, lui, est client (composant MentoratForm).
// Cela permet de conserver l'export `metadata`, impossible sous 'use client'.
export default function DemanderMentoratPage() {
  return (
    <div
      className={`container animate-fade-in ${camaj.theme}`}
      style={{ padding: 'var(--spacing-xl) 0', maxWidth: '860px' }}
    >
      <div className="mb-lg">
        <BackButton fallbackHref="/camaj" />
      </div>
      <MentoratForm />
    </div>
  );
}
