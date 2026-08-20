'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { messagesService } from '../../../services/messages.service';
import { usePaginatedFetch } from '../../../hooks/usePaginatedFetch';
import { ConversationRow } from '../../../components/messages/ConversationRow';
import { Button } from '../../../components/ui/Button';
import { PageHeader } from '../../../components/ui/PageHeader';

const PAGE_SIZE = 20;

export default function MessagesInboxPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const fetchPage = useCallback(async (page) => {
    const res = await messagesService.getConversations({ page, limit: PAGE_SIZE });
    return { items: res.data.conversations, pagination: res.data.pagination };
  }, []);

  const {
    items: conversations, pagination, loading, loadingMore, error, reload, loadMore,
  } = usePaginatedFetch(fetchPage, { errorMessage: 'Impossible de charger les conversations' });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  if (authLoading || !user) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0', maxWidth: '700px' }}>
      <PageHeader 
        title="Messages" 
        description="Vos conversations privées."
        showBack={true}
        fallbackHref="/dashboard"
      />

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
              <Button variant="secondary" onClick={loadMore} isLoading={loadingMore}>Charger plus</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
