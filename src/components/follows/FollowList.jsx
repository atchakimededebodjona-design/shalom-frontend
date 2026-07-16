'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { followsService } from '../../services/follows.service';
import { getApiError } from '../../utils/apiError';
import { Avatar } from '../ui/Avatar';
import { FollowButton } from './FollowButton';

// type : 'followers' | 'following'
export const FollowList = ({ userId, type, onItemClick }) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const fetchPage = useCallback(
    async (page) => {
      const res =
        type === 'followers'
          ? await followsService.getFollowers(userId, { page, limit: 20 })
          : await followsService.getFollowing(userId, { page, limit: 20 });
      const list = type === 'followers' ? res.data.followers : res.data.following;
      return { list, pagination: res.data.pagination };
    },
    [userId, type]
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { list, pagination: pg } = await fetchPage(1);
        if (!active) return;
        setItems(list);
        setPagination(pg);
      } catch (err) {
        if (active) setError(getApiError(err, 'Impossible de charger la liste'));
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
    try {
      const { list, pagination: pg } = await fetchPage(pagination.page + 1);
      setItems((prev) => {
        const seen = new Set(prev.map((it) => it.profile?.user_id));
        return [...prev, ...list.filter((it) => !seen.has(it.profile?.user_id))];
      });
      setPagination(pg);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger plus'));
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return <p className="text-muted text-sm animate-pulse">Chargement…</p>;
  }
  if (error && items.length === 0) {
    return <p className="text-sm" style={{ color: 'red' }}>{error}</p>;
  }
  if (items.length === 0) {
    return (
      <p className="text-muted text-sm text-center py-md">
        {type === 'followers' ? 'Aucun abonné pour le moment.' : 'Aucun abonnement pour le moment.'}
      </p>
    );
  }

  return (
    <div className="flex-col gap-md">
      {items.map((item) => {
        const p = item.profile || {};
        const subtitle = [p.city, p.country].filter(Boolean).join(', ');
        return (
          <div key={p.user_id} className="flex items-center justify-between gap-md">
            <Link
              href={`/users/${p.user_id}`}
              onClick={onItemClick}
              className="flex items-center gap-sm"
              style={{ minWidth: 0, flex: 1, color: 'inherit' }}
            >
              <Avatar src={p.avatar_url} name={p.display_name} size={40} />
              <span style={{ minWidth: 0 }}>
                <span className="font-bold" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.display_name || 'Utilisateur'}
                </span>
                {subtitle && <span className="text-muted text-sm">{subtitle}</span>}
              </span>
            </Link>
            <FollowButton userId={p.user_id} size="sm" />
          </div>
        );
      })}

      {error && <p className="text-sm" style={{ color: 'red' }}>{error}</p>}

      {pagination?.has_next && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="hover-lift"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-sm)',
            color: 'var(--primary)',
            fontWeight: 'bold',
          }}
        >
          {loadingMore ? 'Chargement…' : 'Charger plus'}
        </button>
      )}
    </div>
  );
};
