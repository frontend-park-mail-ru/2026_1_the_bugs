import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterCompany.module.css';

interface PosterCompanyProps {
  poster: ApartmentDetails;
}

export function PosterCompany({ poster }: PosterCompanyProps) {
  return (
    <section className={`${shared.card} ${styles.companyBlock}`}>
      <h2 className={shared.title}>Компания</h2>
      <span className={styles.companyTitle}>{poster.company.company_name}</span>
      {poster.company.avatar_url && (
        <img className={styles.companyAvatar} src={poster.company.avatar_url} alt={poster.company.company_name} />
      )}
    </section>
  );
}

