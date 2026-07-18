// Métadonnées d'affichage pour la modération des signalements.

export const REASON_META = {
  spam: { label: 'Spam' },
  contenu_inapproprie: { label: 'Contenu inapproprié' },
  harcelement: { label: 'Harcèlement' },
  faux_compte: { label: 'Faux compte' },
  autre: { label: 'Autre' },
};

export const reasonMeta = (reason) => REASON_META[reason] || { label: reason };

export const TARGET_TYPE_META = {
  post: { label: 'Publication', couleur: '#012963' },
  comment: { label: 'Commentaire', couleur: '#7A3EA8' },
};

export const targetTypeMeta = (type) => TARGET_TYPE_META[type] || { label: type, couleur: '#64748b' };

export const STATUS_META = {
  en_attente: { label: 'En attente', couleur: '#2563eb', fond: 'rgba(37, 99, 235, 0.12)' },
  traite: { label: 'Traité', couleur: '#15803d', fond: 'rgba(21, 128, 61, 0.12)' },
  rejete: { label: 'Rejeté', couleur: '#64748b', fond: 'rgba(100, 116, 139, 0.14)' },
};

export const statusMeta = (status) =>
  STATUS_META[status] || { label: status, couleur: '#64748b', fond: 'rgba(100,116,139,0.14)' };

export const STATUTS_ORDRE = ['en_attente', 'traite', 'rejete'];
