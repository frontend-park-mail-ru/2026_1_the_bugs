import { useEffect, useState } from 'the-react/hooks';
import { useNavigate } from '@router-dom';
import { addView, getPosterByAlias, getViews } from '../services/posters';
import type { ApartmentDetails } from '../types';

import layout from '../components/PosterPage/PosterPageLayout.module.css';
import { PosterGallery } from '../components/PosterPage/PosterGallery';
import { PosterMainInfo } from '../components/PosterPage/PosterMainInfo';
import { PosterDescription } from '../components/PosterPage/PosterDescription';
import { PosterParams } from '../components/PosterPage/PosterParams';
import { PosterSummary } from '../components/PosterPage/PosterSummary';
import { PosterMap } from '../components/PosterPage/PosterMap';
import { PosterSeller } from '../components/PosterPage/PosterSeller';
import { PosterCompany } from '../components/PosterPage/PosterCompany';

interface PosterPageProps {
  alias?: string;
}

const formatPrice = (price: number) => `${price.toLocaleString()} ₽`;

/**
 * Страница конкретного объявления.
 * Загружает данные по alias из маршрута `/posters/{alias}`
 * и отображает состояние загрузки, ошибку или контент объявления.
 *
 * @param alias - Уникальный alias объявления из параметров роутера.
 */
export function PosterPage({ alias }: PosterPageProps) {
  if (alias === undefined){
    return null
  }
  const [poster, setPoster] = useState<ApartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()

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

  useEffect(() => {
    const loadPoster = async () => {
      try {
        await addView(alias);
      } catch (e: any) {
        console.error(e)
      }
    };
    loadPoster();
  }, []);

  useEffect(() => {
    const loadPoster = async () => {
      try {
        const resp = await getViews(alias);
        setViews(resp.views)
        console.log(resp)
      } catch (e: any) {
        console.error(e)
      }
    };
    loadPoster();
  }, []);

  const handelCompanyClick=()=>{
    navigate(`/company/${poster?.company?.alias}`)
  }

  let mainContent;

  if (loading) {
    mainContent = <div className={layout.status}>Загрузка объявления...</div>;
  } else if (error) {
    mainContent = <div className={layout.status}>Ошибка: {error}</div>;
  } else if (!poster) {
    mainContent = <div className={layout.status}>Объявление не найдено</div>;
  } else {
    const description = poster.description?.trim() || 'Описание отсутствует';
    const { lat, lon } = poster.building_geo;

    mainContent = (
      <div className={layout.layout}>
        <div className={layout.leftColumn}>
          <PosterGallery key="poster_gallery" poster={poster} />
          <PosterMainInfo key="poster_main_info" poster={poster} />
          <PosterDescription key="poster_description" description={description} />
          <PosterParams key="poster_params" poster={poster} />
        </div>

        <aside className={layout.rightColumn}>
          <PosterSummary key="poster_summary" poster={poster} price={formatPrice(poster.price)} views={views} />
          <PosterMap key="poster_map" latitude={lat} longitude={lon} address={poster.address} />
          <PosterSeller key="poster_seller" poster={poster} />
          {poster.company && (
            <button onClick={()=>{handelCompanyClick()}}>
              <PosterCompany key="poster_company" poster={poster} />
            </button>
          )}
        </aside>
      </div>
    );
  }

  return (
      <div className={`main ${layout.main}`}>
        {mainContent}
      </div>
  );
}