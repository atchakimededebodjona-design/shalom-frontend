'use client';

import { useEffect, useState } from 'react';
import adsService, { resolveMediaUrl } from '../../services/ads.service';
import styles from './AdsSidebar.module.css';

export const AdsSidebar = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await adsService.getAds({ limit: 20 });
        if (active) setAds(res.data.data.ads || []);
      } catch {
        // Espace publicitaire silencieux en cas d'erreur — pas de blocage du fil.
      }
    })();
    return () => { active = false; };
  }, []);

  if (ads.length === 0) return null;

  // Liste dupliquée pour une boucle de défilement continue et sans coupure
  // (translateX(-50%) retombe exactement sur le début de la seconde copie).
  const items = [...ads, ...ads];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.track} style={{ '--marquee-duration': `${Math.max(ads.length * 5, 15)}s` }}>
        {items.map((ad, i) => {
          const card = (
            <div className={styles.card}>
              <img src={resolveMediaUrl(ad.image_url)} alt={ad.title} className={styles.image} />
              <p className={styles.title}>{ad.title}</p>
            </div>
          );

          return ad.link_url ? (
            <a key={`${ad.id}-${i}`} href={ad.link_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {card}
            </a>
          ) : (
            <div key={`${ad.id}-${i}`} className={styles.link}>{card}</div>
          );
        })}
      </div>
    </aside>
  );
};
