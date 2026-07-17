// Formatage monétaire et de dates pour le module finance.

// Montant en FCFA : « 210 000 FCFA »
export const formatFCFA = (amount) => {
  const n = Number(amount);
  return `${new Intl.NumberFormat('fr-FR').format(Number.isFinite(n) ? n : 0)} FCFA`;
};

// Date courte localisée : « 5 juil. 2026 ».
// On parse les composants YYYY-MM-DD en date LOCALE pour éviter tout décalage
// de fuseau (new Date('2026-07-05') est interprété en UTC → J-1 possible).
export const formatDateFR = (input) => {
  if (!input) return '';
  const s = String(input);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Mois courant au format YYYY-MM
export const currentYearMonth = () => new Date().toISOString().slice(0, 7);

// Libellé lisible d'un mois : « juillet 2026 »
export const yearMonthLabel = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

// Valeur d'input <input type="date"> → YYYY-MM-DD (aujourd'hui par défaut)
export const todayISO = () => new Date().toISOString().slice(0, 10);
