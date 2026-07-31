'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { postsService } from '../../../../services/posts.service';
import { getApiError } from '../../../../utils/apiError';
import { PostCard } from '../../../../components/feed/PostCard';
import { BackButton } from '../../../../components/ui/BackButton';

export default function PostDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id) return undefined;
    let active = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await postsService.getPost(id);
        if (active) setPost(res.data.post);
      } catch (err) {
        if (active) setError(getApiError(err, 'Publication introuvable ou supprimée'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, id]);

  const showSpinner = authLoading || !user || (loading && !post);

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
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <PostCard post={post} currentUser={user} onDeleted={() => router.push('/dashboard')} />
        </div>
      )}
    </div>
  );
}
