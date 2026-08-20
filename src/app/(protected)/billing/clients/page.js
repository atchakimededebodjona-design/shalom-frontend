'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, UserRound } from 'lucide-react';
import { useBilling } from '../layout';
import { billingService } from '../../../../services/billing.service';
import { getApiError } from '../../../../utils/apiError';
import { usePaginatedFetch } from '../../../../hooks/usePaginatedFetch';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { ClientForm } from '../../../../components/billing/ClientForm';
import financeStyles from '../../../../components/finance/finance.module.css';
import styles from '../../../../components/billing/billing.module.css';

const PAGE_SIZE = 20;

export default function BillingClientsPage() {
  const { business } = useBilling();
  const [modal, setModal] = useState(null); // 'create' | client object | null
  const [deletingId, setDeletingId] = useState(null);

  const fetchPage = useCallback(async (page) => {
    const res = await billingService.listClients({ page, limit: PAGE_SIZE });
    return { items: res.data.clients, pagination: res.data.pagination };
  }, []);

  const { items: clients, setItems: setClients, pagination, setPagination, loading, error, reload, loadMore } = usePaginatedFetch(fetchPage, {
    separateLoadingMore: false,
    errorMessage: 'Impossible de charger les clients',
  });

  useEffect(() => { if (business) reload(); }, [business, reload]);

  if (!business) {
    return <p className={financeStyles.empty}>Configurez d&apos;abord votre entreprise depuis le tableau de bord.</p>;
  }

  const handleCreate = async (payload) => {
    await billingService.createClient(payload);
    setModal(null);
    await reload();
  };

  const handleUpdate = async (payload) => {
    await billingService.updateClient(modal.id, payload);
    setModal(null);
    await reload();
  };

  const handleDelete = async (client) => {
    if (!confirm(`Supprimer le client « ${client.name} » ? Les factures déjà émises seront conservées.`)) return;
    setDeletingId(client.id);
    try {
      await billingService.deleteClient(client.id);
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      setPagination((p) => (p ? { ...p, total_count: p.total_count - 1 } : p));
    } catch (err) {
      alert(getApiError(err, 'Impossible de supprimer ce client'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className={financeStyles.sectionHead}>
        <h2 style={{ margin: 0 }}>Clients</h2>
        <Button onClick={() => setModal('create')} className="flex items-center gap-xs">
          <Plus size={16} /> Nouveau client
        </Button>
      </div>

      {error && <p className={financeStyles.errorMsg} role="alert">{error}</p>}

      {!loading && clients.length === 0 ? (
        <p className={financeStyles.empty}>Aucun client pour l&apos;instant — ajoutez-en un pour commencer à facturer.</p>
      ) : (
        clients.map((c) => (
          <div key={c.id} className={styles.rowCard}>
            <div className="flex items-center gap-md" style={{ flex: 1, minWidth: 0 }}>
              <span className={financeStyles.txIcon} style={{ background: 'var(--bg-color)' }}><UserRound size={18} /></span>
              <div className={styles.rowMain}>
                <div className={styles.rowTitle}>{c.name}</div>
                <div className={styles.rowMeta}>{[c.phone, c.email].filter(Boolean).join(' · ') || 'Aucun contact renseigné'}</div>
              </div>
            </div>
            <div className={financeStyles.txActions}>
              <button type="button" className={financeStyles.iconBtn} onClick={() => setModal(c)} aria-label="Modifier">
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className={`${financeStyles.iconBtn} ${financeStyles.iconBtnDanger}`}
                onClick={() => handleDelete(c)}
                disabled={deletingId === c.id}
                aria-label="Supprimer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}

      {pagination?.has_next && (
        <div className="flex justify-center" style={{ marginTop: 'var(--spacing-md)' }}>
          <Button variant="secondary" isLoading={loading} onClick={loadMore}>
            Charger plus
          </Button>
        </div>
      )}

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Nouveau client">
        <ClientForm onSubmit={handleCreate} onCancel={() => setModal(null)} />
      </Modal>
      <Modal isOpen={Boolean(modal) && modal !== 'create'} onClose={() => setModal(null)} title="Modifier le client">
        {modal && modal !== 'create' && <ClientForm client={modal} onSubmit={handleUpdate} onCancel={() => setModal(null)} />}
      </Modal>
    </div>
  );
}
