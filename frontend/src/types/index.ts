/** Mirrors the shapes returned by the backend API. */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Region {
  id: number;
  key: string;
  name: string;
  center: LatLng;
  supplierCount: number;
}

export type DeliveryTier = 'low' | 'mid' | 'high';

export interface Supplier {
  id: number;
  name: string;
  material: string;
  /** Selling unit / weight, e.g. "kg", "tabung 3 kg", "liter". */
  unit: string;
  lat: number;
  lng: number;
  price: number;
  icon: string;
  /** Optional product photo URL; falls back to a category emoji when absent. */
  imageUrl?: string | null;
  /** Supplier rating 0-5 (optional). */
  rating?: number | null;
  /** Opening / closing hour (0-23). */
  openHour: number;
  closeHour: number;
  inStock: boolean;
  regionId: number;
  distanceKm: number;
  /** Estimated Gojek (GoSend Instant) delivery cost in IDR. */
  deliveryCost: number;
  deliveryTier: DeliveryTier;
  /** Estimated arrival time in minutes. */
  etaMinutes: number;
  /** True when this came from a self-registered shop (not curated seed data). */
  registered?: boolean;
}

export interface RegionSuppliersResponse {
  region: { id: number; key: string; name: string; center: LatLng };
  radiusKm: number | null;
  count: number;
  suppliers: Supplier[];
}

/** A real shop/market near a point, from the live OpenStreetMap lookup. */
export interface NearbyShop {
  id: number;
  name: string;
  category: string;
  lat: number;
  lng: number;
  distanceKm: number;
  deliveryCost: number;
  deliveryTier: DeliveryTier;
  etaMinutes: number;
}

export interface NearbyResult {
  origin: LatLng;
  radiusKm: number;
  count: number;
  shops: NearbyShop[];
}

/** A registered shop owner (self-service supplier). No password on the client. */
export interface Merchant {
  id: number;
  ownerName: string;
  shopName: string;
  email: string;
  kecamatan: string;
  kota: string | null;
  kabupaten: string | null;
  kodePos: string | null;
  phone: string | null;
  landmark: string | null;
  createdAt: string;
  updatedAt: string;
  /** Raw session token returned on register/login; sent as x-merchant-token. */
  token?: string;
}

export interface RegisterPayload {
  ownerName: string;
  shopName: string;
  email: string;
  password: string;
  kecamatan: string;
  kota?: string;
  kabupaten?: string;
  kodePos?: string;
  phone?: string;
  landmark?: string;
}

/** Fields a signed-in merchant may edit on their own profile. */
export interface MerchantProfileInput {
  ownerName?: string;
  kecamatan?: string;
  kota?: string;
  kabupaten?: string;
  kodePos?: string;
  phone?: string;
  landmark?: string;
}

/** A product managed by a registered merchant from their dashboard. */
export interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  stock: number;
  inStock: boolean;
  imageUrl: string | null;
  merchantId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  price: number;
  unit: string;
  stock: number;
  inStock: boolean;
  imageUrl?: string;
}

/** Merchant summary shown in the admin dashboard. */
export interface MerchantSummary {
  id: number;
  ownerName: string;
  shopName: string;
  email: string;
  kecamatan: string;
  kota: string | null;
  kabupaten: string | null;
  kodePos: string | null;
  phone: string | null;
  landmark: string | null;
  lat: number | null;
  lng: number | null;
  productCount: number;
  createdAt: string;
}

export interface AdminSupplier {
  id: number;
  name: string;
  material: string;
  unit: string;
  price: number;
  icon: string;
  lat: number;
  lng: number;
  openHour: number;
  closeHour: number;
  inStock: boolean;
}

export interface AdminRegionGroup {
  key: string;
  name: string;
  suppliers: AdminSupplier[];
}
