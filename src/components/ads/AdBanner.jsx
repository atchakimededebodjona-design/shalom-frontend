'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adsService } from '../../services/ads.service';
import styles from './ads.module.css';

// Une tuile = une image d'annonce. Repli sur le titre si l'image ne charge pas
// (ex. image hébergée sur un autre environnement).
function AdTile({ ad }) {
  const [broken, setBroken] = useState(false);
  const inner = broken ? (
    <span className={styles.adFallback}>{ad.title}</span>
  ) : (
    <img
      src={ad.image_url}
      alt={ad.title}
      className={styles.adImg}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
  return ad.link_url ? (
    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className={styles.ad} title={ad.title}>
      {inner}
    </a>
  ) : (
    <div className={styles.ad} title={ad.title}>{inner}</div>
  );
}

// Espace publicitaire : contenu géré uniquement par l'administrateur (API /ads).
// Le bandeau défile de la droite vers la gauche.
export function AdBanner() {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    adsService
      .list()
      .then((res) => { if (alive) setAds(res.data?.ads || []); })
      .catch(() => { if (alive) setAds([]); })
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, []);

  const isAdmin = !!user?.is_admin;

  if (!loaded) return null;                       // évite un flash au chargement
  if (ads.length === 0 && !isAdmin) return null;  // masqué si aucune annonce (non-admin)

  // On répète les annonces pour remplir la piste, puis on duplique l'ensemble
  // (× 2) : la translation de -50% donne une boucle continue et sans à-coup.
  const set = Array.from({ length: Math.max(6, ads.length) }, (_, i) => ads[i % ads.length]);
  const loop = [...set, ...set];

  return (
    <div className={styles.banner} role="complementary" aria-label="Espace publicitaire">
      <span className={styles.label}>Publicité</span>
      {isAdmin && (
        <Link href="/admin/publicites" className={styles.manageLink} title="Gérer les publicités">
          <Settings size={13} /> Gérer
        </Link>
      )}

      {ads.length === 0 ? (
        <Link href="/admin/publicites" className={styles.emptyAdmin}>
          <Plus size={16} /> Ajouter une publicité
        </Link>
      ) : (
        <div className={styles.viewport}>
          <div className={styles.track}>
            {loop.map((ad, i) => (
              <AdTile key={`${ad.id}-${i}`} ad={ad} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
