'use client';

import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Receipt, Lock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { billingService } from '../../../services/billing.service';
import { BackButton } from '../../../components/ui/BackButton';
import financeStyles from '../../../components/finance/finance.module.css';
import styles from '../../../components/billing/billing.module.css';

const TABS = [
  { href: '/billing', label: 'Tableau de bord' },
  { href: '/billing/clients', label: 'Clients' },
  { href: '/billing/invoices', label: 'Factures' },
  { href: '/billing/business', label: 'Mon entreprise' },
];

// Partagé entre toutes les pages du module : évite à chacune de refaire son
// propre appel GET /billing/businesses/me et sa propre gestion des 3 états
// (abonnement requis / pas encore d'entreprise / prêt).
const BillingContext = createContext(null);
export const useBilling = () => useContext(BillingContext);

export default function BillingLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);

  const refreshBusiness = useCallback(async () => {
    setBusinessLoading(true);
    setSubscriptionRequired(false);
    try {
      const res = await billingService.getMyBusiness();
      setBusiness(res.data.business);
    } catch (err) {
      if (err.response?.status === 402) {
        setSubscriptionRequired(true);
      } else if (err.response?.data?.code !== 'BUSINESS_NOT_FOUND') {
        console.error('Erreur de chargement de l\'entreprise Reçu+', err);
      }
      setBusiness(null);
    } finally {
      setBusinessLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user) refreshBusiness();
  }, [authLoading, user, refreshBusiness]);

  if (authLoading || !user || businessLoading) {
    return (
      <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (subscriptionRequired) {
    return (
      <div className={`container animate-fade-in ${financeStyles.theme}`} style={{ padding: 'var(--spacing-xl) 0' }}>
        <div className="mb-md"><BackButton fallbackHref="/dashboard" /></div>
        <div className={styles.lockScreen}>
          <div className={styles.lockIcon}><Lock size={40} /></div>
          <h1 className={styles.lockTitle}>Reçu+ est réservé aux membres abonnés</h1>
          <p className={styles.lockText}>
            La génération de factures fait partie des outils premium de SHALOM. Abonnez-vous
            (ou profitez de votre essai gratuit de 7 jours) pour créer votre entreprise et
            commencer à facturer vos clients.
          </p>
          <Link href="/billing/subscribe" className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            Débloquer Reçu+
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container animate-fade-in ${financeStyles.theme}`} style={{ padding: 'var(--spacing-xl) 0' }}>
      <div className="mb-md"><BackButton fallbackHref="/dashboard" /></div>
      <h1 className="text-primary flex items-center gap-sm mb-md">
        <Receipt size={26} /> Reçu+
      </h1>
      <nav className={financeStyles.tabs}>
        {TABS.map((t) => {
          const active = t.href === '/billing' ? pathname === '/billing' : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={`${financeStyles.tab} ${active ? financeStyles.tabActive : ''}`}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <BillingContext.Provider value={{ business, refreshBusiness }}>
        {children}
      </BillingContext.Provider>
    </div>
  );
}
