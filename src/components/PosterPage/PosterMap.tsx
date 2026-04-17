import { useEffect } from 'the-react/hooks';
import shared from './PosterCard.module.css';
import styles from './PosterMap.module.css';

const MAP_ELEMENT_ID = 'poster-page-osm-map';

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

interface PosterMapProps {
  latitude: number;
  longitude: number;
  address: string;
}

export function PosterMap({ latitude, longitude, address }: PosterMapProps) {
  useEffect(() => {
    let mapController: { map: any } | null = null;

    const init = async () => {
      try {
        const L = await loadLeaflet();
        const mapElement = document.getElementById(MAP_ELEMENT_ID);
        if (!mapElement) return;
        if (mapElement.innerHTML.trim()) return;

        const map = L.map(MAP_ELEMENT_ID, { attributionControl: false, zoomControl: true }).setView([latitude, longitude], 16);
        map.zoomControl.setPosition('topright');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const markerIcon = createPinkMarkerIcon(L);
        L.marker([latitude, longitude], { icon: markerIcon }).addTo(map);
        mapController = { map };
      } catch (error) {
        console.warn('Poster map init failed', error);
      }
    };

    init();

    return () => {
      if (mapController?.map) {
        mapController.map.remove();
      }
    };
  }, [latitude, longitude]);

  return (
    <section className={`${shared.card} ${styles.mapCard}`}>
      <div id={MAP_ELEMENT_ID} className={styles.mapCanvas} aria-label={`Карта: ${address}`} />
    </section>
  );
}

