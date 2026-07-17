import bcrypt from 'bcryptjs';
import type { Merchant } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import type { LoginInput, RegisterInput } from '../schemas/merchant.schema.js';

/** Strips the password hash before returning a merchant to the client. */
function toPublic(m: Merchant) {
  const { password: _pw, ...rest } = m;
  return rest;
}

/**
 * Registers a shop. Email and shopName are unique so one record is always
 * found directly (no duplicate names) - the caller gets a clear 409 on clash.
 */
export async function registerMerchant(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();
  const shopName = input.shopName.trim();

  const [emailTaken, shopTaken] = await Promise.all([
    prisma.merchant.findUnique({ where: { email } }),
    prisma.merchant.findUnique({ where: { shopName } }),
  ]);
  if (emailTaken) throw ApiError.conflict('Email sudah terdaftar.');
  if (shopTaken) throw ApiError.conflict('Nama toko sudah dipakai, pilih nama lain.');

  const password = await bcrypt.hash(input.password, 10);
  const merchant = await prisma.merchant.create({
    data: { ...input, email, shopName, password },
  });
  return toPublic(merchant);
}

/** Verifies credentials with a constant-time bcrypt compare. */
export async function loginMerchant(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const merchant = await prisma.merchant.findUnique({ where: { email } });
  if (!merchant || !(await bcrypt.compare(input.password, merchant.password))) {
    throw ApiError.unauthorized('Email atau kata sandi salah.');
  }
  return toPublic(merchant);
}
