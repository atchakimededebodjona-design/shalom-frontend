'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Flame, BookOpen, HandHeart } from 'lucide-react';
import { spiritualService } from '../../../services/spiritual.service';
import styles from '../../../components/shared/panel.module.css';

export default function SpiritualTodayPage() {
  const [verse, setVerse] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [progress, setProgress] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Le verset du jour peut légitimement manquer (catalogue vide) : on ne
      // fait pas échouer toute la page pour autant.
      const [v, f, pr, pl] = await Promise.allSettled([
        spiritualService.getVerseOfTheDay(),
        spiritualService.listFavoriteVerses(),
        spiritualService.listProgress(),
        spiritualService.listPrayers({ status: 'pending', limit: 5 }),
      ]);
      setVerse(v.status === 'fulfilled' ? v.value.data.verse : null);
      setFavorites(f.status === 'fulfilled' ? f.value.data.verses : []);
      setProgress(pr.status === 'fulfilled' ? pr.value.data.progress.filter((p) => p.status === 'active') : []);
      setPrayers(pl.status === 'fulfilled' ? pl.value.data.prayers : []);
    } catch (err) {
      setError('Impossible de charger cet espace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleFavorite = async () => {
    if (!verse) return;
    await spiritualService.setVerseFavorite(verse.id, !verse.is_favorite);
    setVerse((v) => ({ ...v, is_favorite: !v.is_favorite }));
    const f = await spiritualService.listFavoriteVerses();
    setFavorites(f.data.verses);
  };

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;
  if (error) return <p className={styles.errorMsg} role="alert">{error}</p>;

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      {/* Verset du jour */}
      {verse ? (
        <div className={styles.verse}>
          <div className={styles.sectionHead}>
            <span className={styles.badgePrimary}>{verse.type === 'quote' ? 'Citation du jour' : 'Verset du jour'}</span>
            <button
              onClick={toggleFavorite}
              className={styles.iconBtn}
              aria-label={verse.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              style={{ color: verse.is_favorite ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <Heart size={20} fill={verse.is_favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className={styles.verseText}>« {verse.content} »</p>
          {verse.reference && <div className={styles.verseRef}>— {verse.reference}</div>}
        </div>
      ) : (
        <div className={`${styles.card} ${styles.empty}`}>
          Aucun verset disponible pour le moment. Le catalogue est alimenté par un administrateur.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
        {/* Lecture en cours */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <h3 className="flex items-center gap-sm"><BookOpen size={18} /> Lecture en cours</h3>
            <Link href="/spiritual/plans" className="text-sm text-primary font-bold">Voir tout</Link>
          </div>
          {progress.length === 0 ? (
            <p className="text-muted text-sm">
              Aucun plan en cours. <Link href="/spiritual/plans" className="text-primary">En démarrer un</Link>.
            </p>
          ) : (
            <div className="flex-col gap-md" style={{ display: 'flex' }}>
              {progress.map((p) => {
                const pct = Math.min(100, ((p.current_day - 1) / p.total_days) * 100 || 0);
                return (
                  <div key={p.plan_id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">{p.title}</span>
                      <span className={styles.badgePrimary}><Flame size={12} /> {p.streak_count} j</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-sm text-muted">Jour {p.current_day} / {p.total_days}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prières en attente */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <h3 className="flex items-center gap-sm"><HandHeart size={18} /> En prière</h3>
            <Link href="/spiritual/prayers" className="text-sm text-primary font-bold">Voir tout</Link>
          </div>
          {prayers.length === 0 ? (
            <p className="text-muted text-sm">
              Aucun sujet en attente. <Link href="/spiritual/prayers" className="text-primary">En ajouter un</Link>.
            </p>
          ) : (
            <div className={styles.list}>
              {prayers.map((p) => (
                <div key={p.id} className={styles.row} style={{ padding: 'var(--spacing-sm) 0' }}>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>{p.title}</div>
                    {p.category && <div className={styles.rowMeta}>{p.category}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Favoris */}
      {favorites.length > 0 && (
        <div className={styles.card}>
          <div className={styles.sectionHead}><h3 className="flex items-center gap-sm"><Heart size={18} /> Mes favoris</h3></div>
          <div className={styles.list}>
            {favorites.map((v) => (
              <div key={v.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div style={{ fontStyle: 'italic' }}>« {v.content} »</div>
                  {v.reference && <div className={styles.rowMeta}>{v.reference}</div>}
                </div>
                <button
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={async () => {
                    await spiritualService.setVerseFavorite(v.id, false);
                    const f = await spiritualService.listFavoriteVerses();
                    setFavorites(f.data.verses);
                    if (verse?.id === v.id) setVerse((cur) => ({ ...cur, is_favorite: false }));
                  }}
                  aria-label="Retirer des favoris"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
