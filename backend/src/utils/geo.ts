/**
 * Geospatial helpers powering the "smart routing" radius search.
 */

const EARTH_RADIUS_KM = 6371;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two coordinates using the Haversine formula.
 * @returns distance in kilometres.
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// --- Gojek GoRide tariff (motorbike, Jabodetabek / "Zona II", 2025) ---
// Using the regulated lower-bound (batas bawah) rate. The whole Jabodetabek area
// shares one tariff, so cost depends on distance only - not on the kecamatan.
const GOJEK_RATE_PER_KM = 2550; // IDR per km (GoRide batas bawah, Zona II)
const GOJEK_MINIMUM_FARE = 10200; // IDR minimum (biaya jasa minimal 4 km pertama)

/** Estimated Gojek (GoRide) cost in IDR, rounded to Rp 100. */
export function estimateDeliveryCost(distanceKm: number): number {
  const raw = Math.max(GOJEK_MINIMUM_FARE, distanceKm * GOJEK_RATE_PER_KM);
  return Math.round(raw / 100) * 100;
}

export type DeliveryTier = 'low' | 'mid' | 'high';

/** Cost tier used for the colored badge in the UI. */
export function deliveryTier(distanceKm: number): DeliveryTier {
  if (distanceKm <= 4) return 'low'; // still within the minimum-fare band
  if (distanceKm <= 8) return 'mid';
  return 'high';
}

/** Estimated arrival time (minutes) for a motorbike courier (~24 km/h Jakarta city avg). */
export function estimateEtaMinutes(distanceKm: number): number {
  return Math.max(5, Math.round((distanceKm / 24) * 60));
}
