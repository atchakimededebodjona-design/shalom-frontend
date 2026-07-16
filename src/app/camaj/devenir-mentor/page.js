import { BackButton } from '../../../components/ui/BackButton';
import { MentorForm } from '../../../components/camaj/MentorForm';
import camaj from '../camaj.module.css';

export const metadata = {
  title: 'Devenir Mentor — CAMAJ | SHALOM',
  description:
    "Partagez votre expérience : rejoignez le réseau de mentors du CAMAJ et accompagnez des jeunes vers l'autonomie professionnelle.",
};

// Server component : le formulaire, lui, est client (composant MentorForm).
// Cela permet de conserver l'export `metadata`, impossible sous 'use client'.
export default function DevenirMentorPage() {
  return (
    <div
      className={`container animate-fade-in ${camaj.theme}`}
      style={{ padding: 'var(--spacing-xl) 0', maxWidth: '860px' }}
    >
      <div className="mb-lg">
        <BackButton fallbackHref="/camaj" />
      </div>
      <MentorForm />
    </div>
  );
}
