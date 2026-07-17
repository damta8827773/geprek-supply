// Indonesian administrative regions (34 provinces -> ~514 regencies -> ~7,285
// kecamatan) from the free emsifa "api-wilayah-indonesia" dataset.
const BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

export interface Wilayah {
  id: string;
  name: string;
}

export const getProvinces = (): Promise<Wilayah[]> =>
  fetch(`${BASE}/provinces.json`).then((r) => r.json());

export const getRegencies = (provinceId: string): Promise<Wilayah[]> =>
  fetch(`${BASE}/regencies/${provinceId}.json`).then((r) => r.json());

export const getDistricts = (regencyId: string): Promise<Wilayah[]> =>
  fetch(`${BASE}/districts/${regencyId}.json`).then((r) => r.json());
