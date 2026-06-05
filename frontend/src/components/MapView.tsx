import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLng, Supplier } from '@/types';
import { useUiStore } from '@/store/uiStore';

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const BRAND = '#ea580c';

function divIcon(html: string, size: number) {
  return L.divIcon({
    html,
    className: 'geprek-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const centerIcon = divIcon(
  `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:#1e293b;color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"><i class="fa-solid fa-store" style="font-size:12px"></i></div>`,
  32,
);

function supplierIcon(s: Supplier) {
  const bg = s.inStock ? BRAND : '#ef4444';
  return divIcon(
    `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:${bg};color:#fff;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.35)"><i class="fa-solid ${s.icon}" style="font-size:11px"></i></div>`,
    26,
  );
}

interface MapViewProps {
  center: LatLng;
  radiusKm: number;
  suppliers: Supplier[];
  focus: LatLng | null;
  mainStoreLabel: string;
}

/** Imperatively reacts to center/radius/focus changes. */
function MapController({
  center,
  radiusKm,
  focus,
}: {
  center: LatLng;
  radiusKm: number;
  focus: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    const circle = L.circle([center.lat, center.lng], { radius: radiusKm * 1000 });
    map.flyToBounds(circle.getBounds(), { padding: [40, 40], duration: 0.6 });
  }, [map, center.lat, center.lng, radiusKm]);

  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], 15, { duration: 0.6 });
  }, [map, focus]);

  return null;
}

export default function MapView({
  center,
  radiusKm,
  suppliers,
  focus,
  mainStoreLabel,
}: MapViewProps) {
  const theme = useUiStore((s) => s.theme);
  const tileUrl = theme === 'dark' ? TILES.dark : TILES.light;

  const markers = useMemo(
    () =>
      suppliers.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={supplierIcon(s)}>
          <Popup>
            <strong>{s.name}</strong>
            <br />
            {s.material}
          </Popup>
        </Marker>
      )),
    [suppliers],
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer key={theme} url={tileUrl} />
      <Circle
        center={[center.lat, center.lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: BRAND, fillColor: BRAND, fillOpacity: 0.08, weight: 2, dashArray: '5,5' }}
      />
      <Marker position={[center.lat, center.lng]} icon={centerIcon}>
        <Popup>
          <strong>{mainStoreLabel}</strong>
        </Popup>
      </Marker>
      {markers}
      <MapController center={center} radiusKm={radiusKm} focus={focus} />
    </MapContainer>
  );
}
