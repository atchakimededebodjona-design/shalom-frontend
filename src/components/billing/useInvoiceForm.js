'use client';

import { useState, useMemo } from 'react';
import billingService from '../../services/billing.service';
import { getApiError } from '../../utils/apiError';

const emptyItem = () => ({ description: '', quantity: 1, unit_price: 0 });

export function useInvoiceForm({ business, onCreated }) {
  const currency = business?.currency || 'XOF';
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [taxRate, setTaxRate] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = items.reduce(
      (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseInt(item.unit_price, 10) || 0),
      0
    );
    const tax = Math.round((sub * (parseFloat(taxRate) || 0)) / 100);
    return { subtotal: Math.round(sub), taxAmount: tax, total: Math.round(sub) + tax };
  }, [items, taxRate]);

  const formatAmount = (amount) => `${Number(amount).toLocaleString('fr-FR')} ${currency}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!clientId) {
      setError('Choisissez un client.');
      return;
    }
    setSaving(true);
    try {
      // Le numéro de facture est généré côté serveur (préfixe de l'entreprise).
      const res = await billingService.createInvoice({
        client_id: clientId,
        items: items.map((item) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseInt(item.unit_price, 10),
        })),
        tax_rate: parseFloat(taxRate) || 0,
        issue_date: issueDate || undefined,
        due_date: dueDate || undefined,
        notes: notes || undefined,
      });
      const invoice = res.data.invoice;

      // Acompte éventuel : enregistré comme un premier paiement (crédite le Portefeuille).
      const down = parseInt(downPayment, 10) || 0;
      if (down > 0 && invoice?.id) {
        try {
          await billingService.createPayment(invoice.id, { amount: down, method: 'cash' });
        } catch {
          // La facture est créée ; l'acompte pourra être ajouté depuis le détail.
        }
      }
      onCreated?.(invoice);
    } catch (err) {
      setError(getApiError(err, 'Erreur lors de la création de la facture.'));
      setSaving(false);
    }
  };

  return {
    currency, saving, error,
    clientId, setClientId,
    items, updateItem, addItem, removeItem,
    taxRate, setTaxRate,
    downPayment, setDownPayment,
    issueDate, setIssueDate,
    dueDate, setDueDate,
    notes, setNotes,
    subtotal, taxAmount, total,
    formatAmount,
    handleSubmit,
  };
}
