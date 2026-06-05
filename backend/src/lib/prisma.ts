import { PrismaClient } from '@prisma/client';

/**
 * Single shared PrismaClient instance. Re-used across hot reloads in dev so we
 * don't exhaust the connection pool.
 */
export const prisma = new PrismaClient();
