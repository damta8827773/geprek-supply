import { z } from 'zod';

/** `POST /api/merchants/me/products` body. imageUrl is a small resized data URL. */
export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.coerce.number().int().min(0).default(0),
  unit: z.string().min(1).max(30).default('pcs'),
  stock: z.coerce.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  imageUrl: z.string().max(700000).optional(),
});

/** `PATCH /api/merchants/me/products/:id` body - any subset of the fields. */
export const updateProductSchema = createProductSchema.partial();

export const productIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
