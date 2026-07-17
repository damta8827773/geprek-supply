import type { Request, Response } from 'express';
import {
  getSuppliersForRegion,
  listAllSuppliersByRegion,
  setSupplierStock,
} from '../services/supplier.service.js';
import { getNearbyShops } from '../services/nearby.service.js';
import { logger } from '../lib/logger.js';
import type { NearbyQuery, RadiusQuery, UpdateStockInput } from '../schemas/supplier.schema.js';

/** GET /api/nearby?lat=..&lng=..&radius=.. - real shops near a point (nationwide, live OSM). */
export async function getNearby(req: Request, res: Response) {
  const { lat, lng, radius } = req.query as unknown as NearbyQuery;
  const result = await getNearbyShops(lat, lng, radius);
  res.json({ data: result });
}

/** GET /api/regions/:key/suppliers?radius=15 */
export async function getRegionSuppliers(req: Request, res: Response) {
  const { key } = req.params as { key: string };
  const { radius } = req.query as unknown as RadiusQuery;
  const result = await getSuppliersForRegion(key, radius);
  res.json({ data: result });
}

/** GET /api/suppliers - full inventory grouped by region (admin dashboard). */
export async function getAllSuppliers(_req: Request, res: Response) {
  const data = await listAllSuppliersByRegion();
  res.json({ data });
}

/** PATCH /api/suppliers/:id - admin only. */
export async function patchSupplierStock(req: Request, res: Response) {
  const { id } = req.params as unknown as { id: number };
  const { inStock } = req.body as UpdateStockInput;
  const updated = await setSupplierStock(id, inStock);
  // Audit trail: who changed which supplier's stock to what (integrity/jejak audit).
  logger.info(
    { admin: req.header('x-admin-email'), supplierId: id, inStock },
    'admin stock mutation',
  );
  res.json({ data: updated });
}
