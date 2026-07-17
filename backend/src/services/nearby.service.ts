import { deliveryTier, estimateDeliveryCost, estimateEtaMinutes, haversineKm } from '../utils/geo.js';
import { fetchNearbyShops } from '../utils/overpass.js';

/**
 * Returns real shops/markets near a coordinate (from OpenStreetMap), enriched
 * with straight-line distance, GoRide delivery cost, and ETA, sorted nearest-first.
 */
export async function getNearbyShops(lat: number, lng: number, radiusKm: number) {
  const shops = await fetchNearbyShops(lat, lng, Math.round(radiusKm * 1000));

  const enriched = shops
    .map((s) => {
      const distanceKm = haversineKm(lat, lng, s.lat, s.lng);
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        lat: s.lat,
        lng: s.lng,
        distanceKm: Number(distanceKm.toFixed(2)),
        deliveryCost: estimateDeliveryCost(distanceKm),
        deliveryTier: deliveryTier(distanceKm),
        etaMinutes: estimateEtaMinutes(distanceKm),
      };
    })
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return { origin: { lat, lng }, radiusKm, count: enriched.length, shops: enriched };
}
