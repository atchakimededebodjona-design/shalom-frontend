'use client';

import Link from 'next/link';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import { useInvoiceForm } from './useInvoiceForm';
import { Plus, Trash2 } from 'lucide-react';
import styles from '../../app/(protected)/billing/billing.module.css';

export function InvoiceForm({ business, clients, onCreated, onCancel }) {
  const f = useInvoiceForm({ business, onCreated });

  return (
    <>
      {business && (
        <div className={styles.letterhead}>
          {business.logo_url ? (
            <img src={resolveMediaUrl(business.logo_url)} alt={business.name} className={styles.letterheadLogo} />
          ) : null}
          <div>
            <div className={styles.letterheadName}>{business.name}</div>
            <div className={styles.letterheadMeta}>
              {[business.address, business.phone, business.tax_id && `NIF/RCCM : ${business.tax_id}`]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        </div>
      )}

      {f.error && <div className={styles.errorBanner}>{f.error}</div>}

      {clients.length === 0 ? (
        <div className={styles.card}>
          <p>
            Vous n&apos;avez pas encore de client.{' '}
            <Link href="/billing/clients" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Créez-en un d&apos;abord
            </Link>.
          </p>
        </div>
      ) : (
        <form onSubmit={f.handleSubmit} className={styles.form}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Informations générales</h2>
            <div className={styles.formGrid}>
              <div className={styles.colSpan2}>
                <label className={styles.label}>Client</label>
                <select required value={f.clientId} onChange={(e) => f.setClientId(e.target.value)}>
                  <option value="">— Sélectionner un client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Date d&apos;émission</label>
                <input type="date" value={f.issueDate} onChange={(e) => f.setIssueDate(e.target.value)} />
                <p className={styles.helperText}>Vide = aujourd&apos;hui</p>
              </div>
              <div>
                <label className={styles.label}>Date d&apos;échéance</label>
                <input type="date" value={f.dueDate} onChange={(e) => f.setDueDate(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>TVA (%)</label>
                <input type="number" min="0" max="100" step="0.01" value={f.taxRate} onChange={(e) => f.setTaxRate(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>Remise</label>
                <input type="number" min="0" value={f.discountAmount} onChange={(e) => f.setDiscountAmount(e.target.value)} />
              </div>
              <div>
                <label className={styles.label}>Acompte payé</label>
                <input type="number" min="0" value={f.downPayment} onChange={(e) => f.setDownPayment(e.target.value)} />
                <p className={styles.helperText}>Enregistré comme un paiement dès la création</p>
              </div>
              <div className={styles.colSpan2}>
                <label className={styles.label}>Notes</label>
                <textarea rows="2" value={f.notes} onChange={(e) => f.setNotes(e.target.value)}></textarea>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Articles</h2>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Description</th>
                  <th>Qté</th>
                  <th>Prix unitaire</th>
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
                        min="0.01"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) => f.updateItem(index, 'quantity', e.target.value)}
                        style={{ width: '5rem' }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unit_price}
                        onChange={(e) => f.updateItem(index, 'unit_price', e.target.value)}
                        style={{ width: '8rem' }}
                      />
                    </td>
                    <td>{f.formatAmount((parseFloat(item.quantity) || 0) * (parseInt(item.unit_price, 10) || 0))}</td>
                    <td>
                      {f.items.length > 1 && (
                        <button type="button" onClick={() => f.removeItem(index)} className={styles.itemRemoveBtn}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={f.addItem} className={styles.addItemBtn}>
              <Plus size={16} /> Ajouter un article
            </button>

            <div className={styles.totalsBox} style={{ marginTop: 'var(--spacing-xl)' }}>
              <div className={styles.totalsRow}><span>Sous-total</span><span>{f.formatAmount(f.subtotal)}</span></div>
              <div className={styles.totalsRow}><span>TVA ({f.taxRate || 0}%)</span><span>{f.formatAmount(f.taxAmount)}</span></div>
              <div className={`${styles.totalsRow} ${styles.totalsRowFinal}`}><span>Total</span><span>{f.formatAmount(f.total)}</span></div>
              {parseInt(f.discountAmount, 10) > 0 && (
                <div className={styles.totalsRow}><span>Remise</span><span>-{f.formatAmount(f.discountAmount)}</span></div>
              )}
              {parseInt(f.downPayment, 10) > 0 && (
                <div className={styles.totalsRow}><span>Acompte payé</span><span>-{f.formatAmount(f.downPayment)}</span></div>
              )}
              <div className={`${styles.totalsRow} ${styles.totalsRowDue}`}>
                <span>Net à payer</span>
                <span>{f.formatAmount(Math.max(0, f.netToPay - (parseInt(f.downPayment, 10) || 0)))}</span>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            {onCancel && (
              <button type="button" onClick={onCancel} className={styles.btnSecondary}>
                Annuler
              </button>
            )}
            <button type="submit" disabled={f.saving} className={styles.btnPrimary}>
              {f.saving ? 'Création…' : 'Créer la facture'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
