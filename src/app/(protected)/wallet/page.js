'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { WalletMinimal, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { walletService } from '../../../services/wallet.service';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { MovementForm } from '../../../components/wallet/MovementForm';
import { TopupForm } from '../../../components/wallet/TopupForm';
import { formatFCFA, formatDateFR } from '../../../utils/format';
import styles from '../../../components/finance/finance.module.css';

const STATUS_LABEL = { active: 'Actif', frozen: 'Gelé', closed: 'Fermé' };

export default function WalletOverviewPage() {
  const [wallet, setWallet] = useState(null);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [movementType, setMovementType] = useState(null); // null | 'credit' | 'debit'
  const [topupOpen, setTopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [w, c] = await Promise.all([
        walletService.getWallet({ limit: 8 }),
        walletService.listCategories(),
      ]);
      setWallet(w.data.wallet);
      setRecent(w.data.transactions);
      setCategories(c.data.categories);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger le portefeuille.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitMovement = async (payload) => {
    const body = {
      amount: payload.amount,
      category_id: payload.category_id,
      description: payload.description,
    };
    if (payload.type === 'credit') await walletService.createIncome(body);
    else await walletService.createExpense(body);
    setMovementType(null);
    await load();
  };

  const submitTopup = async (body) => {
    const res = await walletService.topup(body);
    return res.data.payment; // affiché par TopupForm
  };

  if (loading && !wallet) {
    return <div className="animate-pulse text-muted" style={{ padding: 'var(--spacing-xl)' }}>Chargement…</div>;
  }
  if (error) {
    return <p className={styles.errorMsg} role="alert" style={{ padding: 'var(--spacing-md)' }}>{error}</p>;
  }

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency || 'XOF';
  const status = wallet?.status || 'active';

  return (
    <div className="flex-col gap-lg" style={{ display: 'flex' }}>
      {/* Carte solde + actions rapides */}
      <div className={styles.card}>
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div>
            <div className="text-muted text-sm flex items-center gap-xs"><WalletMinimal size={16} /> Solde du portefeuille</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.1, marginTop: 4 }}>
              {formatFCFA(balance)}
            </div>
            <div className="text-muted text-sm flex items-center gap-xs" style={{ marginTop: 6 }}>
              <span className={styles.badge}>{currency === 'XOF' ? 'FCFA' : currency}</span>
              <span>Statut : {STATUS_LABEL[status] || status}</span>
            </div>
          </div>
          <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
            <Button onClick={() => setMovementType('credit')}>
              <span className="flex items-center gap-xs"><TrendingUp size={16} /> Revenu</span>
            </Button>
            <Button variant="secondary" onClick={() => setMovementType('debit')}>
              <span className="flex items-center gap-xs"><TrendingDown size={16} /> Dépense</span>
            </Button>
            <Button variant="accent" onClick={() => setTopupOpen(true)}>
              <span className="flex items-center gap-xs"><Plus size={16} /> Recharger</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mouvements récents */}
      <div className={styles.card}>
        <div className={styles.sectionHead}>
          <h3>Mouvements récents</h3>
          <Link href="/wallet/transactions" className="text-sm text-primary font-bold">Voir tout</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted text-sm">Aucun mouvement pour l'instant.</p>
        ) : (
          <div className={styles.list}>
            {recent.map((t) => {
              const isCredit = t.type === 'credit';
              const reversed = t.status === 'reversed';
              return (
                <div key={t.id} className={styles.txRow}>
                  <span className={styles.txIcon} style={{ background: isCredit ? 'var(--in-soft)' : 'var(--out-soft)' }}>
                    {t.category_icon || (isCredit ? '💰' : '💸')}
                  </span>
                  <div className={styles.txMain}>
                    <div className={styles.txTitle} style={reversed ? { textDecoration: 'line-through', opacity: 0.7 } : undefined}>
                      {t.category_name || t.description || (isCredit ? 'Crédit' : 'Débit')}
                    </div>
                    <div className={styles.txMeta}>
                      {formatDateFR(t.created_at)}{reversed ? ' · annulé' : ''}
                    </div>
                  </div>
                  <span className={`${styles.txAmount} ${isCredit ? styles.amountIn : styles.amountOut}`}>
                    {isCredit ? '+' : '−'}{formatFCFA(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modales */}
      <Modal
        isOpen={movementType !== null}
        onClose={() => setMovementType(null)}
        title={movementType === 'credit' ? 'Nouveau revenu' : 'Nouvelle dépense'}
      >
        <MovementForm
          initialType={movementType || 'debit'}
          categories={categories}
          onSubmit={submitMovement}
          onCancel={() => setMovementType(null)}
        />
      </Modal>

      <Modal isOpen={topupOpen} onClose={() => setTopupOpen(false)} title="Recharger le portefeuille">
        <TopupForm onSubmit={submitTopup} onCancel={() => setTopupOpen(false)} />
      </Modal>
    </div>
  );
}
