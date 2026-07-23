'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, BookOpen } from 'lucide-react';
import { bibleService } from '../../../../services/bible.service';
import { getApiError } from '../../../../utils/apiError';
import { getSelectedVersion, setSelectedVersion } from '../../../../utils/bibleVersion';
import styles from '../../../../components/shared/panel.module.css';

import pageStyles from './bible.module.css';

export default function BiblePage() {
  const [books, setBooks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [versionsError, setVersionsError] = useState('');
  const [version, setVersion] = useState(getSelectedVersion());
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
    bibleService.listVersions()
      .then((res) => setVersions(res.data.versions || []))
      .catch((err) => setVersionsError(getApiError(err, 'Erreur inconnue')));
  }, []);

  const handleVersionChange = (code) => {
    setVersion(code);
    setSelectedVersion(code);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const res = await bibleService.search(q, version);
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
    <div className={pageStyles.bookGrid}>
      {list.map((b) => (
        <Link
          key={b.id}
          href={`/spiritual/bible/${b.id}/1`}
          className={pageStyles.bookPill}
        >
          {b.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in">
      {versionsError && <p className={styles.errorMsg}>Versions : {versionsError}</p>}
      
      <div className={pageStyles.searchContainer}>
        <form onSubmit={handleSearch} className={pageStyles.searchForm}>
          {versions.length > 0 && (
            <select
              value={version}
              onChange={(e) => handleVersionChange(e.target.value)}
            >
              {versions.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
            </select>
          )}
          <div className={pageStyles.searchInputWrapper}>
            <Search size={20} className={pageStyles.searchIcon} />
            <input
              className={pageStyles.searchInput}
              type="text"
              placeholder="Rechercher un mot, une expression..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className={pageStyles.searchBtn} disabled={searching}>
            {searching ? 'Recherche...' : 'Rechercher'}
          </button>
          {results && (
            <button type="button" className={pageStyles.searchBtn} style={{ background: 'var(--bg-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }} onClick={() => { setResults(null); setQuery(''); }}>
              Effacer
            </button>
          )}
        </form>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      {results ? (
        <div className={pageStyles.card}>
          <div className={pageStyles.sectionHead}>
            <h3>Résultats ({results.length})</h3>
          </div>
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
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
           <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--bg-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
        </div>
      ) : (
        <>
          <div className={pageStyles.card}>
            <div className={pageStyles.sectionHead}>
              <h3>Ancien Testament</h3>
            </div>
            {renderBookGrid(oldTestament)}
          </div>
          
          <div className={pageStyles.card}>
            <div className={pageStyles.sectionHead}>
              <h3>Nouveau Testament</h3>
            </div>
            {renderBookGrid(newTestament)}
          </div>
        </>
      )}
    </div>
  );
}
