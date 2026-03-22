import { useEffect, useState } from '@my-react/hooks';
import { getPosterByAlias } from '../services/posters';
import type { ApartmentDetails } from '../types';
import styles from './PosterPage.module.css';

interface PosterPageProps {
  alias: string; // прилетает из роутера как строка
}

const formatPrice = (price: number) => `${price.toLocaleString()} ₽`;

const MAP_ZOOM = 16;
const MAP_DELTA = 0.004;

function getMapEmbedUrl(lat: number, lon: number) {
  const left = lon - MAP_DELTA;
  const right = lon + MAP_DELTA;
  const top = lat + MAP_DELTA;
  const bottom = lat - MAP_DELTA;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left.toFixed(6)}%2C${bottom.toFixed(6)}%2C${right.toFixed(6)}%2C${top.toFixed(6)}&layer=mapnik&marker=${lat.toFixed(6)}%2C${lon.toFixed(6)}&zoom=${MAP_ZOOM.toString()}`;
}

/**
 * Страница конкретного объявления.
 * Загружает данные по alias из маршрута `/posters/{alias}`
 * и отображает состояние загрузки, ошибку или контент объявления.
 *
 * @param alias - Уникальный alias объявления из параметров роутера.
 */
export function PosterPage({ alias }: PosterPageProps) {
  const [poster, setPoster] = useState<ApartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPoster = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getPosterByAlias(alias);
        setPoster(data);
      } catch (e: any) {
        setError(e?.message || 'Не удалось загрузить объявление');
      } finally {
        setLoading(false);
      }
    };

    loadPoster();
  }, [alias]);

  if (loading) return <div className="page"><main className={`main ${styles.main}`}><div className={styles.status}>Загрузка объявления...</div></main></div>;
  if (error) return <div className="page"><main className={`main ${styles.main}`}><div className={styles.status}>Ошибка: {error}</div></main></div>;
  if (!poster) return <div className="page"><main className={`main ${styles.main}`}><div className={styles.status}>Объявление не найдено</div></main></div>;

  const mainImage = poster.images[0]?.img_url;
  const thumbs = poster.images.slice(1, 5);
  const sellerName = `${poster.seller.first_name} ${poster.seller.last_name}`.trim();
  const description = poster.description?.trim() || 'Описание отсутствует';
  const { lat, lon } = poster.building_geo;
  const mapUrl = getMapEmbedUrl(lat, lon);

  return (
    <div className="page">
      <main className={`main ${styles.main}`}>
        <div className={styles.layout}>
          <div className={styles.leftColumn}>
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

            <article className={styles.card}>
              <h1 className={styles.address}>{poster.address}</h1>
              <div className={styles.metaInline}>
                <span>Метро: {poster.metro}</span>
                <span>Район: {poster.district}</span>
                <span>Город: {poster.city}</span>
              </div>
            </article>

            <article className={styles.card}>
              <p className={styles.description}>{description}</p>
            </article>

            <article className={styles.card}>
              <h2>Характеристики</h2>
              <div className={styles.params}>
                <div className={styles.param}><span className={styles.paramLabel}>Площадь</span><span className={styles.paramValue}>{poster.area.toString()} м²</span></div>
                <div className={styles.param}><span className={styles.paramLabel}>Этаж</span><span className={styles.paramValue}>{poster.flat.floor.toString()} из {poster.floor_count.toString()}</span></div>
                <div className={styles.param}><span className={styles.paramLabel}>Тип жилья</span><span className={styles.paramValue}>{poster.category}</span></div>
                <div className={styles.param}><span className={styles.paramLabel}>Категория</span><span className={styles.paramValue}>{poster.flat.flat_category}</span></div>
                <div className={styles.param}><span className={styles.paramLabel}>Номер квартиры</span><span className={styles.paramValue}>{poster.flat.flat_number.toString()}</span></div>
                <div className={styles.param}><span className={styles.paramLabel}>ID объявления</span><span className={styles.paramValue}>{poster.id.toString()}</span></div>
              </div>
            </article>

          </div>

          <aside className={styles.rightColumn}>
            <section className={`${styles.card} ${styles.summaryCard}`}>
              <strong className={styles.price}>{formatPrice(poster.price)}</strong>
              <div className={styles.metaCompact}>
                <span>{poster.area.toString()} м²</span>
                <span>{poster.flat.floor.toString()} этаж</span>
              </div>
            </section>

            <section className={`${styles.card} ${styles.mapCard}`}>
              <iframe
                className={styles.mapFrame}
                src={mapUrl}
                title={`Карта: ${poster.address}`}
                loading="lazy"
              />
            </section>

            <section className={`${styles.card} ${styles.seller}`}>
              <h2>Продавец</h2>
              <div className={styles.sellerHead}>
                {poster.seller.avatar_url ? (
                  <img className={styles.avatar} src={poster.seller.avatar_url} alt={sellerName || 'Продавец'} />
                ) : (
                  <div className={styles.avatarFallback}>Нет фото</div>
                )}
                <div>
                  <div className={styles.sellerName}>{sellerName || 'Без имени'}</div>
                </div>
              </div>

              <div className={styles.sellerInfo}>
                <span>Телефон: {poster.seller.phone}</span>
              </div>
            </section>

            <section className={`${styles.card} ${styles.companyBlock}`}>
              <h2>Компания</h2>
              <span className={styles.companyTitle}>{poster.company.company_name}</span>
              {poster.company.avatar_url ? (
                <img className={styles.companyAvatar} src={poster.company.avatar_url} alt={poster.company.company_name} />
              ) : (
                <div className={styles.companyAvatarFallback}>Логотип отсутствует</div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}