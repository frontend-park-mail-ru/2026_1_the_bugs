import type { ApartmentDetails } from '../../types';
import shared from './PosterCard.module.css';
import styles from './PosterParams.module.css';

interface PosterParamsProps {
  poster: ApartmentDetails;
}

export function PosterParams({ poster }: PosterParamsProps) {
  return (
    <article className={shared.card}>
      <h2 className={shared.title}>Характеристики</h2>
      <div className={styles.params}>
        <div className={styles.param}><span className={styles.paramLabel}>Площадь</span><span className={styles.paramValue}>{poster.area.toString()} м²</span></div>
        <div className={styles.param}><span className={styles.paramLabel}>Этаж</span><span className={styles.paramValue}>{poster.flat.floor.toString()} из {poster.floor_count.toString()}</span></div>
        <div className={styles.param}><span className={styles.paramLabel}>Тип жилья</span><span className={styles.paramValue}>{poster.category}</span></div>
        <div className={styles.param}><span className={styles.paramLabel}>Категория</span><span className={styles.paramValue}>{poster.flat.flat_category}</span></div>
        <div className={styles.param}><span className={styles.paramLabel}>Номер квартиры</span><span className={styles.paramValue}>{poster.flat.flat_number.toString()}</span></div>
        <div className={styles.param}><span className={styles.paramLabel}>ID объявления</span><span className={styles.paramValue}>{poster.id.toString()}</span></div>
      </div>
    </article>
  );
}

