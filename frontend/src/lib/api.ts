import type {
  AdminRegionGroup,
  Merchant,
  MerchantSummary,
  NearbyResult,
  Product,
  ProductInput,
  Region,
  RegionSuppliersResponse,
  RegisterPayload,
  Supplier,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
// Optional shared-secret second factor for admin writes. Sent only when set,
// and must match the backend's ADMIN_TOKEN. Unset in the prototype (email gate).
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN as string | undefined;

interface ApiEnvelope<T> {
  data: T;
}

interface ApiErrorBody {
  error?: { message?: string };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    // Spread headers AFTER `...init` so the Content-Type isn't clobbered by
    // init.headers (which only carries auth headers).
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as ApiErrorBody;
      if (body.error?.message) message = body.error.message;
    } catch {
      /* non-JSON error body - keep default message */
    }
    throw new Error(message);
  }

  const body = (await res.json()) as ApiEnvelope<T>;
  return body.data;
}

export const api = {
  getRegions: () => request<Region[]>('/regions'),

  getRegionSuppliers: (key: string, radiusKm?: number) => {
    const qs = typeof radiusKm === 'number' ? `?radius=${radiusKm}` : '';
    return request<RegionSuppliersResponse>(`/regions/${key}/suppliers${qs}`);
  },

  getAllSuppliers: () => request<AdminRegionGroup[]>('/suppliers'),

  getNearby: (lat: number, lng: number, radiusKm: number) =>
    request<NearbyResult>(`/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}`),

  getNearbyByPlace: (q: string, radiusKm: number) =>
    request<NearbyResult>(`/nearby-place?q=${encodeURIComponent(q)}&radius=${radiusKm}`),

  getShopProductsNear: (lat: number, lng: number, radiusKm: number) =>
    request<Supplier[]>(`/shop-products?lat=${lat}&lng=${lng}&radius=${radiusKm}`),

  registerMerchant: (payload: RegisterPayload) =>
    request<Merchant>('/merchants/register', { method: 'POST', body: JSON.stringify(payload) }),

  loginMerchant: (email: string, password: string) =>
    request<Merchant>('/merchants/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; sent: boolean; devResetUrl?: string }>(
      '/merchants/forgot-password',
      { method: 'POST', body: JSON.stringify({ email }) },
    ),

  resetPassword: (email: string, token: string, password: string) =>
    request<{ ok: boolean }>('/merchants/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, password }),
    }),

  // --- Merchant product management (identified by the merchant's email) ---
  getMyProducts: (email: string) =>
    request<Product[]>('/merchants/me/products', { headers: { 'x-merchant-email': email } }),

  createProduct: (email: string, payload: ProductInput) =>
    request<Product>('/merchants/me/products', {
      method: 'POST',
      headers: { 'x-merchant-email': email },
      body: JSON.stringify(payload),
    }),

  updateProduct: (email: string, id: number, payload: Partial<ProductInput>) =>
    request<Product>(`/merchants/me/products/${id}`, {
      method: 'PATCH',
      headers: { 'x-merchant-email': email },
      body: JSON.stringify(payload),
    }),

  deleteProduct: (email: string, id: number) =>
    request<{ id: number }>(`/merchants/me/products/${id}`, {
      method: 'DELETE',
      headers: { 'x-merchant-email': email },
    }),

  listMerchants: (adminEmail: string) =>
    request<MerchantSummary[]>('/merchants', { headers: { 'x-admin-email': adminEmail } }),

  setSupplierStock: (id: number, inStock: boolean, adminEmail: string) =>
    request<{ id: number; name: string; inStock: boolean }>(`/suppliers/${id}`, {
      method: 'PATCH',
      headers: {
        'x-admin-email': adminEmail,
        ...(ADMIN_TOKEN ? { 'x-admin-token': ADMIN_TOKEN } : {}),
      },
      body: JSON.stringify({ inStock }),
    }),
};
