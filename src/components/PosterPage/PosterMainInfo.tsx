import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterMainInfo.module.css';

interface PosterMainInfoProps {
  poster: ApartmentDetails;
}

export function PosterMainInfo({ poster }: PosterMainInfoProps) {
  const metro = (poster.metro || '').trim();

  return (
    <article className={shared.card}>
      <h1 className={styles.address}>{poster.address}</h1>
      <div className={styles.metaInline}>
        {metro && <span>Метро: {metro}</span>}
        <span>Район: {poster.district}</span>
        <span>Город: {poster.city}</span>
      </div>
    </article>
  );
}

