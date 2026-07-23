import { BackButton } from './BackButton';
import styles from './PageHeader.module.css';

export const PageHeader = ({ title, description, showBack = false, fallbackHref = '/', actions }) => {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {showBack && (
          <div className={styles.backWrapper}>
            <BackButton fallbackHref={fallbackHref} />
          </div>
        )}
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};
