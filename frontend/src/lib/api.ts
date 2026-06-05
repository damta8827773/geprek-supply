import type {
  AdminRegionGroup,
  Region,
  RegionSuppliersResponse,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

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
      /* non-JSON error body — keep default message */
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

  setSupplierStock: (id: number, inStock: boolean, adminEmail: string) =>
    request<{ id: number; name: string; inStock: boolean }>(`/suppliers/${id}`, {
      method: 'PATCH',
      headers: { 'x-admin-email': adminEmail },
      body: JSON.stringify({ inStock }),
    }),
};
