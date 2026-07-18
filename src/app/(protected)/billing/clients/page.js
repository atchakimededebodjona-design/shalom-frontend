'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import billingService from '../../../../services/billing.service';
import { getApiError } from '../../../../utils/apiError';
import { ArrowLeft, Plus, Edit2, Trash2, XCircle } from 'lucide-react';
import styles from '../billing.module.css';

export default function BillingClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await billingService.listClients({ limit: 100 });
      setClients(res.data.clients || []);
      setError('');
    } catch (err) {
      setError(getApiError(err, 'Erreur lors du chargement des clients.'));
    } finally {
      setLoading(false);
    }
  };

  const openModal = (client = null) => {
    setEditingClient(client);
    setForm(client
      ? { name: client.name, phone: client.phone || '', email: client.email || '', address: client.address || '' }
      : { name: '', phone: '', email: '', address: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingClient) {
        await billingService.updateClient(editingClient.id, form);
      } else {
        await billingService.createClient(form);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      setFormError(getApiError(err, "Erreur lors de l'enregistrement."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (client) => {
    if (!confirm(`Supprimer le client "${client.name}" ?`)) return;
    try {
      await billingService.deleteClient(client.id);
      fetchClients();
    } catch (err) {
      alert(getApiError(err, 'Erreur lors de la suppression.'));
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/billing" className={styles.breadcrumb}>
        <ArrowLeft size={16} /> Reçu+
      </Link>

      <div className={styles.headRow}>
        <div>
          <h1 className={styles.title}>Clients</h1>
        </div>
        <button onClick={() => openModal()} className={styles.btnPrimary}>
          <Plus size={18} /> Nouveau client
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {loading ? (
        <div className={styles.loadingState}>Chargement…</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Adresse</th>
                <th className={styles.actionsCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.phone || '—'}</td>
                  <td>{client.email || '—'}</td>
                  <td>{client.address || '—'}</td>
                  <td className={styles.actionsCell}>
                    <button onClick={() => openModal(client)} className={styles.iconBtn}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(client)} className={`${styles.iconBtn} ${styles.iconBtnDanger}`}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.emptyRow}>Aucun client pour l&apos;instant.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingClient ? 'Modifier le client' : 'Nouveau client'}</h2>
              <button onClick={() => setIsModalOpen(false)} className={styles.closeBtn}>
                <XCircle size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {formError && <div className={styles.errorBanner}>{formError}</div>}
              <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                  <label className={styles.label}>Nom</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className={styles.label}>Téléphone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <p className={styles.helperText}>Utilisé pour le partage WhatsApp des factures.</p>
                </div>
                <div>
                  <label className={styles.label}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className={styles.label}>Adresse</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>Annuler</button>
                  <button type="submit" disabled={saving} className={styles.btnPrimary}>
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
