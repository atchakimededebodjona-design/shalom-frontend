'use client';

import { useRef, useState } from 'react';
import { BadgeCheck, Star, MapPin, Globe, Church, Camera, LoaderCircle } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { uploadService } from '../../services/upload.service';
import { getApiError } from '../../utils/apiError';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10 Mo

// Vignette statistique cliquable (Abonnés / Abonnements)
const StatButton = ({ label, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="hover-lift"
    style={{
      background: 'transparent',
      border: 'none',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      textAlign: 'center',
      cursor: 'pointer',
    }}
  >
    <span className="text-primary" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 'bold' }}>
      {value === null || value === undefined ? '…' : value}
    </span>
    <span className="text-sm text-muted">{label}</span>
  </button>
);

const DetailRow = ({ icon, children }) =>
  children ? (
    <div className="flex items-center gap-sm text-muted text-sm">
      {icon}
      <span>{children}</span>
    </div>
  ) : null;

// Affichage partagé d'un profil (le sien ou celui d'un autre membre).
// `action` = zone d'action (bouton Modifier ou bouton Suivre).
// `editable` = active le changement direct des photos (profil + couverture) en cliquant dessus.
// `onPhotoChange(field, url)` = callback appelé après upload réussi ; le parent persiste + rafraîchit.
export const ProfileView = ({
  profile,
  email,
  followersCount,
  followingCount,
  onOpenFollowers,
  onOpenFollowing,
  action,
  editable = false,
  onPhotoChange,
}) => {
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [uploading, setUploading] = useState({ cover: false, avatar: false });
  const [photoError, setPhotoError] = useState('');

  // field = 'cover_url' | 'avatar_url' ; key = 'cover' | 'avatar'
  const handlePhoto = (field, key) => async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de re-sélectionner le même fichier plus tard
    if (!file) return;

    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Veuillez choisir une image.');
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('Image trop volumineuse (max 10 Mo).');
      return;
    }

    setUploading((u) => ({ ...u, [key]: true }));
    try {
      const res = await uploadService.uploadFile(file);
      await onPhotoChange?.(field, res.data.url);
    } catch (err) {
      setPhotoError(getApiError(err, 'Échec du changement de photo.'));
    } finally {
      setUploading((u) => ({ ...u, [key]: false }));
    }
  };

  if (!profile) return null;

  const location = [profile.city, profile.country].filter(Boolean).join(', ');

  return (
    <div
      className="glass"
      style={{ 
        borderRadius: 'var(--radius-2xl)', 
        maxWidth: '640px', 
        margin: '0 auto', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--glass-border)'
      }}
    >
      {/* Bannière de couverture (cliquable en mode édition) */}
      <div style={{ position: 'relative' }}>
        <div
          onClick={editable ? () => coverInputRef.current?.click() : undefined}
          role={editable ? 'button' : undefined}
          tabIndex={editable ? 0 : undefined}
          title={editable ? 'Changer la photo de couverture' : undefined}
          onKeyDown={
            editable
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    coverInputRef.current?.click();
                  }
                }
              : undefined
          }
          style={{
            height: '180px',
            cursor: editable ? 'pointer' : 'default',
            background: profile.cover_url
              ? `center / cover no-repeat url(${resolveMediaUrl(profile.cover_url)})`
              : 'var(--gradient-primary)',
          }}
        />
        {editable && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhoto('cover_url', 'cover')}
              style={{ display: 'none' }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(10, 22, 38, 0.6)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                pointerEvents: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {uploading.cover ? <LoaderCircle size={16} className="animate-spin" /> : <Camera size={16} />}
              {uploading.cover ? 'Envoi…' : 'Couverture'}
            </div>
          </>
        )}
      </div>

      <div className="flex-col items-center text-center p-xl" style={{ marginTop: '-72px', background: 'var(--bg-color-alt)' }}>
        {/* Avatar (cliquable en mode édition) */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={editable ? () => avatarInputRef.current?.click() : undefined}
            role={editable ? 'button' : undefined}
            tabIndex={editable ? 0 : undefined}
            title={editable ? 'Changer la photo de profil' : undefined}
            onKeyDown={
              editable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      avatarInputRef.current?.click();
                    }
                  }
                : undefined
            }
            style={{
              border: '6px solid var(--bg-color-alt)',
              borderRadius: 'var(--radius-full)',
              cursor: editable ? 'pointer' : 'default',
              position: 'relative',
              lineHeight: 0,
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <Avatar src={profile.avatar_url} name={profile.display_name} size={120} />
            {editable && uploading.avatar && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                }}
              >
                <LoaderCircle size={26} className="animate-spin" />
              </div>
            )}
          </div>
          {editable && (
            <>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto('avatar_url', 'avatar')}
                style={{ display: 'none' }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  bottom: 6,
                  right: 6,
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-primary)',
                  color: 'var(--on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid var(--bg-color-alt)',
                  pointerEvents: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Camera size={16} />
              </div>
            </>
          )}
        </div>

        {editable && photoError && (
          <p className="text-sm" style={{ color: 'red', marginTop: 'var(--spacing-xs)' }}>{photoError}</p>
        )}

        <div className="flex items-center gap-sm" style={{ marginTop: 'var(--spacing-md)' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--secondary)' }}>{profile.display_name}</h1>
          {profile.is_verified && <BadgeCheck size={24} color="var(--primary)" aria-label="Vérifié" />}
          {profile.is_ambassador && <Star size={22} color="var(--primary)" fill="var(--secondary)" className="animate-twinkle" aria-label="Ambassadeur certifié" />}
        </div>

        {email && <p className="text-muted text-md" style={{ marginTop: 'var(--spacing-xs)' }}>{email}</p>}

        {profile.bio && <p style={{ marginTop: 'var(--spacing-md)', maxWidth: '480px', lineHeight: 1.6 }}>{profile.bio}</p>}

        {/* Détails */}
        <div className="flex-col gap-sm" style={{ marginTop: 'var(--spacing-lg)', alignItems: 'center' }}>
          <DetailRow icon={<MapPin size={16} color="var(--primary)" />}>{location}</DetailRow>
          <DetailRow icon={<Church size={16} color="var(--primary)" />}>
            {[profile.church_name, profile.denomination].filter(Boolean).join(' · ')}
          </DetailRow>
          {profile.website && (
            <div className="flex items-center gap-sm text-sm">
              <Globe size={16} color="var(--primary)" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover-lift" style={{ fontWeight: 'bold' }}>
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="flex items-center justify-center gap-xl" style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-md) 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', width: '100%' }}>
          <StatButton label="Abonnés" value={followersCount} onClick={onOpenFollowers} />
          <StatButton label="Abonnements" value={followingCount} onClick={onOpenFollowing} />
        </div>

        {action && <div style={{ marginTop: 'var(--spacing-xl)' }}>{action}</div>}
      </div>
    </div>
  );
};
