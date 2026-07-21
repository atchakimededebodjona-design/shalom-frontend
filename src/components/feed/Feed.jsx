'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { postsService } from '../../services/posts.service';
import { getApiError } from '../../utils/apiError';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';

const PAGE_SIZE = 10;

export const Feed = ({ groupId, showComposer = true, emptyMessage }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(async (page) => {
    const res = await postsService.getFeed({ page, limit: PAGE_SIZE, groupId });
    return res.data; // { posts, pagination }
  }, [groupId]);

  // Chargement initial
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPage(1);
        if (!active) return;
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (err) {
        if (active) setError(getApiError(err, 'Impossible de charger le fil'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const handleLoadMore = async () => {
    if (!pagination?.has_next || loadingMore) return;
    setLoadingMore(true);
    setError('');
    try {
      const data = await fetchPage(pagination.page + 1);
      // Dédoublonnage défensif (un nouveau post créé peut décaler la pagination)
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...data.posts.filter((p) => !seen.has(p.id))];
      });
      setPagination(data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger plus de publications'));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreated = (post) => {
    // Le nouveau post arrive du POST /posts sans author_profile → on l'injecte
    const enriched = post.author_profile
      ? post
      : {
          ...post,
          author_profile: {
            user_id: user?.id,
            display_name: user?.display_name,
            avatar_url: user?.avatar_url,
            is_verified: user?.is_verified,
          },
        };
    setPosts((prev) => [enriched, ...prev]);
  };

  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="flex-col gap-md">
      {showComposer && <PostComposer onCreated={handleCreated} groupId={groupId} />}

      {loading ? (
        <div className="glass p-lg text-center text-muted animate-pulse" style={{ borderRadius: 'var(--radius-md)' }}>
          Chargement du fil…
        </div>
      ) : error && posts.length === 0 ? (
        <div className="glass p-lg text-center" style={{ borderRadius: 'var(--radius-md)', color: 'red' }}>
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass p-lg" style={{ borderRadius: 'var(--radius-md)' }}>
          <p className="text-muted text-center py-md">
            {emptyMessage || "Le fil d'actualité est vide. Soyez le premier à publier !"}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} onDeleted={handleDeleted} />
          ))}

          {error && (
            <p className="text-sm text-center" style={{ color: 'red' }}>{error}</p>
          )}

          {pagination?.has_next && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="glass hover-lift"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-md)',
                color: 'var(--primary)',
                fontWeight: 'bold',
                border: '1px solid var(--border-color)',
              }}
            >
              {loadingMore ? 'Chargement…' : 'Charger plus'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
