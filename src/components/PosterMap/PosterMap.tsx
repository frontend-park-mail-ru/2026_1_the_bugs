import { useEffect, useState } from 'the-react';
import './PosterMap.css';
import { useNavigate } from '@router-dom';
import { Search } from '../Search/Search';
import { Button } from '../Button/Button';
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
  group?: boolean;
};

type GeoFeature = {
  geometry?: {
    type?: string;
    coordinates?: [number, number];
  };
  propertiese?: FeatureProps;
};

type ApiResponse = {
  features?: GeoFeature[];
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

const parseNum = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parseBool = (value: string | null): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const parseFiltersFromSearch = (params: URLSearchParams): IFilters => {
  const facilities = params.get('facilities')
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    category: params.get('category') || undefined,
    room_count: parseNum(params.get('room_count')),
    min_price: parseNum(params.get('min_price')),
    max_price: parseNum(params.get('max_price')),
    min_square: parseNum(params.get('min_square')),
    max_square: parseNum(params.get('max_square')),
    min_flat_floor: parseNum(params.get('min_flat_floor')),
    max_flat_floor: parseNum(params.get('max_flat_floor')),
    min_building_floor: parseNum(params.get('min_building_floor')),
    max_building_floor: parseNum(params.get('max_building_floor')),
    facilities: facilities && facilities.length > 0 ? facilities : undefined,
    not_first_floor: parseBool(params.get('not_first_floor')),
    not_last_floor: parseBool(params.get('not_last_floor')),
  };
};

const syncQueryParams = (searchVal: string, filters: IFilters): string => {
  const params = new URLSearchParams();

  if (searchVal) params.set('search_query', searchVal);
  if (filters.category) params.set('category', filters.category);
  if (filters.room_count != null) params.set('room_count', String(filters.room_count));
  if (filters.min_price != null) params.set('min_price', String(filters.min_price));
  if (filters.max_price != null) params.set('max_price', String(filters.max_price));
  if (filters.min_square != null) params.set('min_square', String(filters.min_square));
  if (filters.max_square != null) params.set('max_square', String(filters.max_square));
  if (filters.min_flat_floor != null) params.set('min_flat_floor', String(filters.min_flat_floor));
  if (filters.max_flat_floor != null) params.set('max_flat_floor', String(filters.max_flat_floor));
  if (filters.min_building_floor != null) params.set('min_building_floor', String(filters.min_building_floor));
  if (filters.max_building_floor != null) params.set('max_building_floor', String(filters.max_building_floor));
  if (filters.facilities && filters.facilities.length > 0) params.set('facilities', filters.facilities.join(','));
  if (filters.not_first_floor) params.set('not_first_floor', 'true');
  if (filters.not_last_floor) params.set('not_last_floor', 'true');

  return params.toString();
};

