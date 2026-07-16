'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { profilesService } from '../../../../services/profiles.service';
import { followsService } from '../../../../services/follows.service';
import { messagesService } from '../../../../services/messages.service';
import { getApiError } from '../../../../utils/apiError';
import { ProfileView } from '../../../../components/profile/ProfileView';
import { FollowButton } from '../../../../components/follows/FollowButton';
import { FollowList } from '../../../../components/follows/FollowList';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { BackButton } from '../../../../components/ui/BackButton';

export default function UserProfile() {
  const { userId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ followers: null, following: null });
  const [isFollowing, setIsFollowing] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [startingChat, setStartingChat] = useState(false);
  const [chatError, setChatError] = useState('');

  // Non authentifié → login
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Son propre profil → page dédiée
  useEffect(() => {
    if (user?.id && userId === user.id) router.replace('/profile');
  }, [user, userId, router]);

  useEffect(() => {
    if (!user || !userId || userId === user.id) return undefined;
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [profRes, statusRes] = await Promise.all([
          profilesService.getById(userId),
          followsService.getFollowStatus(userId),
        ]);
        if (!active) return;
        setProfile(profRes.data.profile);
        setIsFollowing(statusRes.data.isFollowing);
      } catch (err) {
        if (active) setError(getApiError(err, 'Profil introuvable'));
      } finally {
        if (active) setLoading(false);
      }
      // Compteurs (non bloquants)
      followsService
        .getCounts(userId)
        .then((c) => active && setCounts(c))
        .catch(() => {});
    })();
    return () => {
      active = false;
    };
  }, [user, userId]);

  const handleStartChat = async () => {
    if (startingChat) return;
    setStartingChat(true);
    setChatError('');
    try {
      const res = await messagesService.createConversation([userId]);
      router.push(`/messages/${res.data.conversation_id}`);
    } catch (err) {
      setChatError(getApiError(err, 'Impossible de démarrer la conversation'));
      setStartingChat(false);
    }
  };

  const handleFollowChange = (next) => {
    setIsFollowing(next);
    setCounts((c) => ({
      ...c,
      followers: c.followers === null ? c.followers : Math.max(0, c.followers + (next ? 1 : -1)),
    }));
  };

  const showSpinner = authLoading || !user || (userId === user?.id) || (loading && !profile);

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md">
        <BackButton fallbackHref="/dashboard" />
      </div>

      {showSpinner ? (
        <div className="flex justify-center items-center" style={{ minHeight: '40vh' }}>
          <div className="animate-pulse">Chargement...</div>
        </div>
      ) : error ? (
        <div className="glass p-lg text-center" style={{ borderRadius: 'var(--radius-md)', maxWidth: '600px', margin: '0 auto', color: 'red' }}>
          {error}
        </div>
      ) : (
        <>
          <ProfileView
            profile={profile}
            followersCount={counts.followers}
            followingCount={counts.following}
            onOpenFollowers={() => setModal('followers')}
            onOpenFollowing={() => setModal('following')}
            action={
              <div className="flex-col items-center gap-xs">
                <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <FollowButton userId={userId} initialFollowing={isFollowing} onChange={handleFollowChange} />
                  <Button variant="secondary" onClick={handleStartChat} isLoading={startingChat}>
                    <span className="flex items-center gap-xs"><MessageSquare size={16} /> Message</span>
                  </Button>
                </div>
                {chatError && <span className="text-sm" style={{ color: 'red' }}>{chatError}</span>}
              </div>
            }
          />

          <Modal isOpen={modal === 'followers'} onClose={() => setModal(null)} title="Abonnés">
            <FollowList userId={userId} type="followers" onItemClick={() => setModal(null)} />
          </Modal>

          <Modal isOpen={modal === 'following'} onClose={() => setModal(null)} title="Abonnements">
            <FollowList userId={userId} type="following" onItemClick={() => setModal(null)} />
          </Modal>
        </>
      )}
    </div>
  );
}
