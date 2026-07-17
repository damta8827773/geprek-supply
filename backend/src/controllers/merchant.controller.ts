import type { Request, Response } from 'express';
import { loginMerchant, registerMerchant } from '../services/merchant.service.js';
import { logger } from '../lib/logger.js';
import type { LoginInput, RegisterInput } from '../schemas/merchant.schema.js';

/** POST /api/merchants/register */
export async function postRegister(req: Request, res: Response) {
  const merchant = await registerMerchant(req.body as RegisterInput);
  logger.info({ shopName: merchant.shopName, kecamatan: merchant.kecamatan }, 'merchant registered');
  res.status(201).json({ data: merchant });
}

/** POST /api/merchants/login */
export async function postLogin(req: Request, res: Response) {
  const merchant = await loginMerchant(req.body as LoginInput);
  res.json({ data: merchant });
}
