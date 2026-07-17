import type { Merchant } from '@prisma/client';
import type { Request, Response } from 'express';
import {
  listMerchants,
  loginMerchant,
  registerMerchant,
  requestPasswordReset,
  resetPassword,
} from '../services/merchant.service.js';
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../services/product.service.js';
import { logger } from '../lib/logger.js';
import type {
  ForgotInput,
  LoginInput,
  RegisterInput,
  ResetInput,
} from '../schemas/merchant.schema.js';
import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema.js';

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

/** POST /api/merchants/forgot-password - emails a reset link. */
export async function postForgot(req: Request, res: Response) {
  const { email } = req.body as ForgotInput;
  const result = await requestPasswordReset(email);
  res.json({ data: { message: 'Jika email terdaftar, link reset telah dikirim.', ...result } });
}

/** POST /api/merchants/reset-password - sets a new password with a valid token. */
export async function postReset(req: Request, res: Response) {
  const { email, token, password } = req.body as ResetInput;
  await resetPassword(email, token, password);
  res.json({ data: { ok: true } });
}

/** GET /api/merchants - all registered merchants (admin view). */
export async function getMerchants(_req: Request, res: Response) {
  res.json({ data: await listMerchants() });
}

/** GET /api/merchants/me/products - the signed-in merchant's own products. */
export async function getMyProducts(_req: Request, res: Response) {
  const merchant = res.locals.merchant as Merchant;
  res.json({ data: await listProducts(merchant.id) });
}

/** POST /api/merchants/me/products */
export async function postMyProduct(req: Request, res: Response) {
  const merchant = res.locals.merchant as Merchant;
  const product = await createProduct(merchant.id, req.body as CreateProductInput);
  res.status(201).json({ data: product });
}

/** PATCH /api/merchants/me/products/:id */
export async function patchMyProduct(req: Request, res: Response) {
  const merchant = res.locals.merchant as Merchant;
  const { id } = req.params as unknown as { id: number };
  const product = await updateProduct(merchant.id, id, req.body as UpdateProductInput);
  res.json({ data: product });
}

/** DELETE /api/merchants/me/products/:id */
export async function deleteMyProduct(req: Request, res: Response) {
  const merchant = res.locals.merchant as Merchant;
  const { id } = req.params as unknown as { id: number };
  res.json({ data: await deleteProduct(merchant.id, id) });
}
