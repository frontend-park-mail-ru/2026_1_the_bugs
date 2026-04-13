import shared from './PosterCard.module.css';
import styles from './PosterMap.module.css';

interface PosterMapProps {
  mapUrl: string;
  address: string;
}

export function PosterMap({ mapUrl, address }: PosterMapProps) {
  return (
    <section className={`${shared.card} ${styles.mapCard}`}>
      <iframe
        className={styles.mapFrame}
        src={mapUrl}
        title={`Карта: ${address}`}
        loading="lazy"
      />
    </section>
  );
}

