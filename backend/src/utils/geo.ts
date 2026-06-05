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

/** Rough fuel cost estimate (IDR), assuming ~40 km/L and Rp 10.000/L, rounded to Rp 500. */
export function estimateFuelCost(distanceKm: number): number {
  const raw = (distanceKm / 40) * 10000;
  return Math.round(raw / 500) * 500;
}

/** Fuel-efficiency tier used for the colored badge in the UI. */
export function fuelTier(distanceKm: number): 'efficient' | 'normal' | 'thirsty' {
  if (distanceKm <= 3) return 'efficient';
  if (distanceKm <= 7) return 'normal';
  return 'thirsty';
}

/** Naive walking-steps estimate (~1312 steps per km) used as a fun stat. */
export function estimateSteps(distanceKm: number): number {
  return Math.round(distanceKm * 1312);
}
