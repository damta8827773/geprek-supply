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

/** `PATCH /api/suppliers/:id` body - toggle or set stock availability. */
export const updateStockSchema = z.object({
  inStock: z.boolean(),
});

/** `GET /api/nearby?lat=..&lng=..&radius=..` - live shop lookup around a point. */
export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.2).max(10).default(3),
});

/** `GET /api/nearby-place?q=..&radius=..` - geocode a place then find shops around it. */
export const nearbyPlaceQuerySchema = z.object({
  q: z.string().min(2).max(200),
  radius: z.coerce.number().min(0.2).max(10).default(3),
});

export type RadiusQuery = z.infer<typeof radiusQuerySchema>;
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>;
export type NearbyPlaceQuery = z.infer<typeof nearbyPlaceQuerySchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
