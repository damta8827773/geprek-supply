import { prisma } from '../lib/prisma.js';
import { deliveryTier, estimateDeliveryCost, estimateEtaMinutes, haversineKm } from '../utils/geo.js';

// Product ids are offset so they never collide with curated Supplier ids.
const PRODUCT_ID_OFFSET = 1_000_000;

/**
 * Registered-merchant products near a point, shaped like enriched suppliers so
 * the map/list can render them next to the curated ones. Only merchants that
 * were geocoded (have coordinates) are included.
 */
export async function getShopProductsNear(lat: number, lng: number, radiusKm: number) {
  const merchants = await prisma.merchant.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    include: { products: true },
  });

  const out = [];
  for (const m of merchants) {
    if (m.lat == null || m.lng == null) continue;
    const d = haversineKm(lat, lng, m.lat, m.lng);
    if (d > radiusKm) continue;
    for (const p of m.products) {
      out.push({
        id: PRODUCT_ID_OFFSET + p.id,
        name: m.shopName,
        material: p.name,
        unit: p.unit,
        lat: m.lat,
        lng: m.lng,
        price: p.price,
        icon: 'fa-store',
        imageUrl: p.imageUrl,
        rating: null as number | null,
        openHour: 0,
        closeHour: 24,
        inStock: p.inStock,
        regionId: 0,
        distanceKm: Number(d.toFixed(2)),
        deliveryCost: estimateDeliveryCost(d),
        deliveryTier: deliveryTier(d),
        etaMinutes: estimateEtaMinutes(d),
        registered: true,
      });
    }
  }

  out.sort((a, b) => a.material.localeCompare(b.material) || a.price - b.price);
  return out;
}
