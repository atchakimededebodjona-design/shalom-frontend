'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Film, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { postsService } from '../../services/posts.service';
import { uploadService } from '../../services/upload.service';
import { getApiError } from '../../utils/apiError';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

const TYPE_OPTIONS = [
  { value: 'texte', label: 'Texte' },
  { value: 'temoignage', label: 'Témoignage' },
  { value: 'priere', label: 'Prière' },
  { value: 'annonce', label: 'Annonce' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Vidéo' },
];

const MAX_LENGTH = 5000;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo
const needsMedia = (type) => type === 'image' || type === 'video';

export const PostComposer = ({ onCreated, groupId }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [content, setContent] = useState('');
  const [type, setType] = useState('texte');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = content.trim().length > 0 && !submitting && !uploading;

  const resetMedia = () => {
    setMediaUrl('');
    setUploadError('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTypeChange = (e) => {
    const next = e.target.value;
    setType(next);
    if (!needsMedia(next)) resetMedia();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Fichier trop volumineux (max 50 Mo)');
      resetMedia();
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadService.uploadFile(file, setProgress);
      setMediaUrl(res.data.url);
    } catch (err) {
      setUploadError(getApiError(err, "Échec du téléversement"));
      resetMedia();
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setSubmitting(true);
    try {
      const payload = { content: content.trim(), type };
      if (needsMedia(type) && mediaUrl) payload.media_url = mediaUrl;
      if (groupId) payload.group_id = groupId;
      const res = await postsService.createPost(payload);
      onCreated?.(res.data.post);
      // Réinitialiser
      setContent('');
      setType('texte');
      resetMedia();
    } catch (err) {
      setError(getApiError(err, 'Impossible de publier'));
    } finally {
      setSubmitting(false);
    }
  };

  const accept = type === 'video' ? 'video/*' : 'image/*';

  return (
    <form onSubmit={handleSubmit} className="glass p-lg" style={{ borderRadius: 'var(--radius-md)' }}>
      <div className="flex gap-md" style={{ alignItems: 'flex-start' }}>
        <Avatar src={user?.avatar_url} name={user?.display_name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_LENGTH}
            placeholder={groupId ? 'Partager un message avec le groupe…' : 'Que souhaitez-vous partager avec la communauté ?'}
            style={{ width: '100%', minHeight: '90px', resize: 'vertical' }}
          />

          {/* Zone média (image / vidéo) */}
          {needsMedia(type) && (
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!mediaUrl && !uploading && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover-lift"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    background: 'var(--bg-color-alt)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    color: 'var(--text-muted)',
                    fontWeight: 'bold',
                  }}
                >
                  {type === 'video' ? <Film size={18} /> : <ImagePlus size={18} />}
                  {type === 'video' ? 'Choisir une vidéo' : 'Choisir une image'}
                </button>
              )}

              {uploading && (
                <div className="text-sm text-muted" style={{ padding: 'var(--spacing-xs) 0' }}>
                  Téléversement… {progress}%
                  <div style={{ height: 6, background: 'var(--bg-color-alt)', borderRadius: 'var(--radius-full)', marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.2s ease' }} />
                  </div>
                </div>
              )}

              {mediaUrl && !uploading && (
                <div style={{ position: 'relative', marginTop: 'var(--spacing-xs)', display: 'inline-block', maxWidth: '100%' }}>
                  {type === 'video' ? (
                    <video src={mediaUrl} controls style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
                  ) : (
                    <img src={mediaUrl} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: 260, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'block' }} />
                  )}
                  <button
                    type="button"
                    onClick={resetMedia}
                    aria-label="Retirer le média"
                    title="Retirer"
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      display: 'flex', background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: 'var(--radius-full)', padding: 4, cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-sm" style={{ color: 'red', marginTop: 'var(--spacing-xs)' }}>{uploadError}</p>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm" style={{ color: 'red', marginTop: 'var(--spacing-sm)' }}>{error}</p>
          )}

          <div className="flex items-center justify-between gap-md" style={{ marginTop: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            <div className="flex items-center gap-sm">
              <select value={type} onChange={handleTypeChange} aria-label="Type de publication">
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className="text-muted text-sm">{content.length}/{MAX_LENGTH}</span>
            </div>
            <Button type="submit" variant="primary" isLoading={submitting} disabled={!canSubmit}>
              Publier
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
