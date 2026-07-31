'use client';

import React, { forwardRef } from 'react';
import styles from './InvoiceTemplate.module.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Composant enveloppé dans forwardRef pour pouvoir l'imprimer/exporter facilement
export const InvoiceTemplate = forwardRef(({ invoiceData }, ref) => {
  // Valeurs par défaut si invoiceData n'est pas fourni (pour la démo)
  const data = invoiceData || {
    date: new Date(),
    invoiceNumber: 'F-2026-08001',
    clientRef: 'CLI-98765',
    client: {
      name: 'Monsieur Jean Dupont',
      company: 'Entreprise ABC',
      address: '123 Rue de la Paix',
      city: '75000 Paris',
      phone: '+33 6 12 34 56 78'
    },
    seller: 'Marie Admin',
    position: 'Service Financier',
    paymentTerms: 'Comptant',
    dueDate: new Date(),
    items: [
      { qty: 1, description: 'Inscription Formation Avancée', price: 15000 },
      { qty: 2, description: 'Livre: Les clés de la réussite', price: 5000 }
    ],
    tvaRate: 18 // 18% par exemple
  };

  const formatDate = (date) => format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  
  const subtotal = data.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const tvaAmount = (subtotal * data.tvaRate) / 100;
  const total = subtotal + tvaAmount;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  return (
    <div className={styles.invoiceWrapper} ref={ref}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logoPlaceholder}>SH</div>
          <div className={styles.companyName}>SHALOM</div>
        </div>
        <div className={styles.titleArea}>
          <h1>Facture</h1>
        </div>
      </div>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <div className={styles.companyDetails}>
          <h2>SHALOM INC.</h2>
          <p>Former, Accompagner, Connecter</p>
          <br />
          <p>10 Bvd de la République</p>
          <p>01 BP 1234 Abidjan, Côte d'Ivoire</p>
          <p>+225 01 02 03 04 05</p>
        </div>
        <div className={styles.invoiceDetails}>
          <p><strong>Date :</strong> {formatDate(data.date)}</p>
          <p><strong>N° de facture :</strong> {data.invoiceNumber}</p>
          <p><strong>Référence client :</strong> {data.clientRef}</p>
        </div>
      </div>

      {/* Bill To */}
      <div className={styles.billTo}>
        <div className={styles.billToLabel}>À :</div>
        <div className={styles.billToDetails}>
          <p><strong>{data.client.name}</strong></p>
          {data.client.company && <p>{data.client.company}</p>}
          <p>{data.client.address}</p>
          <p>{data.client.city}</p>
          <p>{data.client.phone}</p>
        </div>
      </div>

      {/* Summary Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vendeur</th>
            <th>Poste</th>
            <th>Conditions de paiement</th>
            <th>Échéance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.seller}</td>
            <td>{data.position}</td>
            <td>{data.paymentTerms}</td>
            <td>{formatDate(data.dueDate)}</td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Qté</th>
            <th>Description</th>
            <th>Prix unitaire</th>
            <th>Total de la ligne</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{item.qty}</td>
              <td>{item.description}</td>
              <td>{formatCurrency(item.price)}</td>
              <td>{formatCurrency(item.qty * item.price)}</td>
            </tr>
          ))}
          {/* Empty rows to match the image design (optional, adding a few for aesthetics) */}
          {[...Array(3)].map((_, i) => (
            <tr key={`empty-${i}`}>
              <td>&nbsp;</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Area */}
      <div className={styles.totalsArea}>
        <table className={styles.totalsTable}>
          <tbody>
            <tr>
              <td className={styles.totalLabel}>Sous-total</td>
              <td className={styles.totalValue}>{formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td className={styles.totalLabel}>T.V.A. ({data.tvaRate}%)</td>
              <td className={styles.totalValue}>{formatCurrency(tvaAmount)}</td>
            </tr>
            <tr>
              <td className={styles.totalLabel} style={{ fontWeight: 'bold' }}>Total</td>
              <td className={styles.totalValue} style={{ fontWeight: 'bold' }}>{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Veuillez libeller tous les paiements à l'ordre de SHALOM.</p>
        <p className={styles.footerNote}>Nous vous remercions de votre confiance.</p>
        <p>10 Bvd de la République | 01 BP 1234 Abidjan | +225 01 02 03 04 05 | contact@shalom-app.com</p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';
