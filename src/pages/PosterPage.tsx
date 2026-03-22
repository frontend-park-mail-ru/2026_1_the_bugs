import { useEffect, useState } from '@my-react/hooks';
import { getPosterByAlias } from '../services/posters';
import type { ApartmentDetails } from '../types';
import { Header } from '../components/Header/Header';
import { AuthModal } from '../components/AuthModal/AuthModal';
import layout from '../components/PosterPage/PosterPageLayout.module.css';
import { PosterGallery } from '../components/PosterPage/PosterGallery';
import { PosterMainInfo } from '../components/PosterPage/PosterMainInfo';
import { PosterDescription } from '../components/PosterPage/PosterDescription';
import { PosterParams } from '../components/PosterPage/PosterParams';
import { PosterSummary } from '../components/PosterPage/PosterSummary';
import { PosterMap } from '../components/PosterPage/PosterMap';
import { PosterSeller } from '../components/PosterPage/PosterSeller';
import { PosterCompany } from '../components/PosterPage/PosterCompany';
import { apiService } from '../services/apiClass';
import { authService } from '../services/auth';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(apiService.isAuthenticated());
  const [poster, setPoster] = useState<ApartmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onLogoutClick = () => {
    setIsAuthenticate(false);
    authService.logout();
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = '';
  };

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
    const mapUrl = getMapEmbedUrl(lat, lon);

    mainContent = (
      <div className={layout.layout}>
        <div className={layout.leftColumn}>
          <PosterGallery key="poster_gallery" poster={poster} />
          <PosterMainInfo key="poster_main_info" poster={poster} />
          <PosterDescription key="poster_description" description={description} />
          <PosterParams key="poster_params" poster={poster} />
        </div>

        <aside className={layout.rightColumn}>
          <PosterSummary key="poster_summary" poster={poster} price={formatPrice(poster.price)} />
          <PosterMap key="poster_map" mapUrl={mapUrl} address={poster.address} />
          <PosterSeller key="poster_seller" poster={poster} />
          <PosterCompany key="poster_company" poster={poster} />
        </aside>
      </div>
    );
  }

  return (
    <div className="page">
      <Header
        key="header"
        isAutenticated={isAuthenticate}
        onLogoutClick={onLogoutClick}
        onAuthorizeClick={openAuthModal}
      />
      <main className={`main ${layout.main}`}>
        {mainContent}
      </main>
      {isAuthModalOpen && <AuthModal key="auth" onSuccess={() => setIsAuthenticate(true)} onClose={closeAuthModal} />}
    </div>
  );
}