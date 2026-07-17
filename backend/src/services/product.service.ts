import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import type { CreateProductInput, UpdateProductInput } from '../schemas/product.schema.js';

/** Lists a merchant's own products, newest first. */
export function listProducts(merchantId: number) {
  return prisma.product.findMany({ where: { merchantId }, orderBy: { createdAt: 'desc' } });
}

export function createProduct(merchantId: number, data: CreateProductInput) {
  return prisma.product.create({ data: { ...data, merchantId } });
}

/** Ensures the product belongs to the merchant before mutating it. */
async function ownedOrThrow(merchantId: number, id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.merchantId !== merchantId) {
    throw ApiError.notFound('Produk tidak ditemukan.');
  }
  return product;
}

export async function updateProduct(merchantId: number, id: number, data: UpdateProductInput) {
  await ownedOrThrow(merchantId, id);
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(merchantId: number, id: number) {
  await ownedOrThrow(merchantId, id);
  await prisma.product.delete({ where: { id } });
  return { id };
}
