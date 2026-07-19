'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import billingService from '../../../../../services/billing.service';
import { getApiError } from '../../../../../utils/apiError';
import { useInvoiceForm } from '../../../../../components/billing/useInvoiceForm';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import styles from '../../billing.module.css';
import t from './invoice-template.module.css';

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [clientsRes, businessRes] = await Promise.all([
          billingService.listClients({ limit: 100 }),
          billingService.getMyBusiness(),
        ]);
        setClients(clientsRes.data.clients || []);
        setBusiness(businessRes.data.business);
      } catch (err) {
        setLoadError(getApiError(err, 'Erreur lors du chargement.'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const f = useInvoiceForm({
    business,
    onCreated: (invoice) => router.push(`/billing/invoices/${invoice.id}`),
  });

  if (loading) {
    return (
      <div className={styles.containerWide}>
        <div className={styles.loadingState}>Chargement…</div>
      </div>
    );
  }

  const downPaymentInt = parseInt(f.downPayment, 10) || 0;
  const finalNetToPay = Math.max(0, f.netToPay - downPaymentInt);

  return (
    <div className={t.page}>
      <Link href="/billing/invoices" className={styles.breadcrumb}>
        <ArrowLeft size={16} /> Factures
      </Link>

      {loadError && <div className={styles.errorBanner}>{loadError}</div>}

      <div className={t.sheet}>
        <div className={t.sheetHead}>
          <h1 className={t.sheetTitle}>FACTURE</h1>
          {business?.name && <p className={t.sheetBusiness}>{business.name}</p>}
          {(business?.address || business?.phone) && (
            <p className={t.sheetTagline}>
              {[business.address, business.phone].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {f.error && <div className={t.errorBanner}>{f.error}</div>}

        {clients.length === 0 ? (
          <div className={t.emptyClients}>
            Vous n&apos;avez pas encore de client.{' '}
            <Link href="/billing/clients">Créez-en un d&apos;abord</Link>.
          </div>
        ) : (
          <form onSubmit={f.handleSubmit}>
            <div className={t.metaRow}>
              <div className={t.metaField} style={{ minWidth: '14rem' }}>
                <span className={t.badge}>Facturé à</span>
                <select required value={f.clientId} onChange={(e) => f.setClientId(e.target.value)}>
                  <option value="">— Sélectionner un client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={t.metaField}>
                <span className={t.badge}>Date d&apos;émission</span>
                <input type="date" value={f.issueDate} onChange={(e) => f.setIssueDate(e.target.value)} />
              </div>
              <div className={t.metaField}>
                <span className={t.metaLabel}>Échéance</span>
                <input type="date" value={f.dueDate} onChange={(e) => f.setDueDate(e.target.value)} />
              </div>
            </div>

            <table className={t.table}>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Description</th>
                  <th>Prix unitaire</th>
                  <th>Quantité</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {f.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        required
                        placeholder="Description de l'article"
                        value={item.description}
                        onChange={(e) => f.updateItem(index, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unit_price}
                        onChange={(e) => f.updateItem(index, 'unit_price', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) => f.updateItem(index, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>{f.formatAmount((parseFloat(item.quantity) || 0) * (parseInt(item.unit_price, 10) || 0))}</td>
                    <td>
                      {f.items.length > 1 && (
                        <button type="button" onClick={() => f.removeItem(index)} className={t.removeBtn}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={f.addItem} className={t.addItemBtn}>
              <Plus size={14} /> Ajouter un article
            </button>

            <div className={t.metaRow}>
              <div className={t.metaField}>
                <span className={t.metaLabel}>TVA (%)</span>
                <input type="number" min="0" max="100" step="0.01" value={f.taxRate} onChange={(e) => f.setTaxRate(e.target.value)} />
              </div>
              <div className={t.metaField}>
                <span className={t.metaLabel}>Remise</span>
                <input type="number" min="0" value={f.discountAmount} onChange={(e) => f.setDiscountAmount(e.target.value)} />
              </div>
              <div className={t.metaField}>
                <span className={t.metaLabel}>Acompte payé</span>
                <input type="number" min="0" value={f.downPayment} onChange={(e) => f.setDownPayment(e.target.value)} />
              </div>
              <div className={t.metaField} style={{ minWidth: '14rem' }}>
                <span className={t.metaLabel}>Notes</span>
                <input type="text" value={f.notes} onChange={(e) => f.setNotes(e.target.value)} />
              </div>
            </div>

            <div className={t.totals}>
              <div className={t.totalsRow}><span>Total HT</span><span>{f.formatAmount(f.subtotal)}</span></div>
              <div className={t.totalsRow}><span>TVA {f.taxRate || 0}%</span><span>{f.formatAmount(f.taxAmount)}</span></div>
              <div className={`${t.totalsRow} ${t.totalsRowFinal}`}><span>Total TTC</span><span>{f.formatAmount(f.total)}</span></div>
              {parseInt(f.discountAmount, 10) > 0 && (
                <div className={t.totalsRow}><span>Remise</span><span>-{f.formatAmount(f.discountAmount)}</span></div>
              )}
              {downPaymentInt > 0 && (
                <div className={t.totalsRow}><span>Acompte payé</span><span>-{f.formatAmount(downPaymentInt)}</span></div>
              )}
            </div>

            <div className={t.footerBand}>
              <span className={t.thanks}>Merci</span>
              <div className={t.netToPay}>
                <div className={t.netToPayLabel}>Net à payer</div>
                <div className={t.netToPayAmount}>{f.formatAmount(finalNetToPay)}</div>
              </div>
            </div>

            <div className={t.actions}>
              <button type="button" onClick={() => router.push('/billing/invoices')} className={styles.btnSecondary}>
                Annuler
              </button>
              <button type="submit" disabled={f.saving} className={styles.btnPrimary}>
                {f.saving ? 'Création…' : 'Créer la facture'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
