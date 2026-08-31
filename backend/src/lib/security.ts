import type { Request } from 'express';
import { prisma } from './prisma.js';
import { logger } from './logger.js';

export type SecurityEventType =
  | 'ADMIN_AUTH_FAIL'
  | 'MERCHANT_LOGIN_FAIL'
  | 'MERCHANT_TOKEN_INVALID'
  | 'MERCHANT_REGISTER_CONFLICT'
  | 'CHAT_SESSION_INVALID';

/**
 * Records a security-relevant event (failed auth, invalid token, etc.) so the
 * admin can see who is probing the system. Best-effort: a logging failure
 * must never break the request that triggered it.
 */
export async function logSecurityEvent(type: SecurityEventType, detail: string, req?: Request) {
  try {
    const ip = req?.ip ?? req?.socket?.remoteAddress ?? null;
    await prisma.securityEvent.create({ data: { type, detail, ip } });
  } catch (err) {
    logger.warn({ err, type, detail }, 'failed to record security event');
  }
}
