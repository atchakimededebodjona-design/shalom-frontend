'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { VISIBILITY_LABELS } from '../../services/groups.service';

export const GroupCard = ({ group }) => {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="glass hover-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        color: 'inherit',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        style={{
          height: '110px',
          background: group.cover_url
            ? `center / cover no-repeat url(${group.cover_url})`
            : 'var(--gradient-primary)',
        }}
      />
      <div className="p-lg flex-col gap-sm" style={{ flex: 1, display: 'flex' }}>
        <div className="flex items-center justify-between gap-sm">
          <h3 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-heading)' }}>
            {group.name}
          </h3>
          <span
            className="text-sm font-bold"
            style={{
              flexShrink: 0,
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem'
            }}
          >
            {VISIBILITY_LABELS[group.visibility] || group.visibility}
          </span>
        </div>
        {group.description && (
          <p
            className="text-muted text-sm"
            style={{
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}
          >
            {group.description}
          </p>
        )}
        <div className="flex items-center gap-xs text-muted text-sm" style={{ marginTop: 'auto', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--border-color)' }}>
          <Users size={16} color="var(--primary)" />
          <span style={{ fontWeight: 600 }}>{group.members_count} membre{group.members_count > 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
};
