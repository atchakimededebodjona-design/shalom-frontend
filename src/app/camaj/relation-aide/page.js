import { ShieldCheck } from 'lucide-react';
import { BackButton } from '../../../components/ui/BackButton';
import { RelationAideCards } from '../../../components/camaj/RelationAideCards';
import camaj from '../camaj.module.css';
import styles from './relation-aide.module.css';

export const metadata = {
  title: "Relation d'aide — CAMAJ | SHALOM",
  description:
    "Un accompagnement confidentiel et bienveillant : conseil d'aide à la jeunesse, conseil conjugal, santé mentale et guérison intérieure. Choisissez le service qui correspond à votre situation.",
};

const HERO = {
  titre: "Tu n'es pas seul(e). Nous sommes là pour t'écouter.",
  texte:
    "Le CAMAJ propose un accompagnement confidentiel et bienveillant dans 4 domaines essentiels. Choisissez le service qui correspond à votre situation.",
};

const CONFID = {
  titre: 'La confidentialité est notre priorité',
  texte:
    "Toutes les demandes reçues via cette page sont traitées avec la plus stricte confidentialité. Aucune information personnelle n'est partagée sans ton consentement. Nos conseillers sont formés pour t'accueillir avec respect, écoute et bienveillance.",
};

export default function RelationAidePage() {
  return (
    <div
      className={`container animate-fade-in ${camaj.theme}`}
      style={{ padding: 'var(--spacing-xl) 0' }}
    >
      <div className="mb-lg">
        <BackButton fallbackHref="/camaj" />
      </div>

      <section className={styles.hero}>
        <h1 className={styles.heroTitre}>{HERO.titre}</h1>
        <p className={styles.heroTexte}>{HERO.texte}</p>
      </section>

      <RelationAideCards />

      <section className={styles.confid}>
        <span className={styles.confidIcon} aria-hidden="true">
          <ShieldCheck size={28} />
        </span>
        <div>
          <h2 className={styles.confidTitre}>{CONFID.titre}</h2>
          <p className={styles.confidTexte}>{CONFID.texte}</p>
        </div>
      </section>
    </div>
  );
}
