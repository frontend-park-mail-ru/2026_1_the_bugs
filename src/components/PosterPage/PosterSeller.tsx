import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterSeller.module.css';

interface PosterSellerProps {
  poster: ApartmentDetails;
}

export function PosterSeller({ poster }: PosterSellerProps) {
  const sellerName = `${poster.seller.first_name} ${poster.seller.last_name}`.trim();

  return (
    <section className={`${shared.card} ${styles.seller}`}>
      <h2 className={shared.title}>Продавец</h2>
      <div className={styles.sellerHead}>
        {poster.seller.avatar_url && (
          <img className={styles.avatar} src={poster.seller.avatar_url} alt={sellerName || 'Продавец'} />
        )}
        <div className={styles.sellerText}>
          <div className={styles.sellerName}>{sellerName || 'Без имени'}</div>
        </div>
      </div>

      <div className={styles.sellerInfo}>
        <span>Телефон: {poster.seller.phone}</span>
      </div>
    </section>
  );
}

