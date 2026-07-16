'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { notificationsService } from '../../../services/notifications.service';
import { getApiError } from '../../../utils/apiError';
import { NotificationItem } from '../../../components/notifications/NotificationItem';
import { Button } from '../../../components/ui/Button';
import { BackButton } from '../../../components/ui/BackButton';

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null); // { total, page, limit, pages }
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
      const res = await notificationsService.list({ page: 1, limit: PAGE_SIZE });
      setItems(res.data.notifications);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger les notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadFirst();
  }, [user, loadFirst]);

  const hasNext = pagination && pagination.page < pagination.pages;
  const hasUnread = items.some((n) => !n.is_read);

  const handleLoadMore = async () => {
    if (!hasNext || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await notificationsService.list({ page: pagination.page + 1, limit: PAGE_SIZE });
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...res.data.notifications.filter((n) => !seen.has(n.id))];
      });
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger plus'));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAll = async () => {
    try {
      await notificationsService.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError(getApiError(err, 'Action impossible'));
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

      <div className="flex items-center justify-between gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
        <h1 className="text-primary flex items-center gap-sm" style={{ margin: 0 }}>
          <Bell size={26} /> Notifications
        </h1>
        {hasUnread && (
          <Button variant="secondary" onClick={handleMarkAll}>
            <span className="flex items-center gap-xs"><CheckCheck size={16} /> Tout marquer comme lu</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="glass p-lg text-center text-muted animate-pulse" style={{ borderRadius: 'var(--radius-md)' }}>Chargement…</div>
      ) : error && items.length === 0 ? (
        <div className="glass p-lg text-center" style={{ borderRadius: 'var(--radius-md)', color: 'red' }}>{error}</div>
      ) : items.length === 0 ? (
        <div className="glass p-lg text-center text-muted" style={{ borderRadius: 'var(--radius-md)' }}>
          Aucune notification pour le moment.
        </div>
      ) : (
        <>
          <div className="glass" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {items.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={handleRead} />
            ))}
          </div>

          {error && <p className="text-sm text-center" style={{ color: 'red', marginTop: 'var(--spacing-md)' }}>{error}</p>}

          {hasNext && (
            <div className="flex justify-center" style={{ marginTop: 'var(--spacing-lg)' }}>
              <Button variant="secondary" onClick={handleLoadMore} isLoading={loadingMore}>Charger plus</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
