import { useEffect, useState } from '@my-react/hooks';
import { getPosterByAlias } from '../services/posters';
import type { ApartmentDetails } from '../types';

interface PosterPageProps {
  alias: string; // прилетает из роутера как строка
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

  if (loading) return <div className="page"><main className="main">Загрузка объявления...</main></div>;
  if (error) return <div className="page"><main className="main">Ошибка: {error}</main></div>;
  if (!poster) return <div className="page"><main className="main">Объявление не найдено</main></div>;

  return (
      // TODO: сверстать
    <div className="page">
      <main className="main">
        <h1>{poster.address}</h1>
        <p>{poster.description}</p>
        <p>Метро: {poster.metro}</p>
        <p>Район: {poster.district}</p>
        <p>Площадь: {poster.area.toString()} м²</p>
        <p>Цена: {poster.price.toString()} ₽</p>
        <p>Этаж: {poster.flat.floor.toString()}</p>
        <p>Категория: {poster.flat.flat_category}</p>
        <p>Продавец: {poster.seller.seller_first_name} {poster.seller.seller_last_name}</p>
        <p>Телефон: {poster.seller.seller_phone}</p>

        {poster.images[0] && (
            <img src={poster.images[0].img_url} alt="Фото квартиры" />
        )}
      </main>
    </div>
  );
}