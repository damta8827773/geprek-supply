import type { Region, Supplier } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { deliveryTier, estimateDeliveryCost, estimateEtaMinutes, haversineKm } from '../utils/geo.js';
import { roadMetricsFromOrigin, type RoadMetric } from '../utils/osrm.js';
import { roadMetricsTomTom } from '../utils/tomtom.js';
import { env } from '../env.js';
import { findRegionByKey } from './region.service.js';

/**
 * Enriches a raw supplier row with smart-routing metrics relative to a center.
 * When a real road metric (OSRM) is supplied, distance/ETA reflect actual roads
 * ("sesuai data maps"); otherwise it falls back to the straight-line estimate.
 */
function enrich(supplier: Supplier, center: { lat: number; lng: number }, road?: RoadMetric | null) {
  const straightKm = haversineKm(center.lat, center.lng, supplier.lat, supplier.lng);
  const distanceKm = road ? road.distanceKm : straightKm;
  // ETA: use the live traffic-aware duration when available (TomTom); otherwise
  // estimate from the road distance at motorbike speed.
  const etaMinutes = road?.trafficAware
    ? Math.max(5, road.durationMin)
    : estimateEtaMinutes(distanceKm);
  return {
    id: supplier.id,
    name: supplier.name,
    material: supplier.material,
    unit: supplier.unit,
    lat: supplier.lat,
    lng: supplier.lng,
    price: supplier.price,
    icon: supplier.icon,
    rating: supplier.rating,
    openHour: supplier.openHour,
    closeHour: supplier.closeHour,
    inStock: supplier.inStock,
    regionId: supplier.regionId,
    distanceKm: Number(distanceKm.toFixed(2)),
    deliveryCost: estimateDeliveryCost(distanceKm),
    deliveryTier: deliveryTier(distanceKm),
    etaMinutes,
    /** true when distance came from real road routing (OSRM/TomTom). */
    viaRoads: !!road,
    /** true when ETA reflects live traffic (TomTom). */
    viaTraffic: !!road?.trafficAware,
  };
}

export type EnrichedSupplier = ReturnType<typeof enrich>;

/**
 * Returns suppliers for a region, enriched with distance/delivery-cost/ETA, optionally
 * filtered to a search radius, and always sorted cheapest-first.
 */
export async function getSuppliersForRegion(regionKey: string, radiusKm?: number) {
  const region: Region | null = await findRegionByKey(regionKey);
  if (!region) {
    throw ApiError.notFound(`Region "${regionKey}" does not exist`);
  }

  const suppliers = await prisma.supplier.findMany({ where: { regionId: region.id } });
  const center = { lat: region.centerLat, lng: region.centerLng };

  // Filter by straight-line distance so the result matches the radius circle drawn on the map.
  const inRadius =
    typeof radiusKm === 'number'
      ? suppliers.filter((s) => haversineKm(center.lat, center.lng, s.lat, s.lng) <= radiusKm)
      : suppliers;

  // Real road distance & ETA for the in-radius set. Prefer TomTom (live traffic)
  // when a key is configured; otherwise OSRM (road distance, no live traffic).
  // Either falls back to the straight-line estimate per item on failure.
  const points = inRadius.map((s) => ({ lat: s.lat, lng: s.lng }));
  const road = env.TOMTOM_API_KEY
    ? await roadMetricsTomTom(center, points, env.TOMTOM_API_KEY)
    : await roadMetricsFromOrigin(center, points);

  // Group by material (alphabetical) then cheapest-first within each group.
  const enriched = inRadius
    .map((s, i) => enrich(s, center, road?.[i] ?? null))
    .sort((a, b) => a.material.localeCompare(b.material) || a.price - b.price);

  return {
    region: { id: region.id, key: region.key, name: region.name, center },
    radiusKm: radiusKm ?? null,
    count: enriched.length,
    suppliers: enriched,
  };
}

/** Flat list of every supplier (used by the admin dashboard), grouped by region. */
export async function listAllSuppliersByRegion() {
  const regions = await prisma.region.findMany({
    orderBy: { id: 'asc' },
    include: { suppliers: { orderBy: [{ material: 'asc' }, { price: 'asc' }] } },
  });

  return regions.map((r) => ({
    key: r.key,
    name: r.name,
    suppliers: r.suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      material: s.material,
      unit: s.unit,
      price: s.price,
      icon: s.icon,
      openHour: s.openHour,
      closeHour: s.closeHour,
      inStock: s.inStock,
    })),
  }));
}

/** Sets a supplier's stock availability. */
export async function setSupplierStock(id: number, inStock: boolean) {
  const exists = await prisma.supplier.findUnique({ where: { id } });
  if (!exists) {
    throw ApiError.notFound(`Supplier #${id} does not exist`);
  }
  return prisma.supplier.update({
    where: { id },
    data: { inStock },
    select: { id: true, name: true, inStock: true },
  });
}
