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

export type FuelTier = 'efficient' | 'normal' | 'thirsty';

export interface Supplier {
  id: number;
  name: string;
  material: string;
  lat: number;
  lng: number;
  price: number;
  icon: string;
  inStock: boolean;
  regionId: number;
  distanceKm: number;
  fuelCost: number;
  fuelTier: FuelTier;
  steps: number;
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
  price: number;
  icon: string;
  inStock: boolean;
}

export interface AdminRegionGroup {
  key: string;
  name: string;
  suppliers: AdminSupplier[];
}
