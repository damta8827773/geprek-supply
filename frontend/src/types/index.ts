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
}

export interface RegionSuppliersResponse {
  region: { id: number; key: string; name: string; center: LatLng };
  radiusKm: number | null;
  count: number;
  suppliers: Supplier[];
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
