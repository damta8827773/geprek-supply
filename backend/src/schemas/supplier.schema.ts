import { z } from 'zod';

/** `GET /api/regions/:key/suppliers?radius=15` */
export const radiusQuerySchema = z.object({
  radius: z.coerce.number().positive().max(50).optional(),
});

/** `:key` path param for region lookups. */
export const regionKeyParamsSchema = z.object({
  key: z.string().min(1),
});

/** `:id` path param for supplier mutations. */
export const supplierIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** `PATCH /api/suppliers/:id` body — toggle or set stock availability. */
export const updateStockSchema = z.object({
  inStock: z.boolean(),
});

export type RadiusQuery = z.infer<typeof radiusQuerySchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
