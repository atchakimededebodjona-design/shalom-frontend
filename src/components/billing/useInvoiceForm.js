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
  const [discountAmount, setDiscountAmount] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const { subtotal, taxAmount, total, netToPay } = useMemo(() => {
    const sub = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseInt(item.unit_price, 10) || 0), 0);
    const tax = Math.round((sub * (parseFloat(taxRate) || 0)) / 100);
    const tot = Math.round(sub) + tax;
    const discount = parseInt(discountAmount, 10) || 0;
    return { subtotal: Math.round(sub), taxAmount: tax, total: tot, netToPay: Math.max(0, tot - discount) };
  }, [items, taxRate, discountAmount]);

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
      const res = await billingService.createInvoice({
        client_id: clientId,
        items: items.map((item, index) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseInt(item.unit_price, 10),
          sort_order: index,
        })),
        tax_rate: parseFloat(taxRate) || 0,
        discount_amount: parseInt(discountAmount, 10) || 0,
        down_payment: parseInt(downPayment, 10) || 0,
        issue_date: issueDate || undefined,
        due_date: dueDate || undefined,
        notes: notes || undefined,
      });
      onCreated?.(res.data.invoice);
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
    discountAmount, setDiscountAmount,
    downPayment, setDownPayment,
    issueDate, setIssueDate,
    dueDate, setDueDate,
    notes, setNotes,
    subtotal, taxAmount, total, netToPay,
    formatAmount,
    handleSubmit,
  };
}
