'use client';

import styles from './finance.module.css';

const TONES = {
  in: { color: 'var(--in)', bg: 'var(--in-soft)' },
  out: { color: 'var(--out)', bg: 'var(--out-soft)' },
  primary: { color: 'var(--primary)', bg: 'rgba(194, 152, 47, 0.14)' },
  navy: { color: 'var(--secondary)', bg: 'rgba(27, 58, 91, 0.14)' },
};

// Tuile de statistique : icône teintée + libellé + valeur.
export const StatCard = ({ label, value, icon, tone = 'primary' }) => {
  const t = TONES[tone] || TONES.primary;
  return (
    <div className={styles.stat}>
      <div className={styles.statHead}>
        {icon && (
          <span className={styles.statIcon} style={{ background: t.bg, color: t.color }}>
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      <div className={styles.statValue} style={{ color: t.color }}>{value}</div>
    </div>
  );
};
