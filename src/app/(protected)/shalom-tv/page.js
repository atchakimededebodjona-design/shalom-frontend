'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import shalomTvService, { resolveMediaUrl } from '../../../services/shalom-tv.service';
import { PlayCircle, Headphones, FileText, Image as ImageIcon, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import styles from './shalom-tv.module.css';

export default function ShalomTvPage() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 'adult' ou 'child'
  const [audience, setAudience] = useState('adult');
  const [typeFilter, setTypeFilter] = useState(''); // vide = tous, video, audio, text

  const router = useRouter();

  useEffect(() => {
    fetchContents();
  }, [audience, typeFilter]);

  const fetchContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { target_audience: audience };
      if (typeFilter) params.type = typeFilter;

      const res = await shalomTvService.getContents(params);
      setContents(res.data.data.contents || []);
    } catch (err) {
      if (err.response?.status === 402) {
        setError('SUBSCRIPTION_REQUIRED');
      } else {
        setError('Erreur lors du chargement des contenus');
      }
    } finally {
      setLoading(false);
    }
  };

  if (error === 'SUBSCRIPTION_REQUIRED') {
    return (
      <div className={styles.lockScreen}>
        <div className={styles.lockIcon}>
          <Lock size={40} />
        </div>
        <h1 className={styles.lockTitle}>Contenu Réservé</h1>
        <p className={styles.lockText}>
          L&apos;accès à SHALOM TV (Vidéos, Podcasts, Articles premium) est exclusif à nos membres Premium.
          Abonnez-vous ou renouvelez votre abonnement pour débloquer cet univers.
        </p>
        <button onClick={() => router.push('/billing/subscribe')} className={styles.lockBtn}>
          Débloquer SHALOM TV
        </button>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <PlayCircle size={20} />;
      case 'audio': return <Headphones size={20} />;
      case 'text': return <FileText size={20} />;
      case 'photo': return <ImageIcon size={20} />;
      default: return null;
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* En-tête immersif */}
      <div className={`${styles.hero} ${audience === 'child' ? styles.heroChild : ''}`}>
        <div className={styles.heroInner}>
          <div>
            <h1 className={styles.heroTitle}>
              SHALOM TV {audience === 'child' && <Sparkles color="#FFD84D" />}
            </h1>
            <p className={styles.heroSubtitle}>
              {audience === 'adult'
                ? 'Nourrissez votre foi avec nos enseignements bibliques, documentaires et podcasts exclusifs.'
                : 'Un univers sûr, amusant et éducatif pour grandir dans la foi chrétienne !'}
            </p>
          </div>

          {/* Switch Univers */}
          <div className={styles.audienceSwitch}>
            <button
              onClick={() => setAudience('adult')}
              className={`${styles.audienceBtn} ${audience === 'adult' ? styles.audienceBtnActive : ''}`}
            >
              Univers Adultes
            </button>
            <button
              onClick={() => setAudience('child')}
              className={`${styles.audienceBtn} ${audience === 'child' ? styles.audienceBtnActive : ''}`}
            >
              Espace Enfants
            </button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Filtres par type */}
        <div className={styles.filters}>
          <button onClick={() => setTypeFilter('')} className={`${styles.filterBtn} ${typeFilter === '' ? styles.filterBtnActive : ''}`}>
            Tout voir
          </button>
          <button onClick={() => setTypeFilter('video')} className={`${styles.filterBtn} ${typeFilter === 'video' ? styles.filterBtnActive : ''}`}>
            <PlayCircle size={16} /> Vidéos
          </button>
          <button onClick={() => setTypeFilter('audio')} className={`${styles.filterBtn} ${typeFilter === 'audio' ? styles.filterBtnActive : ''}`}>
            <Headphones size={16} /> Podcasts
          </button>
          <button onClick={() => setTypeFilter('text')} className={`${styles.filterBtn} ${typeFilter === 'text' ? styles.filterBtnActive : ''}`}>
            <FileText size={16} /> Articles
          </button>
          <button onClick={() => setTypeFilter('photo')} className={`${styles.filterBtn} ${typeFilter === 'photo' ? styles.filterBtnActive : ''}`}>
            <ImageIcon size={16} /> Photos
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={`${styles.spinner} animate-spin`}></div>
          </div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : contents.length === 0 ? (
          <div className={styles.emptyState}>
            Aucun contenu disponible pour cette sélection actuellement.
          </div>
        ) : (
          <div className={styles.grid}>
            {contents.map((content) => (
              <Link href={`/shalom-tv/${content.id}`} key={content.id} className={styles.card}>
                <div className={styles.thumbnail}>
                  {content.thumbnail_url || (content.type === 'photo' && content.media_url) ? (
                    <img
                      src={resolveMediaUrl(content.thumbnail_url || content.media_url)}
                      alt={content.title}
                      className={styles.thumbnailImg}
                    />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>
                      {getTypeIcon(content.type)}
                    </div>
                  )}
                  <div className={styles.typeBadge}>
                    {getTypeIcon(content.type)}
                    <span>{content.type === 'audio' ? 'Podcast' : content.type === 'text' ? 'Article' : content.type === 'photo' ? 'Photo' : 'Vidéo'}</span>
                  </div>
                  {content.duration_seconds > 0 && (
                    <div className={styles.durationBadge}>
                      {Math.floor(content.duration_seconds / 60)}:{String(content.duration_seconds % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{content.title}</h3>
                  <p className={styles.cardDescription}>{content.description}</p>
                  <div className={styles.cardDate}>
                    {new Date(content.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
