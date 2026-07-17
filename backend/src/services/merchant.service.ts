import bcrypt from 'bcryptjs';
import type { Merchant } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { geocodePlace } from '../utils/geocode.js';
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
  // Best-effort geocode so the shop's products can appear on the map.
  const area = [input.kecamatan, input.kota ?? input.kabupaten, 'Indonesia']
    .filter(Boolean)
    .join(', ');
  const geo = await geocodePlace(area);
  const merchant = await prisma.merchant.create({
    data: { ...input, email, shopName, password, lat: geo?.lat ?? null, lng: geo?.lng ?? null },
  });
  return toPublic(merchant);
}

/** Lists all registered merchants with their product counts (for the admin view). */
export async function listMerchants() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  });
  return merchants.map((m) => ({
    id: m.id,
    ownerName: m.ownerName,
    shopName: m.shopName,
    email: m.email,
    kecamatan: m.kecamatan,
    kota: m.kota,
    kabupaten: m.kabupaten,
    kodePos: m.kodePos,
    phone: m.phone,
    landmark: m.landmark,
    productCount: m._count.products,
    createdAt: m.createdAt,
  }));
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
