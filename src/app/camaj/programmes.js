import { Compass, HeartHandshake, GraduationCap, Rocket, Wallet } from 'lucide-react';

// La chaîne de valeur du CAMAJ, dans l'ordre : de l'écoute à l'autonomie complète.
// Source unique : la page CAMAJ les détaille, le formulaire d'adhésion s'en sert
// comme liste des programmes souhaités.
export const PROGRAMMES = [
  {
    icon: Compass,
    titre: 'Conseil et Orientation',
    texte:
      "Accompagnement personnalisé pour aider les jeunes à définir leurs objectifs et tracer leur parcours professionnel.",
    note: "Nos conseillers sont là pour t'écouter, t'orienter et t'accompagner en toute confidentialité.",
  },
  {
    icon: HeartHandshake,
    titre: 'Mentorat',
    texte:
      "Mise en relation avec des professionnels expérimentés pour un accompagnement sur mesure et durable.",
  },
  {
    icon: GraduationCap,
    titre: 'Académie Leadership & Entrepreneuriat',
    texte:
      "Formation complète en leadership et entrepreneuriat avec 8 filières spécialisées.",
  },
  {
    icon: Rocket,
    titre: 'Entrepreneuriat',
    texte:
      "Soutien à la création et au développement d'entreprises avec accompagnement technique et financier.",
  },
  {
    icon: Wallet,
    titre: "FAJ — Fonds d'Appui à la Jeunesse",
    texte:
      "Financement et équipement pour concrétiser vos projets entrepreneuriaux.",
  },
];
