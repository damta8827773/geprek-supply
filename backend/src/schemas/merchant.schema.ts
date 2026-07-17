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

/** `POST /api/merchants/google` - sign in with a Google email. */
export const googleSchema = z.object({
  email: z.string().email(),
});

/** `POST /api/merchants/forgot-password`. */
export const forgotSchema = z.object({
  email: z.string().email(),
});

/** `POST /api/merchants/reset-password`. */
export const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(6).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;
export type GoogleInput = z.infer<typeof googleSchema>;
