'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { profilesService } from '../../../../services/profiles.service';
import { Avatar } from '../../../../components/ui/Avatar';
import styles from './conseillers.module.css';

// Recherche live d'un membre SHALOM existant par son nom d'affichage
// (réutilise GET /profiles/search, déjà utilisé par la page /search).
export const MemberPicker = ({ selected, onSelect }) => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const q = input.trim();
    if (!q) {
      setResults([]);
      return undefined;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await profilesService.search(q, { page: 1, limit: 8 });
        setResults(res.data.profiles);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const pick = (profile) => {
    onSelect(profile);
    setInput('');
    setResults([]);
    setOpen(false);
  };

  if (selected) {
    return (
      <div className={styles.selectedMember}>
        <Avatar src={selected.avatar_url} name={selected.display_name} size={40} />
        <div className="info">
          <div className={styles.memberName}>{selected.display_name}</div>
          {(selected.city || selected.country) && (
            <div className="text-muted text-sm">{[selected.city, selected.country].filter(Boolean).join(', ')}</div>
          )}
        </div>
        <button type="button" className={styles.iconBtn} onClick={() => onSelect(null)}>
          <X size={14} /> Changer
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className={styles.memberBox}>
      <input
        className={styles.input}
        placeholder="Rechercher un membre par son nom…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <div className={styles.dropdown}>
          {loading && <div className={styles.dropdownItem}>Recherche…</div>}
          {!loading && input.trim() && results.length === 0 && (
            <div className={styles.dropdownItem}>Aucun membre trouvé.</div>
          )}
          {results.map((p) => (
            <button key={p.user_id} type="button" className={styles.dropdownItem} onClick={() => pick(p)}>
              <Avatar src={p.avatar_url} name={p.display_name} size={28} />
              <span>{p.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
