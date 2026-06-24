import { logger } from '../lib/logger.js';
import type { RoadMetric } from './osrm.js';

type Point = { lat: number; lng: number };

/**
 * Real-time, traffic-aware road metrics from the TomTom Routing API
 * (motorcycle profile, live traffic). One `calculateRoute` request per
 * destination. Returns per-item `null` on failure so the caller falls back to
 * the straight-line estimate.
 */
export async function roadMetricsTomTom(
  origin: Point,
  destinations: Point[],
  apiKey: string,
): Promise<(RoadMetric | null)[]> {
  const fetchOne = async (d: Point): Promise<RoadMetric | null> => {
    const url =
      `https://api.tomtom.com/routing/1/calculateRoute/` +
      `${origin.lat},${origin.lng}:${d.lat},${d.lng}/json` +
      `?key=${encodeURIComponent(apiKey)}&travelMode=motorcycle&traffic=true`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = (await res.json()) as {
        routes?: { summary?: { lengthInMeters?: number; travelTimeInSeconds?: number } }[];
      };
      const summary = data.routes?.[0]?.summary;
      if (!summary?.lengthInMeters || summary.travelTimeInSeconds == null) return null;
      return {
        distanceKm: summary.lengthInMeters / 1000,
        durationMin: Math.round(summary.travelTimeInSeconds / 60),
        trafficAware: true,
      };
    } catch {
      return null;
    }
  };

  try {
    return await Promise.all(destinations.map(fetchOne));
  } catch (err) {
    logger.warn({ err }, 'TomTom routing failed; falling back');
    return destinations.map(() => null);
  }
}
