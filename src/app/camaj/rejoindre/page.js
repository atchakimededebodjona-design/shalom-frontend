import { BackButton } from '../../../components/ui/BackButton';
import { ProgrammeForm } from '../../../components/camaj/ProgrammeForm';
import camaj from '../camaj.module.css';

export const metadata = {
  title: 'Rejoindre le Programme — CAMAJ | SHALOM',
  description:
    "Candidatez aux programmes du CAMAJ : conseil et orientation, mentorat, Académie Leadership & Entrepreneuriat, entrepreneuriat ou Fonds d'Appui à la Jeunesse.",
};

// Server component : le formulaire, lui, est client (composant ProgrammeForm).
// Cela permet de conserver l'export `metadata`, impossible sous 'use client'.
export default function RejoindrePage() {
  return (
    <div
      className={`container animate-fade-in ${camaj.theme}`}
      style={{ padding: 'var(--spacing-xl) 0', maxWidth: '860px' }}
    >
      <div className="mb-lg">
        <BackButton fallbackHref="/camaj" />
      </div>
      <ProgrammeForm />
    </div>
  );
}
