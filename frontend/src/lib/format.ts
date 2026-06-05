const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat('id-ID');

export const formatRupiah = (value: number): string => idr.format(value);
export const formatNumber = (value: number): string => number.format(value);
export const formatKm = (value: number): string => `${value.toFixed(1)} km`;
