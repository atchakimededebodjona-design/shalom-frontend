'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, CalendarClock, Users2 } from 'lucide-react';
import { communityService } from '../../../services/community.service';
import styles from '../../../components/shared/panel.module.css';

const CATEGORIES = [
  { v: '', l: 'Toutes' },
  { v: 'cellule_priere', l: '🙏 Cellules de prière' },
  { v: 'etude_biblique', l: '📖 Études bibliques' },
  { v: 'jeunesse', l: '🎉 Jeunesse' },
  { v: 'autre', l: '📌 Autres' },
];
const CAT_LABEL = {
  cellule_priere: 'Cellule de prière',
  etude_biblique: 'Étude biblique',
  jeunesse: 'Jeunesse',
  autre: 'Autre',
};

export default function DirectoryPage() {
  const [groups, setGroups] = useState([]);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 50 };
      if (category) params.category = category;
      if (search.trim()) params.search = search.trim();
      const res = await communityService.directory(params);
      setGroups(res.data.groups);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  // Léger debounce sur la recherche pour ne pas appeler à chaque frappe.
  useEffect(() => {
    const t = setTimeout(() => { reload(); }, 300);
    return () => clearTimeout(t);
  }, [reload]);

  return (
    <div>
      <p className="text-muted text-sm mb-md" style={{ marginTop: 0 }}>
        Trouvez une cellule de prière ou un groupe près de chez vous.
      </p>

      <div className={styles.filters}>
        {CATEGORIES.map((c) => (
          <button
            key={c.v}
            onClick={() => setCategory(c.v)}
            className={c.v === category ? styles.badgePrimary : styles.badge}
            style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.85rem' }}
          >
            {c.l}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <span className="flex items-center gap-xs" style={{ minWidth: 220 }}>
          <Search size={16} className="text-muted" />
          <input className={styles.input} value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un groupe…" />
        </span>
      </div>

      {error && <p className={styles.errorMsg} role="alert">{error}</p>}

      {loading ? (
        <p className="animate-pulse text-muted">Chargement…</p>
      ) : groups.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          <Users2 size={28} style={{ opacity: 0.5 }} />
          <p>Aucun groupe dans l'annuaire pour cette recherche.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {groups.map((g) => (
            <div key={g.id} className={styles.card}>
              <div className={styles.sectionHead}>
                <h3 style={{ fontSize: '1.05rem' }}>{g.name}</h3>
                {g.group_category && <span className={styles.badgePrimary}>{CAT_LABEL[g.group_category]}</span>}
              </div>
              {g.description && (
                <p className="text-sm text-muted" style={{ marginTop: 0 }}>{g.description}</p>
              )}
              <div className="flex-col gap-xs text-sm text-muted" style={{ display: 'flex' }}>
                {g.meeting_schedule && (
                  <span className="flex items-center gap-xs"><CalendarClock size={14} /> {g.meeting_schedule}</span>
                )}
                {g.location_info && (
                  <span className="flex items-center gap-xs"><MapPin size={14} /> {g.location_info}</span>
                )}
                <span className="flex items-center gap-xs"><Users2 size={14} /> {g.members_count} membre(s)</span>
              </div>
              <div className={styles.actions} style={{ marginTop: 'var(--spacing-md)' }}>
                <Link href={`/groups/${g.id}`} className="text-sm text-primary font-bold">Voir le groupe →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
