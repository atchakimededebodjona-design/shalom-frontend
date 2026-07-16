'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { profilesService } from '../../../services/profiles.service';
import { getApiError } from '../../../utils/apiError';
import { Avatar } from '../../../components/ui/Avatar';
import { FollowButton } from '../../../components/follows/FollowButton';
import { Button } from '../../../components/ui/Button';
import { BackButton } from '../../../components/ui/BackButton';

const PAGE_SIZE = 20;

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Debounce de la saisie → terme de recherche effectif
  useEffect(() => {
    const t = setTimeout(() => setQuery(input.trim()), 350);
    return () => clearTimeout(t);
  }, [input]);

  const runSearch = useCallback(
    async (q) => {
      setLoading(true);
      setError('');
      try {
        const res = await profilesService.search(q, { page: 1, limit: PAGE_SIZE });
        setResults(res.data.profiles);
        setPagination(res.data.pagination);
      } catch (err) {
        setError(getApiError(err, 'Recherche impossible'));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!user) return;
    if (!query) {
      setResults([]);
      setPagination(null);
      setError('');
      return;
    }
    runSearch(query);
  }, [query, user, runSearch]);

  const handleLoadMore = async () => {
    if (!pagination?.has_next || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await profilesService.search(query, { page: pagination.page + 1, limit: PAGE_SIZE });
      setResults((prev) => {
        const seen = new Set(prev.map((p) => p.user_id));
        return [...prev, ...res.data.profiles.filter((p) => !seen.has(p.user_id))];
      });
      setPagination(res.data.pagination);
    } catch (err) {
      setError(getApiError(err, 'Impossible de charger plus'));
    } finally {
      setLoadingMore(false);
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

      <h1 className="text-primary mb-lg flex items-center gap-sm">
        <Search size={26} /> Rechercher des membres
      </h1>

      <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nom d'un membre…"
          autoFocus
          style={{ width: '100%', paddingLeft: '2.5rem' }}
        />
      </div>

      {!query ? (
        <p className="text-muted text-center py-md">Tapez un nom pour trouver des membres à suivre ou à contacter.</p>
      ) : loading ? (
        <div className="glass p-lg text-center text-muted animate-pulse" style={{ borderRadius: 'var(--radius-md)' }}>Recherche…</div>
      ) : error ? (
        <div className="glass p-lg text-center" style={{ borderRadius: 'var(--radius-md)', color: 'red' }}>{error}</div>
      ) : results.length === 0 ? (
        <div className="glass p-lg text-center text-muted" style={{ borderRadius: 'var(--radius-md)' }}>
          Aucun membre ne correspond à « {query} ».
        </div>
      ) : (
        <div className="flex-col gap-sm">
          {results.map((p) => {
            const subtitle = [p.city, p.country].filter(Boolean).join(', ');
            return (
              <div
                key={p.user_id}
                className="glass flex items-center justify-between gap-md p-md"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                <Link href={`/users/${p.user_id}`} className="flex items-center gap-sm" style={{ minWidth: 0, flex: 1, color: 'inherit', textDecoration: 'none' }}>
                  <Avatar src={p.avatar_url} name={p.display_name} size={44} />
                  <span style={{ minWidth: 0 }}>
                    <span className="font-bold" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.display_name}
                    </span>
                    {subtitle && <span className="text-muted text-sm">{subtitle}</span>}
                  </span>
                </Link>
                <FollowButton userId={p.user_id} size="sm" />
              </div>
            );
          })}

          {pagination?.has_next && (
            <div className="flex justify-center" style={{ marginTop: 'var(--spacing-md)' }}>
              <Button variant="secondary" onClick={handleLoadMore} isLoading={loadingMore}>Charger plus</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
