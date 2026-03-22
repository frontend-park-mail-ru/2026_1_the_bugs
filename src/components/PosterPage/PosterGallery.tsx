import type { ApartmentDetails } from '../../types';
import styles from './PosterGallery.module.css';

interface PosterGalleryProps {
  poster: ApartmentDetails;
}

export function PosterGallery({ poster }: PosterGalleryProps) {
  const mainImage = poster.images[0]?.img_url;
  const thumbs = poster.images.slice(1, 5);

  return (
    <section className={styles.gallery}>
      <div className={styles.mainImage}>
        {mainImage ? (
          <img src={mainImage} alt={poster.address} />
        ) : (
          <div className={styles.placeholder}>Нет фото</div>
        )}
      </div>

      {thumbs.length > 0 && (
        <div className={styles.thumbGrid}>
          {thumbs.map((image) => (
            <div className={styles.thumb} key={image.order.toString()}>
              <img src={image.img_url} alt={`${poster.address} - фото ${image.order.toString()}`} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