const appendFiltersToParams = (params: URLSearchParams, searchVal: string, filters: IFilters) => {
  if (searchVal) params.set('search_query', searchVal);
  if (filters.category) params.set('category', filters.category);
  if (filters.room_count != null) params.set('room_count', String(filters.room_count));
  if (filters.min_price != null) params.set('min_price', String(filters.min_price));
  if (filters.max_price != null) params.set('max_price', String(filters.max_price));
  if (filters.min_square != null) params.set('min_square', String(filters.min_square));
  if (filters.max_square != null) params.set('max_square', String(filters.max_square));
  if (filters.min_flat_floor != null) params.set('min_flat_floor', String(filters.min_flat_floor));
  if (filters.max_flat_floor != null) params.set('max_flat_floor', String(filters.max_flat_floor));
  if (filters.min_building_floor != null) params.set('min_building_floor', String(filters.min_building_floor));
  if (filters.max_building_floor != null) params.set('max_building_floor', String(filters.max_building_floor));
  if (filters.facilities && filters.facilities.length > 0) params.set('facilities', filters.facilities.join(','));
  if (filters.not_first_floor) params.set('not_first_floor', 'true');
  if (filters.not_last_floor) params.set('not_last_floor', 'true');
};


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
      <div class="marker-dot"><div class="marker-bubble">${text}</div></div>
    </div>
  `;
}
function makeClusterHtml(count?: number) {
  return `
    <div class="marker-wrap">
      <div class="marker-dot">${count && count > 1 ? count : ''}</div>
    </div>
  `;
}

function makeGroupHtml(text: string) {
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

function clusterIcon(L: any, count?: number) {
  return L.divIcon({
    className: 'cian-marker',
    html: makeClusterHtml(count),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

function groupIcon(L: any, count?: number, minPrice?: number) {
  return L.divIcon({
    className: 'cian-marker',
    html: makeGroupHtml(formatCluster(count, minPrice)),
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}


export default function PostersMap() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialSearch = initialParams.get('search_query') || '';
  const initialFilters = parseFiltersFromSearch(initialParams);

  const navigate = useNavigate();
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState<IFilters>(initialFilters);
  const [mapController, setMapController] = useState<{ map: any; markersLayer: any } | null>(null);

  const handleSearch = (searchVal: string, nextFilters: IFilters) => {
    setSearchQuery(searchVal);
    setFilters(nextFilters);
    const query = syncQueryParams(searchVal, nextFilters);
    navigate(`${window.location.pathname}${query ? `?${query}` : ''}`);
  };

  const loadPostersByPoint = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const url = new URL(`${API_BASE}/posters/by-point`);
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));
      appendFiltersToParams(url.searchParams, searchQuery, filters);

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

  const loadPosters = async (map: any, markersLayer: any, searchVal: string, currentFilters: IFilters) => {
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
    appendFiltersToParams(url.searchParams, searchVal, currentFilters);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) return;

      const data: ApiResponse = await res.json();
      const items = data.features || [];

      markersLayer.clearLayers();

      items.forEach((item) => {
        const coords = item.geometry?.coordinates;
        if (!coords) return;

        const [lng, lat] = coords;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;

        const props = item.propertiese || {};

        let icon
        if (props.cluster){
          icon = clusterIcon(getLeafletGlobal(), props.count)
        } else if (props.group){
          icon = groupIcon(getLeafletGlobal(), props.count, props.priceMin)
        } else{
          icon = priceIcon(getLeafletGlobal(), props.price)
        }

        const marker = getLeafletGlobal().marker([lat, lng], { icon });

        marker.on('click', (e: any) => {
            e.propagate = false;
            e.originalEvent.stopPropagation();
            
            if (props.cluster) {
                map.flyTo([lat, lng], zoom*1.5, {
                    animate: true,
                    duration: 0.5
                });
                
            } else {
                setSelectedPoint({ lat, lng });
                loadPostersByPoint(lat, lng);
            }
        });
        marker.addTo(markersLayer);
      });
    } catch (error) {
      console.error('Error loading posters:', error);
    }
  };

  useEffect(() => {
    let controller: { map: any; markersLayer: any } | null = null;

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
        controller = { map, markersLayer };
        setMapController(controller);
      } catch (error) {
        console.warn('Posters map init failed', error);
      }
    };

    init();

    return () => {
      if (controller?.map) {
        controller.map.remove();
        setMapController(null);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapController) return;

    const handler = () => {
      loadPosters(mapController.map, mapController.markersLayer, searchQuery, filters);
    };

    mapController.map.on('moveend', handler);
    mapController.map.on('zoomend', handler);
    mapController.map.whenReady(handler);
    handler();

    return () => {
      mapController.map.off('moveend', handler);
      mapController.map.off('zoomend', handler);
    };
  }, [mapController, searchQuery, filters]);

  return (
    <div className="map-page">
      <div id={MAP_ELEMENT_ID} style={{ position: 'absolute', left: '0px', height: '100vh', width: '100%' }} />
      <div className={`map-search-floating ${isMoreFiltersOpen ? 'more-open' : ''}`.trim()}>
        <Search
          value={searchQuery}
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          filterMenuPlacement="top"
          moreFiltersFullscreen
          onMoreOpenChange={setIsMoreFiltersOpen}
        />
      </div>
      
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