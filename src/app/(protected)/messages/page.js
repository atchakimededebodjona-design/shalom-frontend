'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { messagesService } from '../../../services/messages.service';
import { getApiError } from '../../../utils/apiError';
import { ConversationRow } from '../../../components/messages/ConversationRow';
import { Button } from '../../../components/ui/Button';
import { BackButton } from '../../../components/ui/BackButton';

const PAGE_SIZE = 20;

export default function MessagesInboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const loadFirst = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await messagesService.getConversations({ page: 1, limit: PAGE_SIZE });
      setConversations(res.data.conversations);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les conversations'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadFirst();
  }, [user, loadFirst]);

  const handleLoadMore = async () => {
    if (!pagination?.has_next || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await messagesService.getConversations({ page: pagination.page + 1, limit: PAGE_SIZE });
      setConversations((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        return [...prev, ...res.data.conversations.filter((c) => !seen.has(c.id))];
      });
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger plus'));
    } finally {
      setLoadingMore(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0', maxWidth: '700px' }}>
      <div className="mb-md"><BackButton fallbackHref="/dashboard" /></div>

      <h1 className="text-primary mb-lg flex items-center gap-sm">
        <Inbox size={26} /> Messages
      </h1>

      {loading ? (
        <div className="glass p-lg text-center text-muted animate-pulse" style={{ borderRadius: 'var(--radius-md)' }}>
          Chargement…
        </div>
      ) : error && conversations.length === 0 ? (
        <div className="glass p-lg text-center" style={{ borderRadius: 'var(--radius-md)', color: 'red' }}>{error}</div>
      ) : conversations.length === 0 ? (
        <div className="glass p-lg text-center text-muted" style={{ borderRadius: 'var(--radius-md)' }}>
          Aucune conversation. Ouvrez le profil d'un membre et cliquez sur « Envoyer un message » pour démarrer.
        </div>
      ) : (
        <div className="flex-col gap-sm">
          {conversations.map((c) => (
            <ConversationRow key={c.id} conversation={c} />
          ))}

          {error && <p className="text-sm text-center" style={{ color: 'red' }}>{error}</p>}

          {pagination?.has_next && (
            <div className="flex justify-center" style={{ marginTop: 'var(--spacing-md)' }}>
              <Button variant="secondary" onClick={handleLoadMore} isLoading={loadingMore}>Charger plus</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
