import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Merchant } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env } from '../env.js';
import { ApiError } from '../utils/ApiError.js';
import { geocodePlace } from '../utils/geocode.js';
import { sendResetEmail } from '../lib/mailer.js';
import type {
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from '../schemas/merchant.schema.js';

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/** Strips secrets (password hash, tokens) before returning a merchant to the client. */
function toPublic(m: Merchant) {
  const { password: _pw, resetToken: _rt, sessionToken: _st, ...rest } = m;
  return rest;
}

/**
 * Issues a fresh random session token for a merchant. Only the sha256 hash is
 * stored; the raw token goes to the client and must accompany every
 * product-mutation request (x-merchant-token).
 */
async function issueSession(merchantId: number): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { sessionToken: sha256(token) },
  });
  return token;
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
  const token = await issueSession(merchant.id);
  return { ...toPublic(merchant), token };
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
    lat: m.lat,
    lng: m.lng,
    productCount: m._count.products,
    createdAt: m.createdAt,
  }));
}

/**
 * Updates a merchant's own profile. Re-geocodes when the address (kecamatan/
 * kota/kabupaten) changed, so the shop's products stay correctly placed on the map.
 */
export async function updateMerchantProfile(merchantId: number, input: UpdateProfileInput) {
  const current = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!current) throw ApiError.notFound('Akun toko tidak ditemukan.');

  const addressChanged =
    (input.kecamatan && input.kecamatan !== current.kecamatan) ||
    (input.kota !== undefined && input.kota !== current.kota) ||
    (input.kabupaten !== undefined && input.kabupaten !== current.kabupaten);

  let lat = current.lat;
  let lng = current.lng;
  if (addressChanged) {
    const area = [
      input.kecamatan ?? current.kecamatan,
      input.kota ?? input.kabupaten ?? current.kota ?? current.kabupaten,
      'Indonesia',
    ]
      .filter(Boolean)
      .join(', ');
    const geo = await geocodePlace(area);
    lat = geo?.lat ?? null;
    lng = geo?.lng ?? null;
  }

  const merchant = await prisma.merchant.update({
    where: { id: merchantId },
    data: { ...input, lat, lng },
  });
  return toPublic(merchant);
}

/** Changes a merchant's password after verifying the current one. */
export async function changeMerchantPassword(merchantId: number, input: ChangePasswordInput) {
  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  if (!merchant || !(await bcrypt.compare(input.currentPassword, merchant.password))) {
    throw ApiError.unauthorized('Kata sandi saat ini salah.');
  }
  const password = await bcrypt.hash(input.newPassword, 10);
  await prisma.merchant.update({ where: { id: merchantId }, data: { password } });
  return { ok: true };
}

/** Admin: permanently removes a shop and its products (cascade). */
export async function deleteMerchant(id: number) {
  const merchant = await prisma.merchant.findUnique({ where: { id } });
  if (!merchant) throw ApiError.notFound('Toko tidak ditemukan.');
  await prisma.merchant.delete({ where: { id } });
  return { id };
}

/** Verifies credentials with a constant-time bcrypt compare. */
export async function loginMerchant(input: LoginInput) {
  const email = input.email.trim().toLowerCase();
  const merchant = await prisma.merchant.findUnique({ where: { email } });
  if (!merchant || !(await bcrypt.compare(input.password, merchant.password))) {
    throw ApiError.unauthorized('Email atau kata sandi salah.');
  }
  const token = await issueSession(merchant.id);
  return { ...toPublic(merchant), token };
}

/**
 * Logs in a merchant by their Google email (prototype-level trust of the email
 * verified client-side by Firebase). New emails must register first.
 */
export async function googleLoginMerchant(email: string) {
  const normalized = email.trim().toLowerCase();
  const merchant = await prisma.merchant.findUnique({ where: { email: normalized } });
  if (!merchant) {
    throw ApiError.notFound('Email ini belum terdaftar sebagai toko. Silakan daftar dulu.');
  }
  const token = await issueSession(merchant.id);
  return { ...toPublic(merchant), token };
}

/**
 * Starts a password reset: stores a hashed one-hour token and emails a link.
 * Always returns the same shape so it does not reveal which emails exist. When
 * SMTP is unconfigured (dev), returns the link so it stays testable.
 */
export async function requestPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  const merchant = await prisma.merchant.findUnique({ where: { email: normalized } });
  if (!merchant) return { sent: false as boolean, devResetUrl: undefined as string | undefined };

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { resetToken: sha256(token), resetExpires: new Date(Date.now() + 60 * 60 * 1000) },
  });
  const resetUrl = `${env.APP_URL}/reset?email=${encodeURIComponent(normalized)}&token=${token}`;
  const sent = await sendResetEmail(normalized, resetUrl);
  return { sent, devResetUrl: !env.smtpConfigured && !env.isProd ? resetUrl : undefined };
}

/** Completes a reset: validates the token + expiry, then sets the new password. */
export async function resetPassword(email: string, token: string, newPassword: string) {
  const normalized = email.trim().toLowerCase();
  const merchant = await prisma.merchant.findUnique({ where: { email: normalized } });
  if (
    !merchant ||
    !merchant.resetToken ||
    !merchant.resetExpires ||
    merchant.resetExpires < new Date() ||
    merchant.resetToken !== sha256(token)
  ) {
    throw ApiError.badRequest('Token reset tidak valid atau sudah kedaluwarsa.');
  }
  const password = await bcrypt.hash(newPassword, 10);
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { password, resetToken: null, resetExpires: null },
  });
  return { ok: true };
}
