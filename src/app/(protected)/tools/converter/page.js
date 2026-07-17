'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowLeftRight, History } from 'lucide-react';
import { toolsService } from '../../../../services/tools.service';
import styles from '../../../../components/shared/panel.module.css';

export default function ConverterPage() {
  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [value, setValue] = useState('1');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    const h = await toolsService.conversionHistory();
    setHistory(h.data.history);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await toolsService.listUnits();
        const cats = res.data.categories;
        setCategories(cats);
        if (cats.length > 0) {
          setCatId(cats[0].id);
          setFromId(cats[0].units[0]?.id || '');
          setToId(cats[0].units[1]?.id || cats[0].units[0]?.id || '');
        }
        await loadHistory();
      } catch (err) {
        setError(err.response?.data?.error || 'Chargement impossible.');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadHistory]);

  const cat = categories.find((c) => c.id === catId);
  const units = cat?.units || [];

  const changeCategory = (id) => {
    setCatId(id);
    const c = categories.find((x) => x.id === id);
    setFromId(c?.units[0]?.id || '');
    setToId(c?.units[1]?.id || c?.units[0]?.id || '');
    setResult(null);
  };

  const swap = () => { setFromId(toId); setToId(fromId); setResult(null); };

  // Conversion à la volée : le serveur fait le calcul (et mémorise la paire).
  useEffect(() => {
    if (!fromId || !toId || value === '' || Number.isNaN(Number(value))) { setResult(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await toolsService.convert({ from_unit_id: fromId, to_unit_id: toId, value: Number(value) });
        if (!cancelled) { setResult(res.data.conversion); setError(''); }
      } catch (err) {
        if (!cancelled) { setResult(null); setError(err.response?.data?.error || 'Conversion impossible.'); }
      }
    }, 350); // léger debounce pour ne pas appeler à chaque frappe
    return () => { cancelled = true; clearTimeout(t); };
  }, [fromId, toId, value]);

  if (loading) return <p className="animate-pulse text-muted">Chargement…</p>;

  const symbolOf = (id) => units.find((u) => u.id === id)?.symbol || '';

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      <div className={styles.card}>
        <div className={styles.filters}>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => changeCategory(c.id)}
              className={c.id === catId ? styles.badgePrimary : styles.badge}
              style={{ cursor: 'pointer', padding: '6px 14px', fontSize: '0.85rem' }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="c-value">Valeur</label>
            <input id="c-value" className={styles.input} type="number" value={value}
              onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="c-from">De</label>
            <select id="c-from" className={styles.select} value={fromId} onChange={(e) => { setFromId(e.target.value); setResult(null); }}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
          <div className={`${styles.field} ${styles.full}`} style={{ alignItems: 'center' }}>
            <button onClick={swap} className={styles.iconBtn} aria-label="Inverser les unités" title="Inverser">
              <ArrowLeftRight size={18} />
            </button>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="c-to">Vers</label>
            <select id="c-to" className={styles.select} value={toId} onChange={(e) => { setToId(e.target.value); setResult(null); }}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Résultat</label>
            <div className={styles.result}>
              {result ? `${Number(result.result.toPrecision(12))} ${symbolOf(toId)}` : '—'}
            </div>
          </div>
        </div>

        {result && (
          <p className="text-sm text-muted" style={{ margin: 0 }}>
            {result.value} {result.from.symbol} = {Number(result.result.toPrecision(12))} {result.to.symbol} · {result.category}
          </p>
        )}
        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        {cat?.name === 'Devise' && (
          <p className="text-sm text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>
            💱 Seule la parité EUR ↔ XOF est disponible : elle est fixe (1 EUR = 655,957 XOF).
            Les devises à taux flottant nécessitent une source de taux à jour.
          </p>
        )}
      </div>

      {history.length > 0 && (
        <div className={styles.card}>
          <div className={styles.sectionHead}><h3 className="flex items-center gap-sm"><History size={18} /> Conversions fréquentes</h3></div>
          <div className={styles.list}>
            {history.map((h, i) => (
              <div key={`${h.from.id}-${h.to.id}-${i}`} className={styles.row} style={{ padding: 'var(--spacing-sm) 0' }}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTitle}>{h.from.name} → {h.to.name}</div>
                  <div className={styles.rowMeta}>{h.from.symbol} → {h.to.symbol}</div>
                </div>
                <span className={styles.badge}>{h.used_count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
