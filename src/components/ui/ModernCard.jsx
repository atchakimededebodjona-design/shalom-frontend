import styles from './ModernCard.module.css';

export const ModernCard = ({ children, className = '', variant = 'default', noPadding = false, ...props }) => {
  const cardClasses = [
    styles.card,
    variant === 'gradient-top' ? styles.gradientTop : '',
    variant === 'glass' ? styles.glass : '',
    noPadding ? styles.noPadding : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};
