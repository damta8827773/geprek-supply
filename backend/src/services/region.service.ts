import { prisma } from '../lib/prisma.js';

export async function listRegions() {
  const regions = await prisma.region.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      key: true,
      name: true,
      centerLat: true,
      centerLng: true,
      _count: { select: { suppliers: true } },
    },
  });

  return regions.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    center: { lat: r.centerLat, lng: r.centerLng },
    supplierCount: r._count.suppliers,
  }));
}

export async function findRegionByKey(key: string) {
  return prisma.region.findUnique({ where: { key } });
}
