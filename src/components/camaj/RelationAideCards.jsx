'use client';

import { useState } from 'react';
import { DOMAINES } from '../../app/camaj/relation-aide/domaines';
import { AccompagnementModal } from './AccompagnementModal';
import styles from '../../app/camaj/relation-aide/relation-aide.module.css';

export const RelationAideCards = () => {
  const [ouvert, setOuvert] = useState(null); // slug du domaine ouvert, ou null

  const domaineOuvert = DOMAINES.find((d) => d.slug === ouvert);

  return (
    <>
      <div className={styles.grid}>
        {DOMAINES.map(({ slug, titre, icon: Icon, fond, bouton, description }) => (
          <div key={slug} className={styles.card} style={{ background: fond }}>
            <span className={styles.cardIcon} aria-hidden="true">
              <Icon size={24} />
            </span>
            <h2 className={styles.cardTitre}>{titre}</h2>
            <p className={styles.cardTexte}>{description}</p>
            <button
              type="button"
              onClick={() => setOuvert(slug)}
              className={`hover-lift ${styles.cardBouton}`}
              style={{ backgroundColor: bouton }}
            >
              Demander un accompagnement
            </button>
          </div>
        ))}
      </div>

      {domaineOuvert && (
        <AccompagnementModal
          key={domaineOuvert.slug}
          domaine={domaineOuvert}
          onClose={() => setOuvert(null)}
        />
      )}
    </>
  );
};
