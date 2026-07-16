import { Heart, Users, Brain, Sun } from 'lucide-react';

// Les 4 domaines d'accompagnement en relation d'aide.
// Source unique : la page-hub affiche les cartes, et chaque carte ouvre une
// modale dont le formulaire est décrit ici (champs propres à chaque domaine).
//
// `fond`         = fond de la carte du hub (peut être un dégradé) ;
// `bouton`       = couleur du bouton de la carte (contraste avec `fond`) ;
// `titreCouleur` = couleur du titre dans la modale ;
// `submitCouleur`= couleur du bouton « Envoyer ma demande » + accent des champs ;
// `urgence`      = bandeau d'alerte affiché en tête de modale (ou null) ;
// `age`          = afficher le champ Âge (absent pour la guérison intérieure) ;
// `champs`       = champs spécifiques au domaine, dans l'ordre d'affichage.
//
// Options de select/checkbox déduites des maquettes ou proposées quand elles
// n'y figuraient pas (« -- ») — à ajuster librement.

const PREFERENCE_CONTACT = ['WhatsApp', 'Appel téléphonique', 'Rencontre en présentiel'];

export const DOMAINES = [
  {
    slug: 'conseil-aide',
    titre: "Conseil d'Aide Appliqué à la Jeunesse",
    icon: Heart,
    fond: '#012963',
    bouton: '#FE5901',
    titreCouleur: '#012963',
    submitCouleur: '#FE5901',
    urgence: null,
    age: true,
    description:
      "Vous traversez une période difficile ? Problèmes familiaux, pression scolaire, manque de repères, isolement social... Nos conseillers t'accompagnent avec écoute et bienveillance.",
    champs: [
      {
        type: 'select',
        full: true,
        name: 'situation',
        label: 'Situation Actuelle',
        options: ['Collégien/Lycéen', 'Étudiant', 'Jeune actif', 'Sans emploi', 'Autre'],
      },
      {
        type: 'checkboxes',
        name: 'difficultes',
        label: 'Domaines de difficulté',
        options: [
          'Relations familiales',
          'Pression scolaire ou professionnelle',
          'Manque de confiance en soi',
          'Isolement social',
          'Gestion des émotions',
          'Orientation et avenir',
          'Autre',
        ],
      },
      { type: 'textarea', name: 'situationTexte', label: 'Décris ta situation' },
    ],
  },
  {
    slug: 'conjugal',
    titre: 'Conseil Conjugal',
    icon: Users,
    fond: '#328C28',
    bouton: '#FE5901',
    titreCouleur: '#328C28',
    submitCouleur: '#FE5901',
    urgence: null,
    age: true,
    description:
      "Difficultés dans ton couple, communication bloquée, conflits répétés, préparation au mariage... Nos conseillers t'aident à construire une relation saine et épanouissante.",
    champs: [
      {
        type: 'select',
        full: false,
        name: 'statut',
        label: 'Statut de la relation',
        options: ['En couple', 'Fiancé(e)', 'Marié(e)', 'En instance de séparation', 'Autre'],
      },
      {
        type: 'select',
        full: false,
        name: 'format',
        label: 'Format souhaité',
        options: ['Individuel', 'En couple', 'Les deux'],
      },
      {
        type: 'checkboxes',
        name: 'besoins',
        label: 'Besoins de soutien',
        options: [
          'Communication dans le couple',
          'Gestion des conflits',
          'Préparation au mariage',
          'Réconciliation',
          'Séparation et reconstruction',
          'Autre',
        ],
      },
      { type: 'textarea', name: 'situationTexte', label: 'Décris la situation' },
    ],
  },
  {
    slug: 'sante-mentale',
    titre: 'Conseil et Aide en Santé Mentale',
    icon: Brain,
    fond: '#FE5901',
    bouton: '#012963',
    titreCouleur: '#FE5901',
    submitCouleur: '#012963',
    urgence:
      "Si tu vis une urgence ou des pensées de faire du mal, contacte immédiatement une personne de confiance ou appelle le 8282 (numéro d'urgence Togo).",
    age: true,
    description:
      "Anxiété, stress chronique, dépression, burn-out, traumatismes... Tu mérites un espace sûr pour en parler et recevoir un soutien adapté et bienveillant.",
    champs: [
      {
        type: 'select',
        full: true,
        name: 'depuis',
        label: 'Depuis combien de temps ?',
        options: ["Moins d'un mois", '1 à 6 mois', '6 mois à 1 an', "Plus d'un an"],
      },
      {
        type: 'checkboxes',
        name: 'domaines',
        label: 'Domaines concernés',
        options: ['Anxiété', 'Stress', 'Dépression', 'Burn-out', 'Traumatisme', 'Deuil', 'Troubles du sommeil', 'Autre'],
      },
      {
        type: 'radios',
        name: 'consulte',
        label: 'As-tu déjà consulté un professionnel ?',
        options: ['Oui', 'Non', 'Je ne sais pas'],
      },
      { type: 'textarea', name: 'ressenti', label: 'Décris ce que tu ressens' },
    ],
  },
  {
    slug: 'guerison',
    titre: 'Conseil et Guérison Intérieure',
    icon: Sun,
    fond: 'linear-gradient(135deg, #0A2E5C 0%, #2E7D46 100%)',
    bouton: '#328C28',
    titreCouleur: '#328C28',
    submitCouleur: '#328C28',
    urgence: null,
    age: false,
    description:
      "Blessures du passé, manque d'estime de soi, rancœurs, blocages émotionnels... Ce service t'accompagne vers la paix intérieure, la réconciliation avec toi-même et une vie plus épanouissante.",
    champs: [
      {
        type: 'checkboxes',
        name: 'transformer',
        label: "Qu'aimerais-tu transformer ?",
        options: [
          'Estime de soi',
          'Pardon et réconciliation',
          'Libération de blessures passées',
          'Paix intérieure',
          "Confiance en l'avenir",
          'Reconstruction après un échec',
          'Autre',
        ],
      },
      { type: 'textarea', name: 'amene', label: "Qu'est-ce qui t'amène à demander de l'aide aujourd'hui ?" },
      {
        type: 'radios',
        name: 'travailFait',
        label: 'As-tu déjà fait un travail de guérison intérieure ?',
        options: ['Oui', 'Non', 'En cours'],
      },
    ],
  },
];

export { PREFERENCE_CONTACT };
export const getDomaine = (slug) => DOMAINES.find((d) => d.slug === slug);
