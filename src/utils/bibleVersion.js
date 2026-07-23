// Persiste la version biblique choisie (LSG, MAR, OST, EWE...) entre la liste
// des livres et le lecteur de chapitre, qui ne partagent pas d'état React.
const STORAGE_KEY = 'bible_version';

export const getSelectedVersion = () => {
  if (typeof window === 'undefined') return 'LSG';
  return window.localStorage.getItem(STORAGE_KEY) || 'LSG';
};

export const setSelectedVersion = (code) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, code);
};
