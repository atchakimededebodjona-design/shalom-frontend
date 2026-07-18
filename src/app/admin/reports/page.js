'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, RefreshCw, Flag } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { reportsService } from '../../../services/reports.service';
import { getApiError } from '../../../utils/apiError';
import { BackButton } from '../../../components/ui/BackButton';
import { reasonMeta, targetTypeMeta, statusMeta, STATUTS_ORDRE } from './labels';
import styles from './reports.module.css';

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

export default function ReportsAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtreStatut, setFiltreStatut] = useState('en_attente');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refused, setRefused] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  const charger = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reportsService.list({ status: filtreStatut || undefined, page, limit: PAGE_SIZE });
      setItems(res.data.reports);
      setTotal(res.data.pagination.total);
    } catch (err) {
      if (err.response?.status === 403) {
        setRefused(true);
      } else {
        setError(getApiError(err, 'Impossible de charger les signalements'));
      }
    } finally {
      setLoading(false);
    }
  }, [filtreStatut, page]);

  useEffect(() => {
    if (user?.is_admin) charger();
  }, [user, charger]);

  const changerStatut = (v) => { setFiltreStatut(v); setPage(1); };

  const traiter = async (id, status, applyAction) => {
    setBusyId(id);
    setError('');
    try {
      await reportsService.updateStatus(id, status, applyAction);
      // Le filtre affiche généralement "en_attente" : le signalement traité en sort.
      setItems((prev) => prev.filter((it) => it.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      setError(getApiError(err, 'La mise à jour du signalement a échoué'));
    } finally {
      setBusyId(null);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        <p className="text-muted">Cet espace est réservé aux administrateurs de SHALOM.</p>
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <BackButton fallbackHref="/admin" />
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
      <div className="mb-md"><BackButton fallbackHref="/admin" /></div>

      <div className={styles.head}>
        <ShieldCheck size={26} color="var(--primary)" />
        <h1 className="text-primary">Signalements</h1>
      </div>
      <p className={styles.subtitle}>Publications et commentaires signalés par les membres.</p>

      <div className={styles.filters}>
        <div className={styles.chips}>
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

        <span className={styles.spacer} />

        <button
          className={styles.pagerBtn}
          onClick={charger}
          title="Rafraîchir"
          aria-label="Rafraîchir"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={15} /> Rafraîchir
        </button>
      </div>

      {error && <div className={styles.errorBox} role="alert">{error}</div>}

      {loading ? (
        <div className={styles.state}>Chargement des signalements…</div>
      ) : items.length === 0 ? (
        <div className={styles.state}>
          <Flag size={28} style={{ marginBottom: 8, opacity: 0.6 }} />
          <div>Aucun signalement {filtreStatut ? `« ${statusMeta(filtreStatut).label} »` : ''} pour le moment.</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <span className={styles.count}>{total} signalement{total > 1 ? 's' : ''}</span>
          </div>
          <div className={styles.list}>
            {items.map((it) => {
              const tm = targetTypeMeta(it.target_type);
              const sm = statusMeta(it.status);
              const enAttente = it.status === 'en_attente';
              return (
                <div key={it.id} className={styles.card} style={{ borderLeftColor: tm.couleur }}>
                  <div className={styles.cardTop}>
                    <span className={`${styles.badge} ${styles.typeBadge}`} style={{ background: tm.couleur }}>
                      {tm.label}
                    </span>
                    <span className={`${styles.badge} ${styles.reasonBadge}`}>{reasonMeta(it.reason).label}</span>
                    <span className={styles.spacer} />
                    <span className={styles.badge} style={{ background: sm.fond, color: sm.couleur }}>
                      {sm.label}
                    </span>
                    <span className={styles.date}>{formaterDate(it.created_at)}</span>
                  </div>

                  <div className={styles.meta}>
                    <span className={styles.metaItem}>
                      Signalé par <strong>{it.reporter_name || it.reporter_email}</strong>
                    </span>
                    <span className={styles.targetId}>{it.target_type} #{it.target_id}</span>
                  </div>

                  {it.details && <div className={styles.details}>{it.details}</div>}

                  {enAttente && (
                    <div className={styles.actions}>
                      <span className={styles.actionsLabel}>Action :</span>
                      <button
                        className={styles.actionBtn}
                        disabled={busyId === it.id}
                        onClick={() => traiter(it.id, 'traite', true)}
                      >
                        Traiter et masquer le contenu
                      </button>
                      <button
                        className={styles.actionBtn}
                        disabled={busyId === it.id}
                        onClick={() => traiter(it.id, 'traite', false)}
                      >
                        Traiter sans masquer
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        disabled={busyId === it.id}
                        onClick={() => traiter(it.id, 'rejete', false)}
                      >
                        Rejeter
                      </button>
                    </div>
                  )}
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
