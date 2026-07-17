import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * Merchant gate backed by a real session token. The client presents the raw
 * token from login/register via `x-merchant-token`; only its sha256 hash is
 * stored server-side, so knowing a shop's email is NOT enough to mutate its
 * products. Loads the merchant onto res.locals.
 */
export async function requireMerchant(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header('x-merchant-token')?.trim();
    if (!token) throw ApiError.unauthorized('Silakan masuk terlebih dahulu.');
    const merchant = await prisma.merchant.findFirst({
      where: { sessionToken: sha256(token) },
    });
    if (!merchant) throw ApiError.unauthorized('Sesi tidak valid. Silakan masuk ulang.');
    res.locals.merchant = merchant;
    next();
  } catch (err) {
    next(err);
  }
}
