import Link from 'next/link';
import { BackButton } from '../../components/ui/BackButton';
import { FILIERES } from './filieres';
import { PROGRAMMES } from './programmes';
import styles from './camaj.module.css';

export const metadata = {
  title: "Programme CAMAJ — SHALOM",
  description:
    "Guider. Former. Équiper pour l'Avenir. Les 5 programmes du CAMAJ et les 8 filières de l'Académie Leadership & Entrepreneuriat.",
};

const AMBITION = [
  { chiffre: '1000+', libelle: 'jeunes formés' },
  { chiffre: '500', libelle: 'projets financés' },
  { chiffre: '200+', libelle: 'entreprises créées' },
  { chiffre: '1000+', libelle: 'emplois générés' },
];

// Les trois couleurs du logo, parcourues en boucle pour rythmer les listes.
const ACCENTS = ['var(--camaj-navy)', 'var(--camaj-orange)', 'var(--camaj-green)'];

// Chaque CTA mène désormais à son formulaire dédié sous /camaj (comme la
// « relation d'aide » plus bas). Le paramètre /register?intent n'est plus utilisé.
const ACTIONS = [
  { label: 'Devenir Mentor', href: '/camaj/devenir-mentor', color: 'var(--camaj-navy)' },
  { label: 'Rejoindre le Programme', href: '/camaj/rejoindre', color: 'var(--camaj-orange)' },
  { label: 'Demander du Mentorat', href: '/camaj/demander-mentorat', outline: true },
  { label: 'Soumettre un Projet FAJ', href: '/camaj/soumettre-projet-faj', color: 'var(--camaj-green)' },
  { label: 'Faire un Don', href: '/camaj/faire-un-don', color: 'var(--camaj-orange)', pleineLargeur: true },
];

export default function Camaj() {
  return (
    <div className={`container animate-fade-in ${styles.theme}`} style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md">
        <BackButton fallbackHref="/dashboard" />
      </div>

      {/* Hero */}
      <section className="text-center" style={{ padding: 'var(--spacing-lg) 0 var(--spacing-2xl)' }}>
        <div className={`${styles.logoTile} mb-lg`}>
          {/* <img> plutôt que next/image : cohérent avec AuthLogo, et évite la
              config d'images de Next 16 pour un simple asset statique. */}
          <img
            src="/camaj-logo.png"
            alt="Logo du CAMAJ"
            className={styles.logo}
            width={661}
            height={600}
          />
        </div>
        <h1 className="text-primary mb-sm">Programme CAMAJ</h1>
        <p className="text-lg font-bold mb-md" style={{ color: 'var(--camaj-orange)' }}>
          Guider. Former. Équiper pour l'Avenir.
        </p>
        <p className="text-muted" style={{ maxWidth: '640px', margin: '0 auto' }}>
          Le CAMAJ accompagne les jeunes togolais vers l'autonomie et la réussite professionnelle,
          à travers le conseil, le mentorat, la formation et l'entrepreneuriat.
        </p>
        <div className={styles.tricolor} aria-hidden="true">
          <span /><span /><span />
        </div>
      </section>

      {/* Chaîne de valeur */}
      <section className="mb-2xl">
        <h2 className="text-center mb-sm">Notre chaîne de valeur</h2>
        <p className="text-muted text-center mb-xl" style={{ maxWidth: '600px', margin: '0 auto var(--spacing-xl)' }}>
          Une approche globale et intégrée, de l'écoute à l'autonomie complète.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {PROGRAMMES.map(({ icon: Icon, titre, texte, note }, index) => (
            <div
              key={titre}
              className={`glass p-lg hover-lift flex-col ${styles.programCard}`}
              style={{
                borderRadius: 'var(--radius-lg)',
                gap: 'var(--spacing-sm)',
                '--card-accent': ACCENTS[index % ACCENTS.length],
              }}
            >
              <div className="flex items-center gap-sm">
                <span className={`flex items-center justify-center font-bold ${styles.badge}`}>
                  {index + 1}
                </span>
                <Icon size={22} color="var(--card-accent)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>{titre}</h3>
              <p className="text-muted" style={{ marginBottom: 0 }}>{texte}</p>
              {note && (
                <p
                  className={`text-sm ${styles.note}`}
                  style={{
                    marginBottom: 0,
                    paddingLeft: 'var(--spacing-sm)',
                    fontStyle: 'italic',
                  }}
                >
                  {note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Filières de l'Académie */}
      <section className="mb-2xl">
        <h2 className="text-center mb-sm">Les 8 filières de l'Académie</h2>
        <p className="text-muted text-center mb-xl" style={{ maxWidth: '600px', margin: '0 auto var(--spacing-xl)' }}>
          Une formation complète en leadership et entrepreneuriat, déclinée en huit spécialités.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
          {FILIERES.map(({ icon: Icon, nom }, index) => (
            <div
              key={nom}
              className="glass p-md hover-lift flex items-center gap-sm"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <Icon size={20} color={ACCENTS[index % ACCENTS.length]} style={{ flexShrink: 0 }} />
              <span className="font-bold text-sm">{nom}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ambition */}
      <section className="mb-2xl">
        <h2 className="text-center mb-xl">Notre ambition sur 5 ans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-md)' }}>
          {AMBITION.map(({ chiffre, libelle }, index) => (
            <div
              key={libelle}
              className="glass p-lg text-center"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <div
                className="font-bold"
                style={{ fontSize: '2.25rem', lineHeight: 1.1, color: ACCENTS[index % ACCENTS.length] }}
              >
                {chiffre}
              </div>
              <div className="text-muted text-sm mt-sm">{libelle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Appels à l'action */}
      <section>
        <h2 className="text-center mb-sm">Passer à l&apos;action</h2>
        <p className="text-muted text-center mb-xl" style={{ maxWidth: '600px', margin: '0 auto var(--spacing-xl)' }}>
          Rejoignez le CAMAJ, que ce soit pour être accompagné ou pour accompagner à votre tour.
        </p>
        <div className={styles.ctaGrid}>
          {ACTIONS.map(({ label, href, color, outline, pleineLargeur }) => (
            <Link
              key={label}
              href={href}
              className={[
                'hover-lift',
                styles.cta,
                outline ? styles.ctaOutline : styles.ctaSolid,
                pleineLargeur ? styles.ctaFull : '',
              ].join(' ')}
              style={outline ? undefined : { '--cta-color': color }}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Relation d'aide */}
      <section className={styles.aide}>
        <h2 className={styles.aideTitre}>Tu traverses une période difficile ?</h2>
        <p className={styles.aideTexte}>
          Nos conseillers sont là pour t&apos;écouter, t&apos;orienter et t&apos;accompagner
          en toute confidentialité.
        </p>
        <Link href="/camaj/relation-aide" className={`hover-lift ${styles.aideBouton}`}>
          Accéder aux conseils en relation d&apos;aide
        </Link>
      </section>
    </div>
  );
}
