'use client';

import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, UserPlus, AtSign, Users, Info } from 'lucide-react';
import { notificationsService } from '../../services/notifications.service';
import { timeAgo } from '../../utils/date';
import { Avatar } from '../ui/Avatar';

// Métadonnées d'affichage par type de notification
const META = {
  like: { Icon: Heart, color: '#e0245e', text: (n) => `${n.actor_name || 'Quelqu\'un'} a aimé votre publication` },
  comment: { Icon: MessageCircle, color: 'var(--primary)', text: (n) => `${n.actor_name || 'Quelqu\'un'} a commenté votre publication` },
  follow: { Icon: UserPlus, color: 'var(--secondary)', text: (n) => `${n.actor_name || 'Quelqu\'un'} s'est abonné à vous` },
  mention: { Icon: AtSign, color: 'var(--primary)', text: (n) => `${n.actor_name || 'Quelqu\'un'} vous a mentionné` },
  groupe: { Icon: Users, color: 'var(--secondary)', text: (n) => `${n.actor_name || 'Quelqu\'un'} — activité dans un groupe` },
  systeme: { Icon: Info, color: 'var(--text-muted)', text: () => 'Notification système' },
};

export const NotificationItem = ({ notification, onRead, onNavigate }) => {
  const router = useRouter();
  const meta = META[notification.type] || META.systeme;
  const { Icon } = meta;
  const unread = !notification.is_read;

  const handleClick = async () => {
    if (unread) {
      try {
        await notificationsService.markAsRead(notification.id);
        onRead?.(notification.id);
      } catch {
        /* non bloquant */
      }
    }
    if (notification.type === 'follow' && notification.actor_id) {
      onNavigate?.();
      router.push(`/users/${notification.actor_id}`);
    } else if ((notification.type === 'like' || notification.type === 'comment') && notification.reference_id) {
      onNavigate?.();
      router.push(`/posts/${notification.reference_id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-sm hover-lift"
      style={{
        width: '100%',
        textAlign: 'left',
        background: unread ? 'var(--bg-color-alt)' : 'transparent',
        border: 'none',
        borderBottom: '1px solid var(--border-color)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar src={notification.actor_avatar} name={notification.actor_name} size={40} />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={11} color={meta.color} />
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-sm" style={{ margin: 0, whiteSpace: 'normal' }}>{meta.text(notification)}</p>
        <span className="text-muted" style={{ fontSize: '0.72rem' }}>{timeAgo(notification.created_at)}</span>
      </div>

      {unread && (
        <span
          aria-label="Non lue"
          style={{ flexShrink: 0, width: 9, height: 9, borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary)' }}
        />
      )}
    </button>
  );
};
