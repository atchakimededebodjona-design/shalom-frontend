'use client';

import { timeAgo } from '../../utils/date';

// message : { id, sender_id, content, media_url, created_at, display_name, avatar_url }
export const MessageBubble = ({ message, isMine }) => {
  return (
    <div
      className="flex-col"
      style={{
        alignItems: isMine ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '75%',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-lg)',
          borderBottomRightRadius: isMine ? 'var(--radius-xs, 4px)' : 'var(--radius-lg)',
          borderBottomLeftRadius: isMine ? 'var(--radius-lg)' : 'var(--radius-xs, 4px)',
          backgroundColor: isMine ? 'var(--primary)' : 'var(--bg-color-alt)',
          color: isMine ? 'var(--on-primary)' : 'var(--text-color)',
          border: isMine ? 'none' : '1px solid var(--border-color)',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {message.content}
        {message.media_url && (
          <div style={{ marginTop: message.content ? 'var(--spacing-sm)' : 0 }}>
            <a
              href={message.media_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: isMine ? 'var(--on-primary)' : 'var(--primary)', textDecoration: 'underline', fontSize: '0.875rem' }}
            >
              Pièce jointe
            </a>
          </div>
        )}
      </div>
      <span className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px', padding: '0 var(--spacing-xs)' }}>
        {timeAgo(message.created_at)}
      </span>
    </div>
  );
};
