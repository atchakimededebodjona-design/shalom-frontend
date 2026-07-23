'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { bibleService } from '../../../../../../services/bible.service';
import { getSelectedVersion, setSelectedVersion } from '../../../../../../utils/bibleVersion';
import styles from '../../../../../../components/shared/panel.module.css';

export default function BibleChapterPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId;
  const chapterNumber = parseInt(params.chapter, 10);

  const [books, setBooks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [version, setVersion] = useState(getSelectedVersion());
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    bibleService.listBooks().then((res) => setBooks(res.data.books || [])).catch(() => {});
    bibleService.listVersions().then((res) => setVersions(res.data.versions || [])).catch(() => {});
  }, []);

  const handleVersionChange = (code) => {
    setVersion(code);
    setSelectedVersion(code);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    bibleService.getChapter(bookId, chapterNumber, version)
      .then((res) => { if (active) setChapterData(res.data); })
      .catch(() => { if (active) setError('Chapitre introuvable.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookId, chapterNumber, version]);

  useEffect(() => {
    if (!chapterData || typeof window === 'undefined' || !window.location.hash) return;
    const el = document.getElementById(window.location.hash.slice(1));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [chapterData]);

  const currentBook = books.find((b) => b.id === bookId);

  const { prevHref, nextHref } = useMemo(() => {
    if (!currentBook || books.length === 0) return { prevHref: null, nextHref: null };

    let prev = null;
    if (chapterNumber > 1) {
      prev = `/spiritual/bible/${bookId}/${chapterNumber - 1}`;
    } else {
      const prevBook = books.find((b) => b.book_order === currentBook.book_order - 1);
      if (prevBook) prev = `/spiritual/bible/${prevBook.id}/${prevBook.chapter_count}`;
    }

    let next = null;
    if (chapterNumber < currentBook.chapter_count) {
      next = `/spiritual/bible/${bookId}/${chapterNumber + 1}`;
    } else {
      const nextBook = books.find((b) => b.book_order === currentBook.book_order + 1);
      if (nextBook) next = `/spiritual/bible/${nextBook.id}/1`;
    }

    return { prevHref: prev, nextHref: next };
  }, [currentBook, books, bookId, chapterNumber]);

  return (
    <div>
      <Link href="/spiritual/bible" className={styles.iconBtn} style={{ marginBottom: 'var(--spacing-md)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={16} /> Livres
      </Link>

      <div className={styles.filters}>
        {versions.length > 0 && (
          <select
            className={styles.select}
            style={{ width: 140 }}
            value={version}
            onChange={(e) => handleVersionChange(e.target.value)}
          >
            {versions.map((v) => <option key={v.code} value={v.code}>{v.name}</option>)}
          </select>
        )}
        <select
          className={styles.select}
          style={{ flex: 1, minWidth: 160 }}
          value={bookId}
          onChange={(e) => router.push(`/spiritual/bible/${e.target.value}/1`)}
        >
          {books.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {currentBook && (
          <select
            className={styles.select}
            style={{ width: 100 }}
            value={chapterNumber}
            onChange={(e) => router.push(`/spiritual/bible/${bookId}/${e.target.value}`)}
          >
            {Array.from({ length: currentBook.chapter_count }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <p className={styles.empty}>Chargement...</p>
      ) : error ? (
        <p className={styles.errorMsg}>{error}</p>
      ) : (
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <h2>{chapterData.book.name} {chapterData.chapter_number}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {chapterData.verses.map((v) => (
              <p key={v.verse_number} id={`v${v.verse_number}`} className={styles.verseText} style={{ fontStyle: 'normal', fontSize: '1.05rem' }}>
                <sup style={{ color: 'var(--primary)', fontWeight: 700, marginRight: 4 }}>{v.verse_number}</sup>
                {v.text}
              </p>
            ))}
          </div>

          <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: 'var(--spacing-xl)' }}>
            {prevHref ? (
              <Link href={prevHref} className={styles.iconBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ChevronLeft size={18} /> Précédent
              </Link>
            ) : <span />}
            {nextHref ? (
              <Link href={nextHref} className={styles.iconBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Suivant <ChevronRight size={18} />
              </Link>
            ) : <span />}
          </div>
        </div>
      )}
    </div>
  );
}
