import { useEffect, useState } from 'the-react';
import './PosterMap.css';
import { useNavigate } from '@router-dom';
import { Search } from '../Search/Search';
import type { IFilters } from '../../types';

const MAP_ELEMENT_ID = 'posters-map-osm';

let leafletLoader: Promise<any> | null = null;

function getLeafletGlobal() {
  return (window as any).L;
}

function loadLeaflet() {
  if (getLeafletGlobal()) return Promise.resolve(getLeafletGlobal());
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    const cssId = 'leaflet-css';
    const scriptId = 'leaflet-js';

    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(getLeafletGlobal()));
      existingScript.addEventListener('error', () => reject(new Error('Leaflet load failed')));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(getLeafletGlobal());
    script.onerror = () => reject(new Error('Leaflet load failed'));
    document.body.appendChild(script);
  });

  return leafletLoader;
}

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
  if (price < 1000) return `${price} /мес`;
  return `${Math.round(price / 1000)} тыс./мес`;
}

function formatCluster(count?: number, minPrice?: number) {
  if (!count) return '';
  return minPrice ? `${count} шт. от ${formatPrice(minPrice)}` : `${count} шт.`;
}

function makeMarkerHtml(text: string) {
  return `
    <div class="marker-wrap">
      <div class="marker-bubble">${text}</div>
      <div class="marker-dot"></div>
    </div>
  `;
}
function makeClusterHtml(text: string) {
  return `
    <div class="marker-wrap">
      <div class="marker-dot"> <div class="marker-bubble">${text}</div></div>
    </div>
  `;
}

function priceIcon(L: any, price?: number) {
  return L.divIcon({
    className: 'cian-marker',
    html: makeMarkerHtml(formatPrice(price)),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

function clusterIcon(L: any, count?: number, minPrice?: number) {
  return L.divIcon({
    className: 'cian-marker',
    html: makeClusterHtml(formatCluster(count, minPrice)),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

export default function PostersMap() {
  const navigate = useNavigate();
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

  const closePanel = () => {
    setIsPanelOpen(false);
    
  };

  useEffect(() => {
    let mapController: { map: any; markersLayer: any } | null = null;

    const init = async () => {
      try {
        const L = await loadLeaflet();
        const mapElement = document.getElementById(MAP_ELEMENT_ID);
        if (!mapElement) return;
        if (mapElement.innerHTML.trim()) return;

        const map = L.map(MAP_ELEMENT_ID, { 
          attributionControl: false, 
          zoomControl: true 
        }).setView([55.751244, 37.618423], 11);
        
        map.zoomControl.setPosition('topright');
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
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
                ? clusterIcon(L, props.count, props.priceMin)
                : priceIcon(L, props.price);

              const marker = L.marker([lat, lng], { icon });
              
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

        mapController = { map, markersLayer };
      } catch (error) {
        console.warn('Posters map init failed', error);
      }
    };

    init();

    return () => {
      if (mapController?.map) {
        mapController.map.remove();
      }
    };
  }, []);

  return (
    <div>
      <div id={MAP_ELEMENT_ID} style={{ position: 'absolute', left: '0px', height: '85vh', width: '100%' }} />
      
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
                <div key={poster.id} className="poster-card" onClick={() => navigate(`/posters/${poster.alias}`)}>
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