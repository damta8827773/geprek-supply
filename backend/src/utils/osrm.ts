import { logger } from '../lib/logger.js';

type Point = { lat: number; lng: number };

export interface RoadMetric {
  /** Real driving distance in km (along roads). */
  distanceKm: number;
  /** Real driving duration in minutes. */
  durationMin: number;
  /** true when the duration reflects live traffic (e.g. TomTom), not a fixed model. */
  trafficAware?: boolean;
}

/**
 * Real road distances & durations from one origin to many destinations using the
 * public OSRM "table" service (open-source, no API key). One HTTP call covers all
 * destinations. Returns `null` (or per-item `null`) on failure so the caller can
 * fall back to the straight-line Haversine estimate.
 */
export async function roadMetricsFromOrigin(
  origin: Point,
  destinations: Point[],
): Promise<(RoadMetric | null)[] | null> {
  if (destinations.length === 0) return [];

  const coords = [origin, ...destinations].map((p) => `${p.lng},${p.lat}`).join(';');
  const url =
    `https://router.project-osrm.org/table/v1/driving/${coords}` +
    `?sources=0&annotations=distance,duration`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = (await res.json()) as {
      code: string;
      distances?: number[][];
      durations?: number[][];
    };
    if (data.code !== 'Ok' || !data.distances?.[0] || !data.durations?.[0]) return null;

    const distRow = data.distances[0];
    const durRow = data.durations[0];
    // index 0 is the origin itself; destinations start at index 1.
    return destinations.map((_, i) => {
      const meters = distRow[i + 1];
      const seconds = durRow[i + 1];
      if (meters == null || seconds == null) return null;
      return { distanceKm: meters / 1000, durationMin: Math.round(seconds / 60) };
    });
  } catch (err) {
    logger.warn({ err }, 'OSRM routing failed; falling back to straight-line estimate');
    return null;
  }
}
