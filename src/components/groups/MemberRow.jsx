'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserMinus } from 'lucide-react';
import { groupsService, ROLE_LABELS } from '../../services/groups.service';
import { getApiError } from '../../utils/apiError';
import { Avatar } from '../ui/Avatar';

const ROLE_OPTIONS = ['membre', 'moderateur', 'admin'];

export const MemberRow = ({ member, groupId, isAdmin, currentUserId, onChanged, onError }) => {
  const p = member.profile || {};
  const isSelf = p.user_id === currentUserId;
  const [busy, setBusy] = useState(false);

  const handleRole = async (e) => {
    const role = e.target.value;
    setBusy(true);
    try {
      await groupsService.updateMemberRole(groupId, p.user_id, role);
      onChanged?.();
    } catch (err) {
      onError?.(getApiError(err, 'Changement de rôle impossible'));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Retirer ${p.display_name || 'ce membre'} du groupe ?`)) return;
    setBusy(true);
    try {
      await groupsService.removeMember(groupId, p.user_id);
      onChanged?.();
    } catch (err) {
      onError?.(getApiError(err, 'Retrait impossible'));
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-md">
      <Link href={`/users/${p.user_id}`} className="flex items-center gap-sm" style={{ minWidth: 0, flex: 1, color: 'inherit', textDecoration: 'none' }}>
        <Avatar src={p.avatar_url} name={p.display_name} size={40} />
        <span style={{ minWidth: 0 }}>
          <span className="font-bold" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.display_name || 'Utilisateur'}
          </span>
          <span className="text-muted text-sm">{ROLE_LABELS[member.role] || member.role}</span>
        </span>
      </Link>

      {isAdmin && !isSelf && (
        <div className="flex items-center gap-sm" style={{ flexShrink: 0 }}>
          <select value={member.role} onChange={handleRole} disabled={busy} aria-label="Rôle du membre">
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            aria-label="Retirer le membre"
            title="Retirer"
            className="hover-lift"
            style={{ display: 'flex', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: 'var(--spacing-xs)' }}
          >
            <UserMinus size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
