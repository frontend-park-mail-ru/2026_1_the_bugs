import { useEffect, useState } from '@my-react/hooks';
import styles from './OpenStreetMapPicker.module.css';

declare global {
  interface Window {
    L?: any;
  }
}

const MAP_ELEMENT_ID = 'create-poster-osm-map';

let leafletLoader: Promise<any> | null = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
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
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', () => reject(new Error('Leaflet load failed')));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Leaflet load failed'));
    document.body.appendChild(script);
  });

  return leafletLoader;
}

function formatShortAddress(rawData: any) {
  if (!rawData) return '';
  const address = rawData.address || rawData;

  const city = address?.city || address?.town || address?.village || address?.hamlet || address?.county;
  const district = address?.suburb || address?.district || address?.county;
  const street = address?.road || address?.pedestrian || address?.neighbourhood;
  const house = address?.house_number;
  const building = address?.building;

  const parts: string[] = [];
  if (city) parts.push(city);
  if (district && district !== city) parts.push(district);
  if (street) parts.push(street);
  if (house) parts.push(house);
  if (building) parts.push(building);

  if (parts.length === 0) {
    return rawData?.display_name || '';
  }

  return parts.join(', ');
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
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=ru&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Не удалось найти адрес');
  }

  const data = await response.json() as Array<{ lat: string; lon: string }>;
  if (data.length === 0) {
    return null;
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon)
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
}

export function OpenStreetMapPicker({ address, onPickAddress, onPickCoordinates }: OpenStreetMapPickerProps) {
  const [mapController, setMapController] = useState<MapController | null>(null);

  useEffect(() => {
    let localController: MapController | null = null;

    const init = async () => {
      try {
        const L = await loadLeaflet();
        const mapElement = document.getElementById(MAP_ELEMENT_ID);
        if (!mapElement) return;
        if (mapElement.innerHTML.trim()) return;

        const map = L.map(MAP_ELEMENT_ID).setView([55.751244, 37.618423], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        localController = {
          map,
          marker: null,
          L
        };
        setMapController(localController);

        map.on('click', async (e: any) => {
          const lat = e.latlng.lat;
          const lon = e.latlng.lng;
          onPickCoordinates(lat, lon);

          if (!localController) return;

          if (!localController.marker) {
            localController.marker = L.marker([lat, lon]).addTo(map);
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
    const query = address.trim();
    if (query.length < 5) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const point = await geocodeAddress(query);
        if (!point || cancelled) return;

        const { lat, lon } = point;
        if (!mapController.marker) {
          mapController.marker = mapController.L.marker([lat, lon]).addTo(mapController.map);
        } else {
          mapController.marker.setLatLng([lat, lon]);
        }
        mapController.map.setView([lat, lon], 16);
        onPickCoordinates(lat, lon);
      } catch (error) {
        console.warn('Address geocode failed', error);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address, mapController]);

  return (
    <div className={styles.wrapper}>
      <div id={MAP_ELEMENT_ID} className={styles.mapCanvas} />
    </div>
  );
}

