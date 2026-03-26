import { useEffect, useState } from "@my-react/hooks";
import style from "./UtilGallery.module.css";
import type { UtilityCompany } from "src/types";

interface UtilPhotoProps {
    utilityCompany: UtilityCompany;
}
/** Модуль отображения фотографий ЖК*/
export function UtilGallery ({ utilityCompany }: UtilPhotoProps) {
    const images = [...(utilityCompany.photos || [])].sort((a, b) => a.order - b.order);
    const posterKey = utilityCompany.id.toString();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

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
    }, [activeIndex, utilityCompany.alias]);
    return(
        <section className={style.gallery} aria-label="Фотографии объявления">
      {!hasImages && (
        <div className={style.mainImage}>
          <div className={style.placeholder}>Нет фото</div>
        </div>
      )}

      {hasImages && (
        <div
          className={style.carousel}
          role="region"
          aria-roledescription="carousel"
          aria-label={`Фотографии: ${utilityCompany.address}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div
            className={`${style.mainImage} ${style.clickableImage} ${!hasManyImages ? style.singleMainImage : ''}`}
            onClick={() => setIsViewerOpen(true)}
            role="button"
            aria-label="Открыть фото"
          >
            {hasManyImages && (
              <button
                type="button"
                className={`${style.control} ${style.galleryControl} ${style.prev}`}
                aria-label="Предыдущее фото"
                onClick={(event: any) => {
                  event.stopPropagation();
                  prevSlide();
                }}
              >
                ‹
              </button>
            )}

            <div className={style.viewport}>
              <div className={style.track}>
                {images.map((image, index) => (
                  <div
                    id={`poster-slide-${posterKey}-${index.toString()}`}
                    className={`${style.slide} ${!hasManyImages ? style.singleSlide : ''}`}
                    key={image.order.toString()}
                  >
                    <img
                      src={image.img_url}
                      alt={`${utilityCompany.address} - фото ${(index + 1).toString()}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {hasManyImages && (
              <button
                type="button"
                className={`${style.control} ${style.galleryControl} ${style.next}`}
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
        <div className={style.viewerOverlay} onClick={closeViewer}>
          <button type="button" className={style.viewerClose} aria-label="Закрыть просмотр" onClick={closeViewer}>
            ×
          </button>

          <div className={style.viewerContent} onClick={(event: any) => event.stopPropagation()}>
            {hasManyImages && (
              <button type="button" className={`${style.control} ${style.prev}`} aria-label="Предыдущее фото" onClick={prevSlide}>
                ‹
              </button>
            )}

            <img
              className={style.viewerImage}
              src={images[activeIndex].img_url}
              alt={`${utilityCompany.address} - фото ${(activeIndex + 1).toString()}`}
            />

            {hasManyImages && (
              <button type="button" className={`${style.control} ${style.next}`} aria-label="Следующее фото" onClick={nextSlide}>
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </section>
    )
}