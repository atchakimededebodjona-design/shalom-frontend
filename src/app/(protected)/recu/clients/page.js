'use client';

import { useEffect, useState } from 'react';
import { clientsService } from '../../../../services/clients.service';
import { Button } from '../../../../components/ui/Button';
import styles from '../../../../components/recu/recu.module.css';

export default function RecuClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await clientsService.list({ limit: 100 });
      setClients(res.data.clients);
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de charger les clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await clientsService.create(form);
      setForm({ name: '', email: '', phone: '', address: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Création impossible.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.clientsGrid}>
      <div className={styles.card}>
        <div className={styles.sectionHead}><h3>Clients</h3></div>
        {loading ? (
          <p className="animate-pulse text-muted">Chargement…</p>
        ) : clients.length === 0 ? (
          <p className={styles.empty}>Aucun client. Ajoutez-en un via le formulaire.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th></tr></thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.card} style={{ alignSelf: 'start' }}>
        <div className={styles.sectionHead}><h3>Nouveau client</h3></div>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Nom *</label>
            <input id="name" className={styles.input} value={form.name} onChange={set('name')} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input id="email" type="email" className={styles.input} value={form.email} onChange={set('email')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">Téléphone</label>
            <input id="phone" className={styles.input} value={form.phone} onChange={set('phone')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="address">Adresse</label>
            <input id="address" className={styles.input} value={form.address} onChange={set('address')} />
          </div>
          {error && <p className={styles.errorMsg}>{error}</p>}
          <Button type="submit" variant="primary" isLoading={saving} style={{ width: '100%' }}>
            Ajouter le client
          </Button>
        </form>
      </div>
    </div>
  );
}
