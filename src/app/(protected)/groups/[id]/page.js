'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Pencil, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { groupsService, VISIBILITY_LABELS } from '../../../../services/groups.service';
import { getApiError } from '../../../../utils/apiError';
import { MemberRow } from '../../../../components/groups/MemberRow';
import { GroupEditForm } from '../../../../components/groups/GroupEditForm';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { BackButton } from '../../../../components/ui/BackButton';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersPagination, setMembersPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const refresh = useCallback(
    async (withSpinner = false) => {
      if (withSpinner) setLoading(true);
      try {
        const [gRes, mRes] = await Promise.all([
          groupsService.getById(id),
          groupsService.getMembers(id, { limit: 50 }),
        ]);
        setGroup(gRes.data.group);
        setMembers(mRes.data.members);
        setMembersPagination(mRes.data.pagination);
        setError('');
      } catch (err) {
        setError(getApiError(err, 'Groupe introuvable'));
      } finally {
        if (withSpinner) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (user && id) refresh(true);
  }, [user, id, refresh]);

  const currentUserId = user?.id;
  const isOwner = group && group.created_by === currentUserId;
  const myMember = members.find((m) => m.profile?.user_id === currentUserId);
  const isMember = !!myMember || isOwner;
  const isAdmin = isOwner || myMember?.role === 'admin';

  const handleJoin = async () => {
    setBusy(true);
    setActionError('');
    try {
      const res = await groupsService.join(id);
      if (res.data.status === 'actif') {
        await refresh();
      } else {
        setPendingRequest(true); // groupe privé → demande en attente
      }
    } catch (err) {
      setActionError(getApiError(err, 'Impossible de rejoindre'));
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Quitter ce groupe ?')) return;
    setBusy(true);
    setActionError('');
    try {
      await groupsService.removeMember(id, currentUserId);
      await refresh();
    } catch (err) {
      setActionError(getApiError(err, 'Impossible de quitter le groupe'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement ce groupe ?')) return;
    setBusy(true);
    setActionError('');
    try {
      await groupsService.remove(id);
      router.push('/groups');
    } catch (err) {
      setActionError(getApiError(err, 'Suppression impossible'));
      setBusy(false);
    }
  };

  const handleLoadMoreMembers = async () => {
    if (!membersPagination?.has_next) return;
    try {
      const mRes = await groupsService.getMembers(id, { page: membersPagination.page + 1, limit: 50 });
      setMembers((prev) => {
        const seen = new Set(prev.map((m) => m.profile?.user_id));
        return [...prev, ...mRes.data.members.filter((m) => !seen.has(m.profile?.user_id))];
      });
      setMembersPagination(mRes.data.pagination);
    } catch (err) {
      setActionError(getApiError(err, 'Impossible de charger plus de membres'));
    }
  };

  if (authLoading || !user || (loading && !group)) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
        <div className="mb-md"><BackButton fallbackHref="/groups" /></div>
        <div className="glass p-lg text-center" style={{ borderRadius: 'var(--radius-md)', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md"><BackButton fallbackHref="/groups" /></div>

      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--spacing-lg)' }}>
        <div
          style={{
            height: '160px',
            background: group.cover_url
              ? `center / cover no-repeat url(${group.cover_url})`
              : 'linear-gradient(120deg, var(--primary), var(--secondary))',
          }}
        />
        <div className="p-lg flex-col gap-sm">
          <div className="flex items-center justify-between gap-md" style={{ flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>{group.name}</h1>
            <span
              className="text-sm"
              style={{ backgroundColor: 'var(--bg-color-alt)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.15rem 0.7rem', borderRadius: 'var(--radius-full)' }}
            >
              {VISIBILITY_LABELS[group.visibility] || group.visibility}
            </span>
          </div>

          <div className="flex items-center gap-xs text-muted text-sm">
            <Users size={16} />
            <span>{group.members_count} membre{group.members_count > 1 ? 's' : ''}</span>
          </div>

          {group.description && <p style={{ whiteSpace: 'pre-wrap' }}>{group.description}</p>}

          {actionError && <p className="text-sm" style={{ color: 'red' }}>{actionError}</p>}

          {/* Actions */}
          <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap', marginTop: 'var(--spacing-xs)' }}>
            {!isMember && !pendingRequest && (
              <Button variant="primary" onClick={handleJoin} isLoading={busy}>Rejoindre</Button>
            )}
            {pendingRequest && (
              <span className="text-muted text-sm" style={{ fontStyle: 'italic' }}>Demande envoyée — en attente d'approbation</span>
            )}
            {isMember && !isOwner && (
              <Button variant="secondary" onClick={handleLeave} isLoading={busy}>
                <span className="flex items-center gap-xs"><LogOut size={16} /> Quitter</span>
              </Button>
            )}
            {isAdmin && (
              <Button variant="secondary" onClick={() => setShowEdit(true)}>
                <span className="flex items-center gap-xs"><Pencil size={16} /> Modifier</span>
              </Button>
            )}
            {isAdmin && (
              <Button variant="secondary" onClick={handleDelete} isLoading={busy}>
                <span className="flex items-center gap-xs" style={{ color: 'red' }}><Trash2 size={16} /> Supprimer</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Membres */}
      <div className="glass p-lg" style={{ borderRadius: 'var(--radius-md)' }}>
        <h2 className="mb-md" style={{ fontSize: '1.2rem' }}>Membres</h2>
        <div className="flex-col gap-md">
          {members.map((member) => (
            <MemberRow
              key={member.profile?.user_id}
              member={member}
              groupId={id}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onChanged={() => refresh()}
              onError={setActionError}
            />
          ))}
        </div>
        {membersPagination?.has_next && (
          <div className="flex justify-center" style={{ marginTop: 'var(--spacing-md)' }}>
            <Button variant="secondary" onClick={handleLoadMoreMembers}>Charger plus de membres</Button>
          </div>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le groupe" maxWidth="520px">
        <GroupEditForm
          group={group}
          onSaved={() => { setShowEdit(false); refresh(); }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  );
}
