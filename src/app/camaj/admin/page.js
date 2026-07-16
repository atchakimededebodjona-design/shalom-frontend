'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, ShieldAlert, RefreshCw, ChevronDown, ChevronUp,
  Mail, Phone, Inbox,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { camajService } from '../../../services/camaj.service';
import { getApiError } from '../../../utils/apiError';
import { BackButton } from '../../../components/ui/BackButton';
import {
  typeMeta, statusMeta, TYPES_ORDRE, STATUTS_ORDRE, detaillerPayload,
} from './labels';
import styles from './admin.module.css';

const PAGE_SIZE = 20;

const formaterDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export default function CamajAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [filtreType, setFiltreType] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refused, setRefused] = useState(false);
  const [ouvert, setOuvert] = useState(null); // id de la demande dépliée
  const [busyId, setBusyId] = useState(null);

  // Redirige vers la connexion si non authentifié.
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const chargerStats = useCallback(async () => {
    try {
      const res = await camajService.stats();
      setStats(res.data);
    } catch {
      /* les stats sont accessoires : on ignore l'échec */
    }
  }, []);

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await camajService.list({
        type: filtreType || undefined,
        status: filtreStatut || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setItems(res.data.submissions);
      setTotal(res.data.total);
    } catch (err) {
      if (err.response?.status === 403) {
        setRefused(true);
      } else {
        setError(getApiError(err, 'Impossible de charger les demandes'));
      }
    } finally {
      setLoading(false);
    }
  }, [filtreType, filtreStatut, page]);

  useEffect(() => {
    if (user?.is_admin) {
      charger();
      chargerStats();
    }
  }, [user, charger, chargerStats]);

  // Revient à la page 1 quand un filtre change.
  const changerType = (v) => { setFiltreType(v); setPage(1); };
  const changerStatut = (v) => { setFiltreStatut(v); setPage(1); };

  const majStatut = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      const res = await camajService.updateStatus(id, status);
      const maj = res.data;
      // Si un filtre de statut est actif et ne correspond plus, on retire la ligne.
      if (filtreStatut && filtreStatut !== status) {
        setItems((prev) => prev.filter((it) => it.id !== id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...maj } : it)));
      }
      chargerStats();
    } catch (err) {
      setError(getApiError(err, 'La mise à jour du statut a échoué'));
    } finally {
      setBusyId(null);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // --- États de garde ---
  if (authLoading || (!user && !refused)) {
    return (
      <div className={styles.wrap}>
        <div className={styles.state}>Chargement…</div>
      </div>
    );
  }

  if (user && !user.is_admin) {
    return (
      <div className={styles.denied}>
        <ShieldAlert size={40} className={styles.deniedIcon} />
        <h1 className="text-primary">Accès réservé</h1>
        <p className="text-muted">Cet espace est réservé aux administrateurs du CAMAJ.</p>
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <BackButton fallbackHref="/camaj" />
        </div>
      </div>
    );
  }

  if (refused) {
    return (
      <div className={styles.denied}>
        <ShieldAlert size={40} className={styles.deniedIcon} />
        <h1 className="text-primary">Accès refusé</h1>
        <p className="text-muted">Ton compte n&apos;a pas les droits d&apos;administration.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.wrap} animate-fade-in`}>
      <div className="mb-md"><BackButton fallbackHref="/camaj" /></div>

      <div className={styles.head}>
        <ShieldCheck size={26} color="var(--primary)" />
        <h1 className="text-primary">Demandes CAMAJ</h1>
      </div>
      <p className={styles.subtitle}>Consulter et traiter les demandes reçues depuis les formulaires.</p>

      {/* Statistiques */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          {STATUTS_ORDRE.map((s) => (
            <div key={s} className={styles.statCard}>
              <span className={styles.statNum} style={{ color: statusMeta(s).couleur }}>
                {stats.parStatut?.[s] || 0}
              </span>
              <span className={styles.statLabel}>{statusMeta(s).label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className={styles.filters}>
        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${filtreStatut === '' ? styles.chipActive : ''}`}
            onClick={() => changerStatut('')}
          >
            Tous
          </button>
          {STATUTS_ORDRE.map((s) => (
            <button
              key={s}
              className={`${styles.chip} ${filtreStatut === s ? styles.chipActive : ''}`}
              onClick={() => changerStatut(s)}
            >
              {statusMeta(s).label}
            </button>
          ))}
        </div>

        <select
          className={styles.select}
          value={filtreType}
          onChange={(e) => changerType(e.target.value)}
          aria-label="Filtrer par type de demande"
        >
          <option value="">Tous les types</option>
          {TYPES_ORDRE.map((t) => (
            <option key={t} value={t}>{typeMeta(t).label}</option>
          ))}
        </select>

        <span className={styles.spacer} />

        <button
          className={styles.pagerBtn}
          onClick={() => { charger(); chargerStats(); }}
          title="Rafraîchir"
          aria-label="Rafraîchir"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={15} /> Rafraîchir
        </button>
      </div>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      {/* Liste */}
      {loading ? (
        <div className={styles.state}>Chargement des demandes…</div>
      ) : items.length === 0 ? (
        <div className={styles.state}>
          <Inbox size={28} style={{ marginBottom: 8, opacity: 0.6 }} />
          <div>Aucune demande {filtreStatut || filtreType ? 'pour ce filtre' : 'pour le moment'}.</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <span className={styles.count}>{total} demande{total > 1 ? 's' : ''}</span>
          </div>
          <div className={styles.list}>
            {items.map((it) => {
              const tm = typeMeta(it.type);
              const sm = statusMeta(it.status);
              const detail = detaillerPayload(it.payload);
              const estOuvert = ouvert === it.id;
              return (
                <div key={it.id} className={styles.card} style={{ borderLeftColor: tm.couleur }}>
                  <div className={styles.cardTop}>
                    <span className={`${styles.badge} ${styles.typeBadge}`} style={{ background: tm.couleur }}>
                      {tm.label}
                    </span>
                    <span className={styles.nom}>{it.nom || '—'}</span>
                    <span className={styles.spacer} />
                    <span className={styles.badge} style={{ background: sm.fond, color: sm.couleur }}>
                      {sm.label}
                    </span>
                    <span className={styles.date}>{formaterDate(it.created_at)}</span>
                  </div>

                  <div className={styles.meta}>
                    {it.email && (
                      <span className={styles.metaItem}>
                        <Mail size={14} /> <a href={`mailto:${it.email}`}>{it.email}</a>
                      </span>
                    )}
                    {it.whatsapp && (
                      <span className={styles.metaItem}><Phone size={14} /> {it.whatsapp}</span>
                    )}
                  </div>

                  {detail.length > 0 && (
                    <button
                      className={styles.toggle}
                      onClick={() => setOuvert(estOuvert ? null : it.id)}
                      aria-expanded={estOuvert}
                    >
                      {estOuvert ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      {estOuvert ? 'Masquer le détail' : 'Voir le détail'}
                    </button>
                  )}

                  {estOuvert && detail.length > 0 && (
                    <div className={styles.detail}>
                      <div className={styles.detailGrid}>
                        {detail.map(({ cle, label, valeur }) => (
                          <div key={cle} className={styles.detailItem}>
                            <span className={styles.detailLabel}>{label}</span>
                            <span className={styles.detailValue}>{valeur}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.actions}>
                    <span className={styles.actionsLabel}>Statut :</span>
                    {STATUTS_ORDRE.map((s) => {
                      const actif = it.status === s;
                      const m = statusMeta(s);
                      return (
                        <button
                          key={s}
                          className={`${styles.actionBtn} ${actif ? styles.actionBtnActive : ''}`}
                          style={actif ? { borderColor: m.couleur, color: m.couleur } : undefined}
                          disabled={actif || busyId === it.id}
                          onClick={() => majStatut(it.id, s)}
                        >
                          {actif ? `● ${m.label}` : `Marquer « ${m.label} »`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {pages > 1 && (
            <div className={styles.pager}>
              <button
                className={styles.pagerBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Précédent
              </button>
              <span className={styles.pagerInfo}>Page {page} / {pages}</span>
              <button
                className={styles.pagerBtn}
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
