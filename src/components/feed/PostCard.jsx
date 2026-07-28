'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Trash2, BadgeCheck, Star } from 'lucide-react';
import { postsService } from '../../services/posts.service';
import { likesService } from '../../services/likes.service';
import { getApiError } from '../../utils/apiError';
import { timeAgo } from '../../utils/date';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import { Avatar } from '../ui/Avatar';
import { FollowButton } from '../follows/FollowButton';
import { CommentSection } from './CommentSection';

// Libellés des types affichés sous forme de pastille (le texte simple n'en a pas)
const TYPE_LABELS = {
  temoignage: 'Témoignage',
  priere: 'Prière',
  annonce: 'Annonce',
  image: 'Image',
  video: 'Vidéo',
};

export const PostCard = ({ post, currentUser, onDeleted }) => {
  const author = post.author_profile || {};
  const isOwner = currentUser?.id && post.author_id === currentUser.id;
  const profileHref = isOwner ? '/profile' : `/users/${post.author_id}`;

  const [liked, setLiked] = useState(post.is_liked ?? false); // état initial fourni par le feed
  const [likesCount, setLikesCount] = useState(post.likes_count ?? 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleToggleLike = async () => {
    if (liking) return;
    const next = !liked;

    // Mise à jour optimiste
    setLiked(next);
    setLikesCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setLiking(true);
    setActionError('');

    try {
      if (next) {
        await likesService.addLike('post', post.id);
      } else {
        await likesService.removeLike('post', post.id);
      }
    } catch (err) {
      // 409 = déjà liké côté serveur : l'état « liké » reste valide
      if (next && err?.response?.status === 409) {
        return;
      }
      // Sinon on annule l'optimisme
      setLiked(!next);
      setLikesCount((c) => Math.max(0, c + (next ? -1 : 1)));
      setActionError(getApiError(err, 'Action impossible'));
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm('Supprimer cette publication ?')) return;

    setDeleting(true);
    setActionError('');
    try {
      await postsService.deletePost(post.id);
      onDeleted?.(post.id);
    } catch (err) {
      setActionError(getApiError(err, 'Suppression impossible'));
      setDeleting(false);
    }
  };

  const typeLabel = TYPE_LABELS[post.type];

  return (
    <article className="glass p-lg" style={{ borderRadius: 'var(--radius-md)' }}>
      {/* En-tête */}
      <header className="flex items-center justify-between gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
        <Link
          href={profileHref}
          className="flex items-center gap-sm hover-lift"
          style={{ minWidth: 0, color: 'inherit', textDecoration: 'none' }}
        >
          <Avatar src={author.avatar_url} name={author.display_name} size={44} />
          <div style={{ minWidth: 0 }}>
            <div className="flex items-center gap-xs">
              <span className="font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {author.display_name || 'Utilisateur'}
              </span>
              {author.is_verified && <BadgeCheck size={16} color="var(--secondary)" aria-label="Vérifié" />}
              {author.is_ambassador && <Star size={16} color="var(--primary)" fill="var(--secondary)" className="animate-twinkle" aria-label="Ambassadeur certifié" />}
            </div>
            <span className="text-muted text-sm">{timeAgo(post.created_at)}</span>
          </div>
        </Link>

        <div className="flex items-center gap-sm">
          {typeLabel && (
            <span
              className="text-sm"
              style={{
                backgroundColor: 'var(--bg-color-alt)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                padding: '0.15rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
              }}
            >
              {typeLabel}
            </span>
          )}
          <FollowButton userId={post.author_id} initialFollowing={post.is_following} size="sm" />
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Supprimer la publication"
              title="Supprimer"
              className="hover-lift"
              style={{
                display: 'flex',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: 'var(--spacing-xs)',
                opacity: deleting ? 0.5 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Contenu */}
      {post.content && (
        <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>{post.content}</p>
      )}

      {/* Média */}
      {post.media_url && post.type === 'image' && (
        <img
          src={resolveMediaUrl(post.media_url)}
          alt=""
          style={{
            width: '100%',
            marginTop: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        />
      )}
      {post.media_url && post.type === 'video' && (
        <video
          src={resolveMediaUrl(post.media_url)}
          controls
          style={{ width: '100%', marginTop: 'var(--spacing-md)', borderRadius: 'var(--radius-md)' }}
        />
      )}

      {actionError && (
        <p className="text-sm" style={{ color: 'red', marginTop: 'var(--spacing-sm)' }}>
          {actionError}
        </p>
      )}

      {/* Actions */}
      <div
        className="flex items-center gap-lg"
        style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--border-color)' }}
      >
        <button
          type="button"
          onClick={handleToggleLike}
          className="flex items-center gap-xs hover-lift"
          aria-pressed={liked}
          style={{
            background: 'transparent',
            border: 'none',
            color: liked ? '#E0245E' : 'var(--text-muted)',
            fontWeight: 'bold',
            padding: 'var(--spacing-xs)',
          }}
        >
          <Heart size={18} color="#E0245E" fill={liked ? '#E0245E' : 'none'} />
          <span className="text-sm">{likesCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-xs hover-lift"
          aria-expanded={showComments}
          style={{
            background: 'transparent',
            border: 'none',
            color: showComments ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 'bold',
            padding: 'var(--spacing-xs)',
          }}
        >
          <MessageCircle size={18} />
          <span className="text-sm">{commentsCount}</span>
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCountChange={(delta) => setCommentsCount((c) => Math.max(0, c + delta))}
        />
      )}
    </article>
  );
};
