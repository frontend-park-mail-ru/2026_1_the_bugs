import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterSummary.module.css';

interface PosterSummaryProps {
  poster: ApartmentDetails;
  price: string;
  views: number | null;
}

export function PosterSummary({ poster, price, views }: PosterSummaryProps) {
  return (
    <section className={`${shared.card} ${styles.summaryCard}`}>
      <strong className={styles.price}>{price}</strong>
      <div className={styles.metaCompact}>
        <span>{poster.area.toString()} м²</span>
        <span>{poster.flat.floor.toString()} этаж</span>
        <span style={{'display': 'flex', 'gap': '6px', 'align-content': 'center'}}>{views ? views.toString(): '0'} <img className={styles.icon} src="/svg/view.svg"></img></span>
      </div>
    </section>
  );
}

