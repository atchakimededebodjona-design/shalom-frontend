import {
  Sprout,
  Laptop,
  ShoppingBag,
  Palette,
  Briefcase,
  Plane,
  HeartPulse,
  Clapperboard,
} from 'lucide-react';

// Les 8 filières de l'Académie Leadership & Entrepreneuriat.
// Source unique : la page CAMAJ les affiche, le formulaire mentor s'en sert
// comme liste des domaines d'expertise.
export const FILIERES = [
  { icon: Sprout, nom: 'Agriculture et Agro-industrie' },
  { icon: Laptop, nom: 'Numérique et Technologies' },
  { icon: ShoppingBag, nom: 'Commerce et Distribution' },
  { icon: Palette, nom: "Artisanat et Métiers d'Art" },
  { icon: Briefcase, nom: 'Services et Consulting' },
  { icon: Plane, nom: 'Tourisme et Hôtellerie' },
  { icon: HeartPulse, nom: 'Santé et Bien-être' },
  { icon: Clapperboard, nom: 'Industries Créatives' },
];
