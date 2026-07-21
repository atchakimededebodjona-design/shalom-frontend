'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ambassadorService from '../../../services/ambassador.service';
import styles from './ambassador.module.css';
import { Copy, MessageCircle, AlertCircle } from 'lucide-react';

export default function AmbassadorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await ambassadorService.getDashboard();
      setData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // L'utilisateur n'est pas encore ambassadeur
        router.push('/ambassador/join');
      } else {
        console.error('Erreur lors du chargement du dashboard', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = async () => {
    try {
      const response = await ambassadorService.getReferralLink();
      window.open(response.data.whatsapp_url, '_blank');
    } catch (error) {
      console.error('Erreur lors de la génération du lien WhatsApp', error);
      alert('Impossible de générer le lien WhatsApp.');
    }
  };

  if (loading) return <div className={styles.emptyState}>Chargement du tableau de bord...</div>;
  if (!data) return null;

  const { profile, stats, certification } = data;

  return (
    <div>
      {/* Statistiques principales */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardPremium}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Solde Disponible</span>
            <span className={styles.badge} style={{ background: 'rgba(255,255,255,0.2)' }}>
              {profile.level === 'certified' ? 'Certifié 🌟' : 'Standard'}
            </span>
          </div>
          <div className={styles.statValue}>
            {stats.available_balance.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Commissions (Mois)</span>
          </div>
          <div className={styles.statValue}>
            {stats.commissions_this_month.toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Filleuls Qualifiés</span>
          </div>
          <div className={styles.statValue}>
            {profile.total_referrals}
          </div>
        </div>
      </div>



      {/* Lien de parrainage */}
      <div className={styles.linkSection}>
        <div>
          <h3>Votre Lien de Parrainage</h3>
          <p className={styles.subtitle}>Partagez ce lien ou votre code ({profile.referral_code}) pour commencer à gagner.</p>
        </div>
        
        <div className={styles.linkBox}>
          <span className={styles.linkUrl}>https://shalom.app/register?ref={profile.referral_code}</span>
          <button 
            className={styles.btnAction} 
            onClick={() => copyToClipboard(`https://shalom.app/register?ref=${profile.referral_code}`)}
          >
            <Copy size={16} />
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>

        <button className={`${styles.btnAction} ${styles.btnWhatsApp}`} onClick={shareWhatsApp}>
          <MessageCircle size={18} />
          Partager sur WhatsApp
        </button>
      </div>
    </div>
  );
}
