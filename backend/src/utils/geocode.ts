import { logger } from '../lib/logger.js';

/**
 * Geocodes a place name to coordinates using OpenStreetMap Nominatim
 * (free, no key). Returns null on failure or no match.
 */
export async function geocodePlace(q: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=id`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'geprek-supply/1.0 (educational project)' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
  } catch (err) {
    logger.warn({ err }, 'Nominatim geocode failed');
    return null;
  }
}
