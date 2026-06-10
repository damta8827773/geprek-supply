import { useEffect, useMemo, useRef } from 'react';
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  type MapRef,
} from '@/components/ui/mapcn-map-route';
import { useUiStore } from '@/store/uiStore';
import type { LatLng, Supplier } from '@/types';

const BRAND = '#ea580c';
const KM_PER_LAT_DEG = 110.574;
const KM_PER_LNG_DEG = 111.32;

/** Build a closed ring of [lng,lat] points approximating a circle (for the radius). */
function circleRing(center: LatLng, radiusKm: number, points = 72): [number, number][] {
  const latR = radiusKm / KM_PER_LAT_DEG;
  const lngR = radiusKm / (KM_PER_LNG_DEG * Math.cos((center.lat * Math.PI) / 180));
  const ring: [number, number][] = [];
  for (let i = 0; i <= points; i += 1) {
    const a = (i / points) * 2 * Math.PI;
    ring.push([center.lng + lngR * Math.cos(a), center.lat + latR * Math.sin(a)]);
  }
  return ring;
}

interface MapViewProps {
  center: LatLng;
  radiusKm: number;
  suppliers: Supplier[];
  focus: LatLng | null;
  mainStoreLabel: string;
}

export default function MapView({
  center,
  radiusKm,
  suppliers,
  focus,
  mainStoreLabel,
}: MapViewProps) {
  const theme = useUiStore((s) => s.theme);
  const mapRef = useRef<MapRef>(null);

  const ring = useMemo(() => circleRing(center, radiusKm), [center, radiusKm]);

  // Fit the viewport to the search radius whenever the region or radius changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const latR = radiusKm / KM_PER_LAT_DEG;
    const lngR = radiusKm / (KM_PER_LNG_DEG * Math.cos((center.lat * Math.PI) / 180));
    map.fitBounds(
      [
        [center.lng - lngR, center.lat - latR],
        [center.lng + lngR, center.lat + latR],
      ],
      { padding: 60, duration: 800 },
    );
  }, [center.lat, center.lng, radiusKm]);

  // Fly to a supplier when its card is selected.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo({ center: [focus.lng, focus.lat], zoom: 14, duration: 800 });
  }, [focus]);

  const isFocused = (s: Supplier) =>
    !!focus && Math.abs(focus.lat - s.lat) < 1e-9 && Math.abs(focus.lng - s.lng) < 1e-9;

  return (
    <Map
      ref={mapRef}
      theme={theme}
      center={[center.lng, center.lat]}
      zoom={12}
      className="h-full w-full"
    >
      <MapControls showZoom showCompass showFullscreen position="bottom-right" />

      {/* Search-radius ring */}
      <MapRoute
        id="radius-ring"
        coordinates={ring}
        color={BRAND}
        width={2}
        opacity={0.7}
        dashArray={[2, 2]}
        interactive={false}
      />

      {/* Routing lines from the store to each in-stock supplier */}
      {suppliers
        .filter((s) => s.inStock)
        .map((s) => (
          <MapRoute
            key={`route-${s.id}`}
            id={`route-${s.id}`}
            coordinates={[
              [center.lng, center.lat],
              [s.lng, s.lat],
            ]}
            color={isFocused(s) ? BRAND : '#94a3b8'}
            width={isFocused(s) ? 4 : 1.5}
            opacity={isFocused(s) ? 0.9 : 0.5}
            interactive={false}
          />
        ))}

      {/* Main store marker */}
      <MapMarker longitude={center.lng} latitude={center.lat}>
        <MarkerContent>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900">
            <i className="fa-solid fa-store text-xs" />
          </div>
          <MarkerLabel position="top" className="rounded bg-slate-900/80 px-1 text-white">
            {mainStoreLabel}
          </MarkerLabel>
        </MarkerContent>
      </MapMarker>

      {/* Supplier markers */}
      {suppliers.map((s) => (
        <MapMarker key={s.id} longitude={s.lng} latitude={s.lat}>
          <MarkerContent>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-white shadow-md ${
                s.inStock ? 'geprek-pulse bg-brand' : 'bg-red-500'
              }`}
            >
              <i className={`fa-solid ${s.icon} text-[10px]`} />
            </div>
          </MarkerContent>
          <MarkerPopup closeButton>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.material}</p>
          </MarkerPopup>
        </MapMarker>
      ))}
    </Map>
  );
}
