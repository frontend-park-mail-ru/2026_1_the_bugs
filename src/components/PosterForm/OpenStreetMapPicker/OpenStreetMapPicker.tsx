import { useEffect, useState } from 'the-react/hooks';
import styles from './OpenStreetMapPicker.module.css';

const MAP_ELEMENT_ID = 'create-poster-osm-map';

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

export interface LeafletAddressSuggestion {
  fullAddress: string;
  city?: string;
  district?: string;
  street?: string;
  house?: string;
}

function buildAddressSuggestion(rawData: any): LeafletAddressSuggestion {
  const address = rawData?.address || rawData || {};

  const city = address.city || address.town || address.village || address.hamlet || address.county;
  const district = address.suburb || address.city_district || address.district || address.state_district;
  const street = address.road || address.pedestrian || address.neighbourhood;
  const house = address.house_number || address.building;

  const parts: string[] = [];
  if (city) parts.push(city);
  if (district && district !== city) parts.push(district);
  if (street) {
    parts.push(house ? `${street}, ${house}` : street);
  } else if (house) {
    parts.push(house);
  }

  return {
    fullAddress: parts.length ? parts.join(', ') : rawData?.display_name || '',
    city: city || undefined,
    district: district || undefined,
    street: street || undefined,
    house: house || undefined
  };
}

function formatShortAddress(rawData: any) {
  return buildAddressSuggestion(rawData).fullAddress;
}

async function reverseGeocode(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=ru&lat=${lat.toString()}&lon=${lon.toString()}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Не удалось получить адрес по точке');
  }
  const data = await response.json();
  return formatShortAddress(data);
}

async function geocodeAddress(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=ru&addressdetails=1&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Не удалось найти адрес');
  }

  const data = await response.json() as Array<{ lat: string; lon: string; display_name?: string; address?: Record<string, string> }>;
  if (data.length === 0) {
    return null;
  }

  const first = data[0];
  return {
    lat: Number(first.lat),
    lon: Number(first.lon),
    suggestion: buildAddressSuggestion(first)
  };
}

interface MapController {
  map: any;
  marker: any | null;
  L: any;
}

interface OpenStreetMapPickerProps {
  address: string;
  onPickAddress: (address: string) => void;
  onPickCoordinates: (latitude: number, longitude: number) => void;
  onResolveTypedAddress?: (query: string, suggestion: LeafletAddressSuggestion | null) => void;
}

function createPinkMarkerIcon(L: any) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41" fill="none">
      <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 22 12.5 41 12.5 41C12.5 41 25 22 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="#f08dcc"/>
      <circle cx="12.5" cy="12" r="4" fill="#ffffff"/>
    </svg>
  `;

  const iconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return L.icon({
    iconUrl,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });
}

export function OpenStreetMapPicker({ address, onPickAddress, onPickCoordinates, onResolveTypedAddress }: OpenStreetMapPickerProps) {
  const [mapController, setMapController] = useState<MapController | null>(null);

  useEffect(() => {
    let localController: MapController | null = null;

    const init = async () => {
      try {
        const L = await loadLeaflet();
        const mapElement = document.getElementById(MAP_ELEMENT_ID);
        if (!mapElement) return;
        if (mapElement.innerHTML.trim()) return;

        const map = L.map(MAP_ELEMENT_ID, {
          attributionControl: false
        }).setView([55.751244, 37.618423], 12);
        map.zoomControl.setPosition('topleft');
        const markerIcon = createPinkMarkerIcon(L);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        localController = {
          map,
          marker: null,
          L
        };
        setMapController(localController);

        // If initial coordinates provided via props, set marker + view
        // try {
        //   const initCoords = (window as any).__INITIAL_OSM_COORDS__;
        //   // prefer prop-driven initialCoordinates if provided; otherwise none
        // } catch (err) {
        //   // noop
        // }

        map.on('click', async (e: any) => {
          const lat = e.latlng.lat;
          const lon = e.latlng.lng;
          onPickCoordinates(lat, lon);

          if (!localController) return;

          if (!localController.marker) {
            localController.marker = L.marker([lat, lon], { icon: markerIcon }).addTo(map);
          } else {
            localController.marker.setLatLng([lat, lon]);
          }

          try {
            const address = await reverseGeocode(lat, lon);
            onPickAddress(address);
          } catch (error) {
            console.warn('Reverse geocode failed', error);
          }
        });
      } catch (error) {
        console.warn('Leaflet init failed', error);
      }
    };

    init();

    return () => {
      if (localController?.map) {
        localController.map.remove();
      }
      setMapController(null);
    };
  }, []);

  useEffect(() => {
    if (!mapController) return;
    const raw: any = (window as any).__INITIAL_OSM_COORDS__;
    if (!raw || typeof raw.lat !== 'number' || typeof raw.lon !== 'number') return;

    const lat = raw.lat;
    const lon = raw.lon;
    const markerIcon = createPinkMarkerIcon(mapController.L);
    if (!mapController.marker) {
      mapController.marker = mapController.L.marker([lat, lon], { icon: markerIcon }).addTo(mapController.map);
    } else {
      mapController.marker.setLatLng([lat, lon]);
    }
    mapController.map.setView([lat, lon], 16);
    (async () => {
      try {
        const address = await reverseGeocode(lat, lon);
        onPickAddress(address);
        onPickCoordinates(lat, lon);
      } catch {
        // ignore
      }
    })();
  }, [mapController]);

  useEffect(() => {
    if (!mapController) return;
    const query = address.trim();
    if (query.length < 5) {
      onResolveTypedAddress?.(query, null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const point = await geocodeAddress(query);
        if (cancelled) return;

        if (!point) {
          onResolveTypedAddress?.(query, null);
          return;
        }

        const { lat, lon, suggestion } = point;
        const markerIcon = createPinkMarkerIcon(mapController.L);
        if (!mapController.marker) {
          mapController.marker = mapController.L.marker([lat, lon], { icon: markerIcon }).addTo(mapController.map);
        } else {
          mapController.marker.setLatLng([lat, lon]);
        }
        mapController.map.setView([lat, lon], 16);
        onPickCoordinates(lat, lon);
        onResolveTypedAddress?.(query, suggestion);
      } catch (error) {
        onResolveTypedAddress?.(query, null);
        console.warn('Address geocode failed', error);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address, mapController, onResolveTypedAddress]);

  return (
    <div className={styles.wrapper}>
      <div id={MAP_ELEMENT_ID} className={styles.mapCanvas} />
    </div>
  );
}

