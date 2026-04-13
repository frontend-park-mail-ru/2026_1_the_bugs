import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterCompany.module.css';

interface PosterCompanyProps {
  poster: ApartmentDetails;
}

export function PosterCompany({ poster }: PosterCompanyProps) {
  return (
    <section className={`${shared.card}`}>
      <div  className={styles.companyBlock}>
        {poster?.company?.avatar_url && (
          <img className={styles.companyAvatar} src={poster.company?.avatar_url} alt={poster.company?.company_name} />
        )}
        <div>
            <p className={styles.companyTitle}>{poster.company?.company_name}</p>
            <p className={styles.companyText}>Комплекс</p>
        </div>
     
        
      </div>
    </section>
  );
}

