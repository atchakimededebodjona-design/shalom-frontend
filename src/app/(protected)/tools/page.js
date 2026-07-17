'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calculator, Check, Trash2, Undo2 } from 'lucide-react';
import { toolsService } from '../../../services/tools.service';
import { Button } from '../../../components/ui/Button';
import { formatFCFA, formatDateFR, todayISO } from '../../../utils/format';
import styles from '../../../components/shared/panel.module.css';

export default function TithePage() {
  const [income, setIncome] = useState('');
  const [percentage, setPercentage] = useState('10');
  const [offering, setOffering] = useState('');
  const [date, setDate] = useState(todayISO());
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Aperçu live — le serveur reste la source de vérité au moment d'enregistrer.
  const preview = Number(income) > 0 ? (Number(income) * Number(percentage || 0)) / 100 : 0;

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 30 };
      if (filter) params.is_paid = filter === 'paid';
      const res = await toolsService.listTithes(params);
      setHistory(res.data.calculations);
    } catch (err) {
      setError(err.response?.data?.error || 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { reload(); }, [reload]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!(Number(income) > 0)) { setError('Le revenu doit être supérieur à 0.'); return; }
    setSaving(true);
    try {
      await toolsService.createTithe({
        income_amount: Number(income),
        tithe_percentage: Number(percentage) || 10,
        offering_amount: Number(offering) || 0,
        calculation_date: date,
      });
      setIncome(''); setOffering('');
      await reload();
    } catch (err) {
      setError(err.response?.data?.error || "L'enregistrement a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const togglePaid = async (c) => {
    await toolsService.updateTithe(c.id, { is_paid: !c.is_paid });
    await reload();
  };

  const remove = async (c) => {
    if (!window.confirm('Supprimer ce calcul ? (définitif)')) return;
    await toolsService.deleteTithe(c.id);
    await reload();
  };

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      {/* Calculatrice */}
      <div className={styles.card}>
        <div className={styles.sectionHead}>
          <h3 className="flex items-center gap-sm"><Calculator size={18} /> Calculer ma dîme</h3>
        </div>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="t-income">Revenu (FCFA)</label>
              <input id="t-income" className={styles.input} type="number" min="1" inputMode="numeric"
                value={income} onChange={(e) => setIncome(e.target.value)} placeholder="0" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="t-pct">Pourcentage (%)</label>
              <input id="t-pct" className={styles.input} type="number" min="0" max="100" step="0.5"
                value={percentage} onChange={(e) => setPercentage(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="t-off">Offrande libre (FCFA)</label>
              <input id="t-off" className={styles.input} type="number" min="0" inputMode="numeric"
                value={offering} onChange={(e) => setOffering(e.target.value)} placeholder="0" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="t-date">Date</label>
              <input id="t-date" className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div>
              <div className="text-sm text-muted">Dîme à verser</div>
              <div className={styles.result}>{formatFCFA(preview)}</div>
              {Number(offering) > 0 && (
                <div className="text-sm text-muted">+ {formatFCFA(offering)} d'offrande — total {formatFCFA(preview + Number(offering))}</div>
              )}
            </div>
            <Button type="submit" isLoading={saving}>Enregistrer</Button>
          </div>

          {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        </form>
      </div>

      {/* Historique */}
      <div>
        <div className={styles.filters}>
          <select className={styles.select} style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tout l'historique</option>
            <option value="paid">Versées</option>
            <option value="unpaid">À verser</option>
          </select>
        </div>
        <div className={styles.card}>
          {loading ? (
            <p className="animate-pulse text-muted">Chargement…</p>
          ) : history.length === 0 ? (
            <div className={styles.empty}>Aucun calcul enregistré.</div>
          ) : (
            <div className={styles.list}>
              {history.map((c) => (
                <div key={c.id} className={styles.row}>
                  <span className={styles.rowIcon}>{c.is_paid ? '✅' : '💰'}</span>
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitle}>
                      {formatFCFA(c.tithe_amount)}
                      {Number(c.offering_amount) > 0 && (
                        <span className="text-muted text-sm"> + {formatFCFA(c.offering_amount)} d'offrande</span>
                      )}
                    </div>
                    <div className={styles.rowMeta}>
                      {formatDateFR(c.calculation_date)} · sur {formatFCFA(c.income_amount)} à {Number(c.tithe_percentage)} %
                      {c.paid_at ? ` · versée le ${formatDateFR(c.paid_at)}` : ''}
                    </div>
                  </div>
                  <span className={c.is_paid ? styles.badgeOk : styles.badge}>{c.is_paid ? 'Versée' : 'À verser'}</span>
                  <div className={styles.rowActions}>
                    <button className={styles.iconBtn} onClick={() => togglePaid(c)}
                      aria-label={c.is_paid ? 'Marquer non versée' : 'Marquer versée'}
                      title={c.is_paid ? 'Marquer non versée' : 'Marquer versée'}>
                      {c.is_paid ? <Undo2 size={16} /> : <Check size={16} />}
                    </button>
                    <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => remove(c)} aria-label="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
