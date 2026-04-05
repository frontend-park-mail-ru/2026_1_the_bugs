import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterMainInfo.module.css';

interface PosterMainInfoProps {
  poster: ApartmentDetails;
}

export function PosterMainInfo({ poster }: PosterMainInfoProps) {
  const metro = (poster.metro || '').trim();
  const district = (poster.district || '').trim();

  return (
    <article className={shared.card}>
      <h1 className={styles.address}>{poster.address}</h1>
      <div className={styles.metaInline}>
        {metro && <span>Метро: {metro}</span>}
        {district && <span>Район: {district}</span>}
        <span>Город: {poster.city}</span>
      </div>
    </article>
  );
}

