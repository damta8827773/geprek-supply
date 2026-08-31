import { timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';
import { ApiError } from '../utils/ApiError.js';

/** Constant-time string comparison - avoids leaking secrets via timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Admin gate for stock-mutation endpoints.
 *
 * The dashboard sends the signed-in admin's email via the `x-admin-email`
 * header; the server is the single source of truth and rejects anything that
 * does not match ADMIN_EMAIL. This keeps the authorization decision server-side
 * rather than trusting the client UI alone.
 *
 * When ADMIN_TOKEN is configured, a matching `x-admin-token` header is ALSO
 * required (a shared-secret second factor), so knowing the email is no longer
 * enough. Left unset in the prototype for a simpler demo.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const email = req.header('x-admin-email')?.trim().toLowerCase();
  if (!email) {
    next(ApiError.unauthorized('Missing admin credentials'));
    return;
  }
  if (!env.adminEmails.some((allowed) => safeEqual(email, allowed))) {
    next(ApiError.forbidden('You are not authorized to perform this action'));
    return;
  }
  if (env.ADMIN_TOKEN) {
    const token = req.header('x-admin-token') ?? '';
    if (!safeEqual(token, env.ADMIN_TOKEN)) {
      next(ApiError.unauthorized('Invalid or missing admin token'));
      return;
    }
  }
  next();
}
