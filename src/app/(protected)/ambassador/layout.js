'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Coins, ArrowDownToLine } from 'lucide-react';
import styles from './ambassador.module.css';

export default function AmbassadorLayout({ children }) {
  const pathname = usePathname();
  
  // Si l'utilisateur est sur la page d'inscription, on n'affiche pas la navigation
  if (pathname === '/ambassador/join') {
    return <div className={styles.container}>{children}</div>;
  }

  const tabs = [
    { name: 'Tableau de bord', href: '/ambassador', icon: LayoutDashboard },
    { name: 'Filleuls', href: '/ambassador/referrals', icon: Users },
    { name: 'Commissions', href: '/ambassador/commissions', icon: Coins },
    { name: 'Retraits', href: '/ambassador/withdrawals', icon: ArrowDownToLine },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Espace Ambassadeur</h1>
        <p className={styles.subtitle}>Gérez vos parrainages et suivez vos gains en toute simplicité.</p>
      </header>

      <nav className={styles.navTabs}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className={`${styles.navTab} ${isActive ? styles.navTabActive : ''}`}
            >
              <Icon size={18} />
              {tab.name}
            </Link>
          );
        })}
      </nav>

      <main>
        {children}
      </main>
    </div>
  );
}
