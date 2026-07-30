import styles from './billing.module.css';

const LABELS = { draft: 'Brouillon', partial: 'Partiellement payée', paid: 'Payée', overdue: 'En retard' };
const CLASSES = { draft: styles.statusDraft, partial: styles.statusPartial, paid: styles.statusPaid, overdue: styles.statusOverdue };

export const InvoiceStatusBadge = ({ status }) => (
  <span className={`${styles.statusBadge} ${CLASSES[status] || styles.statusDraft}`}>
    {LABELS[status] || status}
  </span>
);
