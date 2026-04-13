import { useEffect, useState } from 'the-react/hooks';
import type { ApartmentDetails } from '../../types';
import styles from './PosterGallery.module.css';

interface PosterGalleryProps {
  poster: ApartmentDetails;
}

export function PosterGallery({ poster }: PosterGalleryProps) {
  const images = [...(poster.images || [])].sort((a, b) => a.order - b.order);
  const posterKey = poster.id.toString();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setIsViewerOpen(false);
  }, [poster.alias]);

  const hasImages = images.length > 0;
  const hasManyImages = images.length > 1;
  const lastIndex = images.length - 1;

  const nextSlide = () => {
    if (!hasManyImages) return;
    setActiveIndex(activeIndex >= lastIndex ? 0 : activeIndex + 1);
  };

  const prevSlide = () => {
    if (!hasManyImages) return;
    setActiveIndex(activeIndex <= 0 ? lastIndex : activeIndex - 1);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Escape' && isViewerOpen) {
      event.preventDefault();
      setIsViewerOpen(false);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      nextSlide();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prevSlide();
    }
  };

  const closeViewer = () => setIsViewerOpen(false);

  useEffect(() => {
    if (!hasImages) return;
    const activeSlide = document.getElementById(`poster-slide-${posterKey}-${activeIndex.toString()}`);
    if (!activeSlide) return;
    activeSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [activeIndex, poster.alias]);

  return (
    <section className={styles.gallery} aria-label="Фотографии объявления">
      {!hasImages && (
        <div className={styles.mainImage}>
          <div className={styles.placeholder}>Нет фото</div>
        </div>
      )}

      {hasImages && (
        <div
          className={styles.carousel}
          role="region"
          aria-roledescription="carousel"
          aria-label={`Фотографии: ${poster.address}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div
            className={`${styles.mainImage} ${styles.clickableImage} ${!hasManyImages ? styles.singleMainImage : ''}`}
            onClick={() => setIsViewerOpen(true)}
            role="button"
            aria-label="Открыть фото"
          >
            {hasManyImages && (
              <button
                type="button"
                className={`${styles.control} ${styles.galleryControl} ${styles.prev}`}
                aria-label="Предыдущее фото"
                onClick={(event: any) => {
                  event.stopPropagation();
                  prevSlide();
                }}
              >
                ‹
              </button>
            )}

            <div className={styles.viewport}>
              <div className={styles.track}>
                {images.map((image, index) => (
                  <div
                    id={`poster-slide-${posterKey}-${index.toString()}`}
                    className={`${styles.slide} ${!hasManyImages ? styles.singleSlide : ''}`}
                    key={image.order.toString()}
                  >
                    <img
                      src={image.img_url}
                      alt={`${poster.address} - фото ${(index + 1).toString()}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {hasManyImages && (
              <button
                type="button"
                className={`${styles.control} ${styles.galleryControl} ${styles.next}`}
                aria-label="Следующее фото"
                onClick={(event: any) => {
                  event.stopPropagation();
                  nextSlide();
                }}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

      {hasImages && isViewerOpen && (
        <div className={styles.viewerOverlay} onClick={closeViewer}>
          <button type="button" className={styles.viewerClose} aria-label="Закрыть просмотр" onClick={closeViewer}>
            ×
          </button>

          <div className={styles.viewerContent} onClick={(event: any) => event.stopPropagation()}>
            {hasManyImages && (
              <button type="button" className={`${styles.control} ${styles.prev}`} aria-label="Предыдущее фото" onClick={prevSlide}>
                ‹
              </button>
            )}

            <img
              className={styles.viewerImage}
              src={images[activeIndex].img_url}
              alt={`${poster.address} - фото ${(activeIndex + 1).toString()}`}
            />

            {hasManyImages && (
              <button type="button" className={`${styles.control} ${styles.next}`} aria-label="Следующее фото" onClick={nextSlide}>
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

