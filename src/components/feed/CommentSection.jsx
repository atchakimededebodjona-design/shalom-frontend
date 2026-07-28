'use client';

import { useEffect, useState } from 'react';
import { Send, Trash2, BadgeCheck, Star } from 'lucide-react';
import { commentsService } from '../../services/comments.service';
import { getApiError } from '../../utils/apiError';
import { timeAgo } from '../../utils/date';
import { Avatar } from '../ui/Avatar';

export const CommentSection = ({ postId, currentUser, onCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const res = await commentsService.getComments(postId, { limit: 50 });
        if (active) setComments(res.data.comments);
      } catch (err) {
        if (active) setLoadError(getApiError(err, 'Impossible de charger les commentaires'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await commentsService.addComment(postId, { content: trimmed });
      // Le POST renvoie la ligne brute sans author_profile (jointure faite au GET seulement)
      // → on l'injecte depuis l'utilisateur courant pour un affichage correct immédiat
      const comment = res.data.comment;
      const enriched = comment.author_profile
        ? comment
        : {
            ...comment,
            author_profile: {
              user_id: currentUser?.id,
              display_name: currentUser?.display_name,
              avatar_url: currentUser?.avatar_url,
              is_verified: currentUser?.is_verified,
              is_ambassador: currentUser?.is_ambassador,
            },
          };
      setComments((prev) => [...prev, enriched]); // ordre chronologique (asc)
      setContent('');
      onCountChange?.(1);
    } catch (err) {
      setSubmitError(getApiError(err, "Impossible d'ajouter le commentaire"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    try {
      await commentsService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCountChange?.(-1);
    } catch (err) {
      setSubmitError(getApiError(err, 'Suppression impossible'));
    }
  };

  return (
    <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)' }}>
      {/* Liste */}
      {loading ? (
        <p className="text-muted text-sm animate-pulse">Chargement des commentaires…</p>
      ) : loadError ? (
        <p className="text-sm" style={{ color: 'red' }}>{loadError}</p>
      ) : comments.length === 0 ? (
        <p className="text-muted text-sm">Aucun commentaire pour le moment.</p>
      ) : (
        <div className="flex-col gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
          {comments.map((comment) => {
            const author = comment.author_profile || {};
            const canDelete = currentUser?.id && comment.author_id === currentUser.id;
            return (
              <div key={comment.id} className="flex gap-sm" style={{ alignItems: 'flex-start' }}>
                <Avatar src={author.avatar_url} name={author.display_name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-color-alt)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-sm">
                      <div className="flex items-center gap-xs">
                        <span className="font-bold text-sm">{author.display_name || 'Utilisateur'}</span>
                        {author.is_verified && <BadgeCheck size={14} color="var(--secondary)" aria-label="Vérifié" />}
                        {author.is_ambassador && <Star size={14} color="var(--primary)" fill="var(--secondary)" className="animate-twinkle" aria-label="Ambassadeur certifié" />}
                      </div>
                      <span className="flex items-center gap-sm">
                        <span className="text-muted text-sm">{timeAgo(comment.created_at)}</span>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            aria-label="Supprimer le commentaire"
                            title="Supprimer"
                            style={{ display: 'flex', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: 0 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </span>
                    </div>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '2px' }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex gap-sm items-center">
        <Avatar src={currentUser?.avatar_url} name={currentUser?.display_name} size={32} />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un commentaire…"
          maxLength={2000}
          style={{ flex: 1, minWidth: 0 }}
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          aria-label="Envoyer"
          className="hover-lift"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--primary)',
            color: 'var(--on-primary)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: 'var(--spacing-sm)',
            opacity: !content.trim() || submitting ? 0.5 : 1,
            cursor: !content.trim() || submitting ? 'not-allowed' : 'pointer',
          }}
        >
          <Send size={16} />
        </button>
      </form>
      {submitError && (
        <p className="text-sm" style={{ color: 'red', marginTop: 'var(--spacing-sm)' }}>{submitError}</p>
      )}
    </div>
  );
};
