import { z } from 'zod';

/** `POST /api/merchants/register` - self-service supplier sign-up. */
export const registerSchema = z.object({
  ownerName: z.string().min(2).max(100),
  shopName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  kecamatan: z.string().min(1).max(100),
  kota: z.string().max(100).optional(),
  kabupaten: z.string().max(100).optional(),
  kodePos: z.string().max(10).optional(),
  phone: z.string().max(30).optional(),
  landmark: z.string().max(200).optional(),
});

/** `POST /api/merchants/login`. */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
