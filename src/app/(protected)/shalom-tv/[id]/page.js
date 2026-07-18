'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import shalomTvService, { resolveMediaUrl } from '../../../../services/shalom-tv.service';
import { ArrowLeft, Headphones, FileText } from 'lucide-react';
import Link from 'next/link';
import styles from './player.module.css';

export default function ShalomTvPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchContent(params.id);
    }
  }, [params.id]);

  const fetchContent = async (id) => {
    try {
      const res = await shalomTvService.getContentById(id);
      setContent(res.data.data);
    } catch (err) {
      if (err.response?.status === 402 || err.response?.status === 403) {
        setError('Accès refusé. Veuillez vérifier votre abonnement.');
      } else {
        setError('Contenu introuvable ou erreur de chargement.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.centerScreen}>
        <div className={`${styles.spinner} animate-spin`}></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className={styles.centerScreen}>
        <p className={styles.errorText}>{error}</p>
        <button onClick={() => router.push('/shalom-tv')} className={styles.backBtn}>Retour à SHALOM TV</button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <Link href="/shalom-tv" className={styles.backLink}>
          <ArrowLeft size={20} /> Retour aux contenus
        </Link>

        {/* Lecteur / Affichage Média */}
        <div className={styles.mediaFrame}>
          {content.type === 'video' && content.media_url && (
            <video
              controls
              className={styles.video}
              poster={resolveMediaUrl(content.thumbnail_url)}
              autoPlay
            >
              <source src={resolveMediaUrl(content.media_url)} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          )}

          {content.type === 'audio' && content.media_url && (
            <div className={styles.audioFrame}>
              {content.thumbnail_url && (
                <div className={styles.audioBg}>
                  <img src={resolveMediaUrl(content.thumbnail_url)} className={styles.audioBgImg} alt="Background" />
                </div>
              )}
              <div className={styles.audioIcon}>
                <Headphones size={48} />
              </div>
              <audio controls className={styles.audioPlayer} autoPlay>
                <source src={resolveMediaUrl(content.media_url)} type="audio/mpeg" />
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          )}

          {content.type === 'photo' && content.media_url && (
            <img src={resolveMediaUrl(content.media_url)} alt={content.title} className={styles.photoImg} />
          )}

          {content.type === 'text' && (
            <div className={styles.textFrame}>
              {content.thumbnail_url && (
                <div className={styles.textBg}>
                  <img src={resolveMediaUrl(content.thumbnail_url)} className={styles.textBgImg} alt="Cover" />
                </div>
              )}
              <div className={styles.textCover}>
                <FileText size={48} />
                <h2 className={styles.textCoverTitle}>{content.title}</h2>
              </div>
            </div>
          )}
        </div>

        {/* Détails du contenu */}
        <div className={styles.details}>
          <div className={styles.detailsHeader}>
            <h1 className={styles.title}>{content.title}</h1>
            <div className={styles.audienceTag}>
              {content.target_audience === 'child' ? 'Enfants' : content.target_audience === 'adult' ? 'Adultes' : 'Tous'}
            </div>
          </div>

          <div className={styles.publishedAt}>
            Publié le {new Date(content.created_at).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <p className={styles.description}>{content.description}</p>

          {/* Contenu Texte (Articles) */}
          {content.type === 'text' && content.content_text && (
            <div className={styles.articleBody}>
              {content.content_text.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
