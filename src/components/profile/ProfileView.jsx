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
      style={{ borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '0 auto', overflow: 'hidden' }}
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
            height: '140px',
            cursor: editable ? 'pointer' : 'default',
            background: profile.cover_url
              ? `center / cover no-repeat url(${resolveMediaUrl(profile.cover_url)})`
              : 'linear-gradient(120deg, var(--primary), var(--secondary))',
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
                top: 'var(--spacing-sm)',
                right: 'var(--spacing-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                pointerEvents: 'none',
              }}
            >
              {uploading.cover ? <LoaderCircle size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading.cover ? 'Envoi…' : 'Couverture'}
            </div>
          </>
        )}
      </div>

      <div className="flex-col items-center text-center p-lg" style={{ marginTop: '-56px' }}>
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
              border: '4px solid var(--bg-color-alt)',
              borderRadius: 'var(--radius-full)',
              cursor: editable ? 'pointer' : 'default',
              position: 'relative',
              lineHeight: 0,
            }}
          >
            <Avatar src={profile.avatar_url} name={profile.display_name} size={100} />
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
                  bottom: 4,
                  right: 4,
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-color-alt)',
                  pointerEvents: 'none',
                }}
              >
                <Camera size={15} />
              </div>
            </>
          )}
        </div>

        {editable && photoError && (
          <p className="text-sm" style={{ color: 'red', marginTop: 'var(--spacing-xs)' }}>{photoError}</p>
        )}

        <div className="flex items-center gap-xs" style={{ marginTop: 'var(--spacing-sm)' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{profile.display_name}</h1>
          {profile.is_verified && <BadgeCheck size={20} color="var(--secondary)" aria-label="Vérifié" />}
          {profile.is_ambassador && <Star size={18} color="var(--accent)" aria-label="Ambassadeur" />}
        </div>

        {email && <p className="text-muted text-sm">{email}</p>}

        {profile.bio && <p style={{ marginTop: 'var(--spacing-sm)' }}>{profile.bio}</p>}

        {/* Détails */}
        <div className="flex-col gap-xs" style={{ marginTop: 'var(--spacing-md)', alignItems: 'center' }}>
          <DetailRow icon={<MapPin size={15} />}>{location}</DetailRow>
          <DetailRow icon={<Church size={15} />}>
            {[profile.church_name, profile.denomination].filter(Boolean).join(' · ')}
          </DetailRow>
          {profile.website && (
            <div className="flex items-center gap-sm text-sm">
              <Globe size={15} color="var(--text-muted)" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="flex items-center justify-center" style={{ marginTop: 'var(--spacing-md)' }}>
          <StatButton label="Abonnés" value={followersCount} onClick={onOpenFollowers} />
          <StatButton label="Abonnements" value={followingCount} onClick={onOpenFollowing} />
        </div>

        {action && <div style={{ marginTop: 'var(--spacing-md)' }}>{action}</div>}
      </div>
    </div>
  );
};
