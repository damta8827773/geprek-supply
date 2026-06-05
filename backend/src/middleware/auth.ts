import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Minimal admin gate for stock-mutation endpoints.
 *
 * The dashboard sends the signed-in admin's email via the `x-admin-email`
 * header; the server is the single source of truth and rejects anything that
 * does not match ADMIN_EMAIL. This keeps the authorization decision server-side
 * rather than trusting the client UI alone.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const email = req.header('x-admin-email')?.trim().toLowerCase();
  if (!email) {
    next(ApiError.unauthorized('Missing admin credentials'));
    return;
  }
  if (email !== env.ADMIN_EMAIL.toLowerCase()) {
    next(ApiError.forbidden('You are not authorized to perform this action'));
    return;
  }
  next();
}
