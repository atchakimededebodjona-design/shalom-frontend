import { BackButton } from '../../../components/ui/BackButton';
import { DonForm } from '../../../components/camaj/DonForm';
import camaj from '../camaj.module.css';

export const metadata = {
  title: 'Faire un Don — CAMAJ | SHALOM',
  description:
    "Soutenez la jeunesse togolaise : manifestez votre intention de don au CAMAJ pour former, financer et équiper les jeunes vers l'autonomie.",
};

// Server component : le formulaire, lui, est client (composant DonForm).
// Cela permet de conserver l'export `metadata`, impossible sous 'use client'.
export default function FaireUnDonPage() {
  return (
    <div
      className={`container animate-fade-in ${camaj.theme}`}
      style={{ padding: 'var(--spacing-xl) 0', maxWidth: '860px' }}
    >
      <div className="mb-lg">
        <BackButton fallbackHref="/camaj" />
      </div>
      <DonForm />
    </div>
  );
}
