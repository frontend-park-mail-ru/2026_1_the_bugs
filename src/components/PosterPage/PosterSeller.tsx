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
      <div className={styles.sellerHead}>
        {poster.seller.avatar_url ? (
          <img className={styles.avatar} src={poster.seller.avatar_url} alt={sellerName || 'Продавец'} />
        ): (<img className={styles.avatar} src="/svg/profile.svg"/>)}
        <div className={styles.sellerText}>
          <div className={styles.sellerName}>{sellerName || 'Без имени'}</div>
          <div className={styles.sellerTextSecondary}>{'Coбственник'}</div>
           <div className={styles.sellerInfo}>
            <img style={{'max-width':'12px', 'max-height':'12px'  }}src="/svg/phone.svg"></img><p>{poster.seller.phone}</p>
          </div>
        </div>
      </div>

     
    </section>
  );
}

