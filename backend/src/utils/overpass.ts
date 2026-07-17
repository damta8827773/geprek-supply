import { logger } from '../lib/logger.js';

export type NearbyShop = {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
};

// Human-readable Indonesian labels for OSM shop tags.
const SHOP_LABEL: Record<string, string> = {
  convenience: 'Minimarket / Warung',
  supermarket: 'Supermarket',
  general: 'Toko Kelontong',
  grocery: 'Toko Kelontong',
  greengrocer: 'Toko Sayur & Buah',
  butcher: 'Toko Daging / Ayam',
  frozen_food: 'Frozen Food',
  kiosk: 'Kios',
  variety_store: 'Toko Serba Ada',
  food: 'Toko Makanan',
  bakery: 'Toko Roti',
  deli: 'Deli',
  farm: 'Toko Tani',
  wholesale: 'Grosir',
};

function labelFor(tags: Record<string, string>): string {
  if (tags.amenity === 'marketplace') return 'Pasar';
  return SHOP_LABEL[tags.shop] ?? 'Toko';
}

const SHOP_TYPES =
  'convenience|supermarket|general|grocery|greengrocer|butcher|frozen_food|kiosk|variety_store|food|bakery|deli|farm|wholesale';

/**
 * Real nearby shops/markets around a point, from the OpenStreetMap Overpass API
 * (free, no key). Returns only named places; failures yield an empty list.
 */
export async function fetchNearbyShops(
  lat: number,
  lng: number,
  radiusM: number,
): Promise<NearbyShop[]> {
  const q =
    `[out:json][timeout:25];(` +
    `node["shop"~"${SHOP_TYPES}"](around:${radiusM},${lat},${lng});` +
    `way["shop"~"${SHOP_TYPES}"](around:${radiusM},${lat},${lng});` +
    `node["amenity"="marketplace"](around:${radiusM},${lat},${lng});` +
    `way["amenity"="marketplace"](around:${radiusM},${lat},${lng});` +
    `);out center 80;`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Overpass rejects requests without a User-Agent (returns 406).
        'User-Agent': 'geprek-supply/1.0 (educational project)',
      },
      body: 'data=' + encodeURIComponent(q),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      elements?: {
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }[];
    };
    const out: NearbyShop[] = [];
    for (const e of data.elements ?? []) {
      const name = e.tags?.name;
      const la = e.lat ?? e.center?.lat;
      const ln = e.lon ?? e.center?.lon;
      if (!name || la == null || ln == null) continue;
      out.push({ id: e.id, name, category: labelFor(e.tags ?? {}), lat: la, lng: ln });
    }
    return out;
  } catch (err) {
    logger.warn({ err }, 'Overpass fetch failed');
    return [];
  }
}
