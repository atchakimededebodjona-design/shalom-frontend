'use client';

import { useRouter } from 'next/navigation';
import { useBilling } from '../layout';
import { billingService } from '../../../../services/billing.service';
import { BusinessForm } from '../../../../components/billing/BusinessForm';
import financeStyles from '../../../../components/finance/finance.module.css';

export default function BillingBusinessPage() {
  const { business, refreshBusiness } = useBilling();
  const router = useRouter();

  if (!business) {
    return (
      <p className={financeStyles.empty}>
        Aucune entreprise enregistrée pour l&apos;instant — configurez-la depuis le tableau de bord.
      </p>
    );
  }

  const handleUpdate = async (payload) => {
    await billingService.updateBusiness(payload);
    await refreshBusiness();
    router.push('/billing');
  };

  return (
    <div className={financeStyles.card} style={{ maxWidth: 640 }}>
      <h2 style={{ marginTop: 0 }}>Coordonnées de l&apos;entreprise</h2>
      <p className="text-muted text-sm mb-md">
        Ces informations (nom, logo, adresse, contact) apparaissent sur toutes vos factures.
      </p>
      <BusinessForm business={business} onSubmit={handleUpdate} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
