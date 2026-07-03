import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  // One or more admin emails allowed to mutate stock (comma-separated).
  ADMIN_EMAIL: z.string().min(1).default('admin@example.com'),
  // Optional: enables real-time, traffic-aware ETA via TomTom Routing.
  // When empty, the app falls back to OSRM (road distance, no live traffic).
  TOMTOM_API_KEY: z.string().optional(),
  // Optional second factor for admin mutations. When set, the admin must also
  // send a matching `x-admin-token` header (email alone is no longer enough).
  // Leave empty to keep the simple email gate (prototype default).
  ADMIN_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === 'production',
  corsOrigins: parsed.data.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  // Normalised list of authorised admin emails (lower-cased, comma-separated).
  adminEmails: parsed.data.ADMIN_EMAIL.split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};
