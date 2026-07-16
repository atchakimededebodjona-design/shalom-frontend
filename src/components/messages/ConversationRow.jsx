'use client';

import Link from 'next/link';
import { Avatar } from '../ui/Avatar';
import { timeAgo } from '../../utils/date';

// conversation : { id, is_group, last_message_content, last_message_date, unread_count, other_participants: [] }
export const ConversationRow = ({ conversation }) => {
  const others = conversation.other_participants || [];
  const primary = others[0] || {};
  const title = conversation.is_group
    ? others.map((p) => p.display_name).filter(Boolean).join(', ') || 'Groupe'
    : primary.display_name || 'Utilisateur';

  const hasUnread = conversation.unread_count > 0;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-md hover-lift"
      style={{
        color: 'inherit',
        textDecoration: 'none',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        backgroundColor: hasUnread ? 'var(--bg-color-alt)' : 'transparent',
      }}
    >
      <Avatar src={primary.avatar_url} name={title} size={48} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center justify-between gap-sm">
          <span className="font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </span>
          {conversation.last_message_date && (
            <span className="text-muted text-sm" style={{ flexShrink: 0 }}>{timeAgo(conversation.last_message_date)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-sm">
          <span
            className="text-sm"
            style={{
              color: hasUnread ? 'var(--text-color)' : 'var(--text-muted)',
              fontWeight: hasUnread ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
              minWidth: 0,
            }}
          >
            {conversation.last_message_content || 'Aucun message'}
          </span>
          {hasUnread && (
            <span
              style={{
                flexShrink: 0,
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
