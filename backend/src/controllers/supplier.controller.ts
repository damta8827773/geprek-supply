import type { Request, Response } from 'express';
import {
  getSuppliersForRegion,
  listAllSuppliersByRegion,
  setSupplierStock,
} from '../services/supplier.service.js';
import type { RadiusQuery, UpdateStockInput } from '../schemas/supplier.schema.js';

/** GET /api/regions/:key/suppliers?radius=15 */
export async function getRegionSuppliers(req: Request, res: Response) {
  const { key } = req.params as { key: string };
  const { radius } = req.query as unknown as RadiusQuery;
  const result = await getSuppliersForRegion(key, radius);
  res.json({ data: result });
}

/** GET /api/suppliers — full inventory grouped by region (admin dashboard). */
export async function getAllSuppliers(_req: Request, res: Response) {
  const data = await listAllSuppliersByRegion();
  res.json({ data });
}

/** PATCH /api/suppliers/:id — admin only. */
export async function patchSupplierStock(req: Request, res: Response) {
  const { id } = req.params as unknown as { id: number };
  const { inStock } = req.body as UpdateStockInput;
  const updated = await setSupplierStock(id, inStock);
  res.json({ data: updated });
}
