// Métadonnées d'affichage pour l'espace d'administration CAMAJ.

// Type de demande → libellé lisible + couleur d'accent.
export const TYPE_META = {
  mentor: { label: 'Devenir mentor', couleur: '#012963' },
  programme: { label: 'Rejoindre le programme', couleur: '#328C28' },
  mentorat: { label: 'Demander du mentorat', couleur: '#328C28' },
  faj: { label: 'Projet FAJ', couleur: '#FE5901' },
  don: { label: 'Faire un don', couleur: '#FE5901' },
  relation_aide: { label: "Relation d'aide", couleur: '#7A3EA8' },
};

export const typeMeta = (type) => TYPE_META[type] || { label: type, couleur: '#64748b' };

// Statut → libellé + couleur (badge).
export const STATUS_META = {
  nouveau: { label: 'Nouveau', couleur: '#2563eb', fond: 'rgba(37, 99, 235, 0.12)' },
  traite: { label: 'Traité', couleur: '#15803d', fond: 'rgba(21, 128, 61, 0.12)' },
  archive: { label: 'Archivé', couleur: '#64748b', fond: 'rgba(100, 116, 139, 0.14)' },
};

export const statusMeta = (status) =>
  STATUS_META[status] || { label: status, couleur: '#64748b', fond: 'rgba(100,116,139,0.14)' };

// Ordre des filtres affichés.
export const TYPES_ORDRE = ['mentor', 'programme', 'mentorat', 'faj', 'don', 'relation_aide'];
export const STATUTS_ORDRE = ['nouveau', 'traite', 'archive'];

// Libellés lisibles pour les clés du payload (formulaire stocké tel quel).
const FIELD_LABELS = {
  nom: 'Nom complet',
  prenom: 'Prénom',
  age: 'Âge',
  pays: 'Pays',
  ville: 'Ville',
  email: 'E-mail',
  indicatif: 'Indicatif',
  whatsapp: 'WhatsApp',
  situation: 'Situation actuelle',
  domaine: 'Domaine',
  domaineTitre: 'Domaine',
  objectifs: 'Objectifs',
  disponibilites: 'Disponibilités',
  mode: 'Mode préféré',
  montant: 'Montant (FCFA)',
  dedicace: 'Dédicace',
  message: 'Message',
  preferenceContact: 'Préférence de contact',
  consentement: 'Consentement',
  statut: 'Statut de la relation',
  format: 'Format souhaité',
  depuis: 'Depuis combien de temps',
  experience: 'Expérience',
  motivation: 'Motivation',
  competences: 'Compétences',
  filiere: 'Filière',
  filieres: 'Filières',
  typeProjet: 'Type de projet',
  associes: 'Associés',
  titreProjet: 'Titre du projet',
  description: 'Description',
  budget: 'Budget',
  fichier: 'Fichier joint',
  situationTexte: 'Situation décrite',
  besoins: 'Besoins',
};

// Clés déjà présentées via les colonnes principales (nom/contact) — masquées du détail.
const CLES_MASQUEES = new Set(['nom', 'prenom', 'email', 'whatsapp', 'indicatif', 'consentement']);

export const humaniserCle = (cle) =>
  FIELD_LABELS[cle] ||
  cle
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

export const formaterValeur = (valeur) => {
  if (valeur === null || valeur === undefined || valeur === '') return '—';
  if (Array.isArray(valeur)) return valeur.length ? valeur.join(', ') : '—';
  if (typeof valeur === 'boolean') return valeur ? 'Oui' : 'Non';
  if (typeof valeur === 'object') return JSON.stringify(valeur);
  return String(valeur);
};

// Transforme le payload en liste [ {cle, label, valeur} ] pour l'affichage détaillé.
export const detaillerPayload = (payload) =>
  Object.entries(payload || {})
    .filter(([cle]) => !CLES_MASQUEES.has(cle))
    .map(([cle, valeur]) => ({ cle, label: humaniserCle(cle), valeur: formaterValeur(valeur) }));
