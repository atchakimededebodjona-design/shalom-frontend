'use client';

import { useAuth } from '../../../contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { followsService } from '../../../services/follows.service';
import { profilesService } from '../../../services/profiles.service';
import { ProfileView } from '../../../components/profile/ProfileView';
import { ProfileEditForm } from '../../../components/profile/ProfileEditForm';
import { ChangePasswordForm } from '../../../components/profile/ChangePasswordForm';
import { FollowList } from '../../../components/follows/FollowList';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/ui/PageHeader';

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [counts, setCounts] = useState({ followers: null, following: null });
  const [modal, setModal] = useState(null); // 'followers' | 'following' | 'edit' | null

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadCounts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const c = await followsService.getCounts(user.id);
      setCounts(c);
    } catch {
      // Compteurs non critiques : on laisse les valeurs actuelles
    }
  }, [user?.id]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  if (loading || !user) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  const handleSaved = async () => {
    setModal(null);
    await refreshUser(); // resynchronise navbar/composer + cette page
  };

  // Changement direct d'une photo (profil ou couverture) : persiste puis rafraîchit.
  // Les erreurs remontent à ProfileView qui les affiche.
  const handlePhotoChange = useCallback(
    async (field, url) => {
      await profilesService.updateMe({ [field]: url });
      await refreshUser();
    },
    [refreshUser]
  );

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <PageHeader 
        title="Mon Profil" 
        description="Gérez vos informations personnelles et vos statistiques"
        showBack={true}
        fallbackHref="/dashboard"
      />

      <ProfileView
        profile={user}
        email={user.email}
        followersCount={counts.followers}
        followingCount={counts.following}
        onOpenFollowers={() => setModal('followers')}
        onOpenFollowing={() => setModal('following')}
        editable
        onPhotoChange={handlePhotoChange}
        action={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => setModal('edit')}>
              Modifier le profil
            </Button>
            <Button variant="secondary" onClick={() => setModal('password')}>
              Changer le mot de passe
            </Button>
            <Button
              variant={user.is_ambassador ? 'primary' : 'secondary'}
              onClick={() => router.push('/ambassador')}
              style={user.is_ambassador ? {} : { background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
            >
              {user.is_ambassador ? 'Espace Ambassadeur' : 'Devenir Ambassadeur'}
            </Button>
          </div>
        }
      />

      <Modal isOpen={modal === 'followers'} onClose={() => setModal(null)} title="Abonnés">
        <FollowList userId={user.id} type="followers" onItemClick={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'following'} onClose={() => setModal(null)} title="Abonnements">
        <FollowList userId={user.id} type="following" onItemClick={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Modifier le profil" maxWidth="560px">
        <ProfileEditForm profile={user} onSaved={handleSaved} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'password'} onClose={() => setModal(null)} title="Changer le mot de passe" maxWidth="480px">
        <ChangePasswordForm onSaved={() => setModal(null)} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  );
}
