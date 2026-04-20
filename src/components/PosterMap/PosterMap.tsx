import { useEffect, useState } from 'the-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../index.css'
import './PosterMap.css'

type FeatureProps = {
  cluster?: boolean;
  count?: number;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  alias?: string;
};

type GeoFeature = {
  geometry?: {
    type?: string;
    coordinates?: [number, number];
  };
  properties?: FeatureProps;
  propertiese?: FeatureProps;
};

type ApiResponse = {
  features?: GeoFeature[];
  posters?: GeoFeature[];
};

type Poster = {
  id: number;
  alias: string;
  address: string;
  area: number;
  price: number;
  avatar_url: string;
  category: {
    name: string;
    alias: string;
  };
};

type PostersByPointResponse = {
  len: number;
  posters: Poster[];
};

const API_BASE = 'http://localhost:8000/api';

function formatPrice(price?: number) {
  if (!price) return '';
  return `${Math.round(price / 1000)} тыс./мес`;
}

function formatCluster(count?: number, minPrice?: number) {
  if (!count) return '';
  return minPrice ? `${count} от ${Math.round(minPrice / 1000)} тыс./мес` : `${count}`;
}

function makeMarkerHtml(text: string) {
  return `
    <div class="marker-wrap">
      <div class="marker-bubble">${text}</div>
      <div class="marker-dot"></div>
    </div>
  `;
}

function priceIcon(price?: number) {
  return L.divIcon({
    className: 'cian-marker',
    html: makeMarkerHtml(formatPrice(price)),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

function clusterIcon(count?: number, minPrice?: number) {
  return L.divIcon({
    className: 'cian-marker',
    html: makeMarkerHtml(formatCluster(count, minPrice)),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

export default function PostersMap() {
  const [mapReady, setMapReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const loadPostersByPoint = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE}/posters/by-point`);
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to load posters');

      const data: PostersByPointResponse = await response.json();
      setPosters(data.posters || []);
      setIsPanelOpen(true);
    } catch (error) {
      console.error('Error loading posters by point:', error);
      setPosters([]);
    } finally {
      setLoading(false);
    }
  };

  // Закрытие панели
  const closePanel = () => {
    setIsPanelOpen(false);
    setSelectedPoint(null);
    setPosters([]);
  };

  useEffect(() => {
    if (!mapReady) return;

    const map = L.map('map', { zoomControl: true }).setView([55.751244, 37.618423], 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    const loadPosters = async () => {
      const bounds = map.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const zoom = map.getZoom();

      const url = new URL(`${API_BASE}/posters/geo`);
      url.searchParams.set('sw_lat', String(sw.lat));
      url.searchParams.set('sw_lon', String(sw.lng));
      url.searchParams.set('ne_lat', String(ne.lat));
      url.searchParams.set('ne_lon', String(ne.lng));
      url.searchParams.set('zoom', String(zoom));

      try {
        const res = await fetch(url.toString());
        if (!res.ok) return;

        const data: ApiResponse = await res.json();
        const items = data.features || data.posters || [];

        markersLayer.clearLayers();

        items.forEach((item) => {
          const coords = item.geometry?.coordinates;
          if (!coords) return;

          const [lng, lat] = coords;
          if (typeof lat !== 'number' || typeof lng !== 'number') return;

          const props = item.properties || item.propertiese || {};
          const icon = props.cluster
            ? clusterIcon(props.count, props.priceMin)
            : priceIcon(props.price);

          const marker = L.marker([lat, lng], { icon });
          
          // Добавляем обработчик клика на маркер
          marker.on('click', () => {
            setSelectedPoint({ lat, lng });
            loadPostersByPoint(lat, lng);
          });
          
          marker.addTo(markersLayer);
        });
      } catch (error) {
        console.error('Error loading posters:', error);
      }
    };

    map.on('moveend', loadPosters);
    map.on('zoomend', loadPosters);
    map.whenReady(loadPosters);

    return () => {
      map.off('moveend', loadPosters);
      map.off('zoomend', loadPosters);
      map.remove();
    };
  }, [mapReady]);

  useEffect(() => {
    setMapReady(true);
  }, []);

  return (
    <div>
      <div id="map" style={{ height: '100vh', width: '100%' }} />
      
      {/* Выдвижная панель */}
      <div className={`poster-panel ${isPanelOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <h3>Объявления</h3>
          <button className="close-btn" onClick={closePanel}>×</button>
        </div>
        
        <div className="panel-content">
          {loading ? (
            <div className="loading-spinner">Загрузка...</div>
          ) : posters.length === 0 ? (
            <div className="no-posters">Нет объявлений по данной точке</div>
          ) : (
            <div className="posters-list">
              {posters.map((poster) => (
                <div key={poster.id} className="poster-card">
                  {poster.avatar_url && (
                    <img 
                      src={poster.avatar_url} 
                      alt={poster.alias}
                      className="poster-image"
                    />
                  )}
                  <div className="poster-info">
                    <div className="poster-category">{poster.category.name}</div>
                    <div className="poster-address">{poster.address}</div>
                    <div className="poster-details">
                      <span className="poster-area">{poster.area.toString()} м²</span>
                      <span className="poster-price">{poster.price.toString()} руб./мес</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}