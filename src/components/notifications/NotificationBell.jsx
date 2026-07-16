'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsService } from '../../services/notifications.service';
import { NotificationItem } from './NotificationItem';

const POLL_MS = 30000;

export const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsService.getUnreadCount();
      setUnreadCount(res.data.unread_count);
    } catch {
      /* silencieux */
    }
  }, []);

  // Polling du compteur de non-lus
  useEffect(() => {
    if (!user) return undefined;
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, POLL_MS);
    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  // Chargement de la liste à l'ouverture
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsService.list({ page: 1, limit: 8 });
      setNotifications(res.data.notifications);
    } catch {
      /* silencieux */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open, loadNotifications]);

  // Fermeture au clic extérieur / Échap
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      /* silencieux */
    }
  };

  if (!user) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="hover-lift"
        style={{ position: 'relative', display: 'flex', background: 'transparent', border: 'none', color: 'var(--text-color)', padding: 'var(--spacing-xs)' }}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#e0245e',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="glass animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 'min(360px, calc(100vw - 2rem))',
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-color-alt)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 60,
            overflow: 'hidden',
          }}
        >
          <div className="flex items-center justify-between p-md" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span className="font-bold">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="flex items-center gap-xs text-primary text-sm"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <CheckCheck size={15} /> Tout lire
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto' }}>
            {loading ? (
              <p className="text-muted text-sm text-center animate-pulse" style={{ padding: 'var(--spacing-md)' }}>Chargement…</p>
            ) : notifications.length === 0 ? (
              <p className="text-muted text-sm text-center" style={{ padding: 'var(--spacing-lg)' }}>Aucune notification</p>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={handleRead} onNavigate={() => setOpen(false)} />
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-primary text-sm text-center hover-lift"
            style={{ display: 'block', padding: 'var(--spacing-sm)', borderTop: '1px solid var(--border-color)', fontWeight: 'bold', textDecoration: 'none' }}
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
};
