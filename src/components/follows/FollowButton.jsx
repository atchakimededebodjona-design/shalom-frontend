'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { followsService } from '../../services/follows.service';
import { getApiError } from '../../utils/apiError';
import { Button } from '../ui/Button';

// Cache mémoire du statut de suivi par userId : évite de refetcher /follow-status
// à chaque montage (ex: plusieurs posts du même auteur dans le feed).
const statusCache = new Map();

export const FollowButton = ({ userId, initialFollowing, onChange, size = 'md' }) => {
  const { user } = useAuth();

  const seed =
    initialFollowing !== undefined
      ? initialFollowing
      : statusCache.has(userId)
        ? statusCache.get(userId)
        : null;

  const [following, setFollowing] = useState(seed);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const isSelf = !userId || (user?.id && userId === user.id);

  useEffect(() => {
    if (isSelf) return undefined;
    if (following !== null) {
      statusCache.set(userId, following);
      return undefined;
    }
    // Statut inconnu → on le récupère
    let active = true;
    (async () => {
      try {
        const res = await followsService.getFollowStatus(userId);
        if (!active) return;
        statusCache.set(userId, res.data.isFollowing);
        setFollowing(res.data.isFollowing);
      } catch {
        if (active) setFollowing(false); // repli : on suppose non suivi
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isSelf]);

  if (isSelf) return null;

  const handleToggle = async () => {
    if (pending || following === null) return;
    const next = !following;

    setFollowing(next);
    statusCache.set(userId, next);
    setPending(true);
    setError('');
    try {
      if (next) {
        await followsService.follow(userId);
      } else {
        await followsService.unfollow(userId);
      }
      onChange?.(next);
    } catch (err) {
      // Annulation optimiste
      setFollowing(!next);
      statusCache.set(userId, !next);
      setError(getApiError(err, 'Action impossible'));
    } finally {
      setPending(false);
    }
  };

  const compact = size === 'sm';
  const label =
    following === null ? '…' : following ? 'Abonné' : 'Suivre';

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
      <Button
        variant={following ? 'secondary' : 'primary'}
        onClick={handleToggle}
        isLoading={pending}
        disabled={following === null || pending}
        style={compact ? { padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: '0.875rem' } : undefined}
      >
        {label}
      </Button>
      {error && <span className="text-sm" style={{ color: 'red' }}>{error}</span>}
    </span>
  );
};
