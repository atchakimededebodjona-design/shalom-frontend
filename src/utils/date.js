// Formatage de temps relatif en français (« il y a 3 min », « il y a 2 j »…)
export const timeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "à l'instant";

  const intervals = [
    { limit: 3600, div: 60, unit: 'min' },
    { limit: 86400, div: 3600, unit: 'h' },
    { limit: 604800, div: 86400, unit: 'j' },
    { limit: 2629800, div: 604800, unit: 'sem' },
  ];

  for (const { limit, div, unit } of intervals) {
    if (seconds < limit) {
      return `il y a ${Math.floor(seconds / div)} ${unit}`;
    }
  }

  // Au-delà d'un mois : date localisée
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};
