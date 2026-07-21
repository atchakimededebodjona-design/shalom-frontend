'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen } from 'lucide-react';
import { bibleService } from '../../../../services/bible.service';
import styles from '../../../../components/shared/panel.module.css';

export default function BiblePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    bibleService.listBooks()
      .then((res) => setBooks(res.data.books || []))
      .catch(() => setError('Impossible de charger la liste des livres.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const res = await bibleService.search(q);
      setResults(res.data.results || []);
    } catch {
      setError('La recherche a échoué.');
    } finally {
      setSearching(false);
    }
  };

  const oldTestament = books.filter((b) => b.testament === 'ancien');
  const newTestament = books.filter((b) => b.testament === 'nouveau');

  const renderBookGrid = (list) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
      {list.map((b) => (
        <Link
          key={b.id}
          href={`/spiritual/bible/${b.id}/1`}
          className={styles.badge}
          style={{ padding: '6px 12px', fontSize: '0.85rem', textDecoration: 'none' }}
        >
          {b.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSearch} className={styles.filters}>
        <input
          className={styles.input}
          style={{ flex: 1, minWidth: 200 }}
          type="text"
          placeholder="Rechercher un mot, une expression..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className={styles.iconBtn} disabled={searching}>
          <Search size={20} />
        </button>
        {results && (
          <button type="button" className={styles.iconBtn} onClick={() => { setResults(null); setQuery(''); }}>
            Effacer
          </button>
        )}
      </form>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {results ? (
        <div className={styles.card}>
          <div className={styles.sectionHead}><h3>Résultats ({results.length})</h3></div>
          {results.length === 0 ? (
            <p className={styles.empty}>Aucun verset trouvé.</p>
          ) : (
            <div className={styles.list}>
              {results.map((r, i) => (
                <Link
                  key={i}
                  href={`/spiritual/bible/${r.book_id}/${r.chapter_number}#v${r.verse_number}`}
                  className={styles.row}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={styles.rowIcon}><BookOpen size={18} /></div>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>{r.book_name} {r.chapter_number}:{r.verse_number}</div>
                    <div className={styles.rowMeta}>{r.text}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : loading ? (
        <p className={styles.empty}>Chargement...</p>
      ) : (
        <>
          <div className={styles.card} style={{ marginBottom: 'var(--spacing-md)' }}>
            <div className={styles.sectionHead}><h3>Ancien Testament</h3></div>
            {renderBookGrid(oldTestament)}
          </div>
          <div className={styles.card}>
            <div className={styles.sectionHead}><h3>Nouveau Testament</h3></div>
            {renderBookGrid(newTestament)}
          </div>
        </>
      )}
    </div>
  );
}
