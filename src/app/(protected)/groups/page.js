'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { groupsService } from '../../../services/groups.service';
import { getApiError } from '../../../utils/apiError';
import { GroupCard } from '../../../components/groups/GroupCard';
import { CreateGroupForm } from '../../../components/groups/CreateGroupForm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { BackButton } from '../../../components/ui/BackButton';

const PAGE_SIZE = 12;

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const fetchPage = useCallback(
    async (page, search) => {
      const res = await groupsService.list({ page, limit: PAGE_SIZE, search: search || undefined });
      return res.data;
    },
    []
  );

  const loadFirst = useCallback(
    async (search) => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchPage(1, search);
        setGroups(data.groups);
        setPagination(data.pagination);
      } catch (err) {
        setError(getApiError(err, 'Impossible de charger les groupes'));
      } finally {
        setLoading(false);
      }
    },
    [fetchPage]
  );

  useEffect(() => {
    if (user) loadFirst(activeSearch);
  }, [user, activeSearch, loadFirst]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearch(searchInput.trim());
  };

  const handleLoadMore = async () => {
    if (!pagination?.has_next || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(pagination.page + 1, activeSearch);
      setGroups((prev) => {
        const seen = new Set(prev.map((g) => g.id));
        return [...prev, ...data.groups.filter((g) => !seen.has(g.id))];
      });
      setPagination(data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger plus'));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreated = (group) => {
    setShowCreate(false);
    // Redirige vers le nouveau groupe (l'utilisateur en est admin)
    router.push(`/groups/${group.id}`);
  };

  if (authLoading || !user) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md">
        <BackButton fallbackHref="/dashboard" />
      </div>

      <div className="flex items-center justify-between gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
        <h1 className="text-primary" style={{ margin: 0 }}>Groupes</h1>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <span className="flex items-center gap-xs"><Plus size={18} /> Créer un groupe</span>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-sm items-center mb-lg">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher un groupe par nom…"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
        <Button type="submit" variant="secondary">Rechercher</Button>
      </form>

      {activeSearch && (
        <p className="text-muted text-sm mb-md">
          Résultats pour « {activeSearch} »{' '}
          <button
            type="button"
            onClick={() => { setSearchInput(''); setActiveSearch(''); }}
            className="text-primary"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            (effacer)
          </button>
        </p>
      )}

      {loading ? (
        <div className="glass p-lg text-center text-muted animate-pulse" style={{ borderRadius: 'var(--radius-md)' }}>
          Chargement des groupes…
        </div>
      ) : error && groups.length === 0 ? (
        <div className="glass p-lg text-center" style={{ borderRadius: 'var(--radius-md)', color: 'red' }}>{error}</div>
      ) : groups.length === 0 ? (
        <div className="glass p-lg text-center text-muted" style={{ borderRadius: 'var(--radius-md)' }}>
          {activeSearch ? 'Aucun groupe ne correspond à cette recherche.' : 'Aucun groupe public pour le moment. Créez le premier !'}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-md)' }}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {error && <p className="text-sm text-center" style={{ color: 'red', marginTop: 'var(--spacing-md)' }}>{error}</p>}

          {pagination?.has_next && (
            <div className="flex justify-center" style={{ marginTop: 'var(--spacing-lg)' }}>
              <Button variant="secondary" onClick={handleLoadMore} isLoading={loadingMore}>Charger plus</Button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Créer un groupe" maxWidth="520px">
        <CreateGroupForm onCreated={handleCreated} onCancel={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
