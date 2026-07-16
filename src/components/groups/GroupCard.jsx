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
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          height: '90px',
          background: group.cover_url
            ? `center / cover no-repeat url(${group.cover_url})`
            : 'linear-gradient(120deg, var(--primary), var(--secondary))',
        }}
      />
      <div className="p-md flex-col gap-xs" style={{ flex: 1 }}>
        <div className="flex items-center justify-between gap-sm">
          <h3 style={{ margin: 0, fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {group.name}
          </h3>
          <span
            className="text-sm"
            style={{
              flexShrink: 0,
              backgroundColor: 'var(--bg-color-alt)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '0.1rem 0.5rem',
              borderRadius: 'var(--radius-full)',
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
            }}
          >
            {group.description}
          </p>
        )}
        <div className="flex items-center gap-xs text-muted text-sm" style={{ marginTop: 'auto', paddingTop: 'var(--spacing-xs)' }}>
          <Users size={15} />
          <span>{group.members_count} membre{group.members_count > 1 ? 's' : ''}</span>
        </div>
      </div>
    </Link>
  );
};
