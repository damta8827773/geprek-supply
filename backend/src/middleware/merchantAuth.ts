import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Prototype-level merchant gate. Trusts the `x-merchant-email` header (same
 * trust model as the admin email gate) and loads the merchant onto res.locals.
 * For production this should be a real session/JWT.
 */
export async function requireMerchant(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.header('x-merchant-email')?.trim().toLowerCase();
    if (!email) throw ApiError.unauthorized('Silakan masuk terlebih dahulu.');
    const merchant = await prisma.merchant.findUnique({ where: { email } });
    if (!merchant) throw ApiError.unauthorized('Akun toko tidak ditemukan.');
    res.locals.merchant = merchant;
    next();
  } catch (err) {
    next(err);
  }
}
