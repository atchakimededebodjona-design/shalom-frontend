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

  return (
    <aside className={styles.sidebar}>
      {ads.map((ad) => {
        const card = (
          <div className={styles.card}>
            <img src={resolveMediaUrl(ad.image_url)} alt={ad.title} className={styles.image} />
            <p className={styles.title}>{ad.title}</p>
          </div>
        );

        return ad.link_url ? (
          <a key={ad.id} href={ad.link_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {card}
          </a>
        ) : (
          <div key={ad.id} className={styles.link}>{card}</div>
        );
      })}
    </aside>
  );
};
