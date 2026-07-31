'use client';

import React, { useRef } from 'react';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { InvoiceTemplate } from '../../../../components/finance/InvoiceTemplate';
import { InvoiceActions } from '../../../../components/finance/InvoiceActions';

export default function InvoicePage() {
  const invoiceRef = useRef(null);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'var(--spacing-lg)' }}>
      <PageHeader 
        title="Reçu+" 
        subtitle="Visualisation et exportation de votre reçu détaillé"
      />
      
      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <InvoiceActions targetRef={invoiceRef} fileName="facture_shalom.pdf" />
        
        {/* Wrapper pour centrer et ajouter un peu d'espace autour du reçu */}
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <InvoiceTemplate ref={invoiceRef} />
        </div>
      </div>
    </div>
  );
}
