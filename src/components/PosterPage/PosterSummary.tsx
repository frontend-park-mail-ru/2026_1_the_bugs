import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterSummary.module.css';

interface PosterSummaryProps {
  poster: ApartmentDetails;
  price: string;
}

export function PosterSummary({ poster, price }: PosterSummaryProps) {
  return (
    <section className={`${shared.card} ${styles.summaryCard}`}>
      <strong className={styles.price}>{price}</strong>
      <div className={styles.metaCompact}>
        <span>{poster.area.toString()} м²</span>
        <span>{poster.flat.floor.toString()} этаж</span>
      </div>
    </section>
  );
}

