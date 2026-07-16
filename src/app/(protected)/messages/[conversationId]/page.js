'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { messagesService } from '../../../../services/messages.service';
import { getApiError } from '../../../../utils/apiError';
import { MessageBubble } from '../../../../components/messages/MessageBubble';
import { Avatar } from '../../../../components/ui/Avatar';
import { BackButton } from '../../../../components/ui/BackButton';

const LIMIT = 30;
const POLL_MS = 5000;

export default function ConversationThreadPage() {
  const { conversationId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState([]); // ordre chronologique (ancien → récent)
  const [participant, setParticipant] = useState(null); // interlocuteur (via /conversations/:id)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const oldestPageRef = useRef(1);
  const messagesRef = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // Chargement initial + marquage comme lu
  useEffect(() => {
    if (!user || !conversationId) return;
    let active = true;
    // Détail de la conversation (interlocuteur) — indépendant des messages
    messagesService
      .getConversation(conversationId)
      .then((res) => {
        if (active) setParticipant(res.data.conversation.other_participants?.[0] || null);
      })
      .catch(() => {});
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await messagesService.getMessages(conversationId, { page: 1, limit: LIMIT });
        if (!active) return;
        setMessages([...res.data.messages].reverse());
        setHasMoreOlder(res.data.pagination.has_next);
        oldestPageRef.current = 1;
        messagesService.markAsRead(conversationId).catch(() => {});
        setTimeout(scrollToBottom, 0);
      } catch (err) {
        if (active) setError(getApiError(err, 'Conversation introuvable ou inaccessible'));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, conversationId, scrollToBottom]);

  // Polling des nouveaux messages
  useEffect(() => {
    if (!user || !conversationId) return undefined;
    const interval = setInterval(async () => {
      try {
        const res = await messagesService.getMessages(conversationId, { page: 1, limit: LIMIT });
        const asc = [...res.data.messages].reverse();
        const known = new Set(messagesRef.current.map((m) => m.id));
        const toAdd = asc.filter((m) => !known.has(m.id));
        if (toAdd.length > 0) {
          setMessages((prev) => [...prev, ...toAdd]);
          setTimeout(scrollToBottom, 0);
          if (toAdd.some((m) => m.sender_id !== user.id)) {
            messagesService.markAsRead(conversationId).catch(() => {});
          }
        }
      } catch {
        /* silencieux : on réessaiera au prochain tick */
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [user, conversationId, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await messagesService.sendMessage(conversationId, { content: trimmed });
      setMessages((prev) => [...prev, res.data.message]);
      setContent('');
      setTimeout(scrollToBottom, 0);
    } catch (err) {
      setError(getApiError(err, "Impossible d'envoyer le message"));
    } finally {
      setSending(false);
    }
  };

  const handleLoadOlder = async () => {
    if (!hasMoreOlder || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const nextPage = oldestPageRef.current + 1;
      const res = await messagesService.getMessages(conversationId, { page: nextPage, limit: LIMIT });
      const asc = [...res.data.messages].reverse();
      setMessages((prev) => {
        const known = new Set(prev.map((m) => m.id));
        const toPrepend = asc.filter((m) => !known.has(m.id));
        return [...toPrepend, ...prev];
      });
      oldestPageRef.current = nextPage;
      setHasMoreOlder(res.data.pagination.has_next);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les anciens messages'));
    } finally {
      setLoadingOlder(false);
    }
  };

  // Interlocuteur : d'abord via /conversations/:id, sinon déduit des messages
  const derived = messages.find((m) => m.sender_id !== user?.id);
  const headerUser = participant
    ? { id: participant.user_id, display_name: participant.display_name, avatar_url: participant.avatar_url }
    : derived
      ? { id: derived.sender_id, display_name: derived.display_name, avatar_url: derived.avatar_url }
      : null;

  if (authLoading || !user) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-lg) 0', maxWidth: '700px' }}>
      <div className="mb-md"><BackButton fallbackHref="/messages" /></div>

      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '72vh' }}>
        {/* En-tête */}
        <div className="flex items-center gap-sm p-md" style={{ borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          {headerUser ? (
            <Link href={`/users/${headerUser.id}`} className="flex items-center gap-sm" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Avatar src={headerUser.avatar_url} name={headerUser.display_name} size={40} />
              <span className="font-bold">{headerUser.display_name || 'Utilisateur'}</span>
            </Link>
          ) : (
            <span className="font-bold">Conversation</span>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-col gap-sm p-md" style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <p className="text-muted text-sm text-center animate-pulse">Chargement des messages…</p>
          ) : error && messages.length === 0 ? (
            <p className="text-sm text-center" style={{ color: 'red' }}>{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-muted text-sm text-center" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              Aucun message. Écrivez le premier !
            </p>
          ) : (
            <>
              {hasMoreOlder && (
                <div className="flex justify-center" style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <button
                    type="button"
                    onClick={handleLoadOlder}
                    disabled={loadingOlder}
                    className="text-primary text-sm"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {loadingOlder ? 'Chargement…' : 'Voir les messages plus anciens'}
                  </button>
                </div>
              )}
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} isMine={m.sender_id === user.id} />
              ))}
            </>
          )}
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="flex gap-sm items-center p-md" style={{ borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrire un message…"
            maxLength={5000}
            style={{ flex: 1, minWidth: 0 }}
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            aria-label="Envoyer"
            className="hover-lift"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--spacing-sm)',
              opacity: !content.trim() || sending ? 0.5 : 1,
              cursor: !content.trim() || sending ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {error && messages.length > 0 && (
        <p className="text-sm text-center" style={{ color: 'red', marginTop: 'var(--spacing-sm)' }}>{error}</p>
      )}
    </div>
  );
}
