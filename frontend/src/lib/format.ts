const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat('id-ID');

export const formatRupiah = (value: number): string => idr.format(value);
export const formatNumber = (value: number): string => number.format(value);
export const formatKm = (value: number): string => `${value.toFixed(1)} km`;

const chatDateFmt = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const chatTimeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

/** Full Indonesian date + time for chat timestamps: "Senin, 17 Agustus 2026 - 14:32". */
export function formatChatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${chatDateFmt.format(d)} - ${chatTimeFmt.format(d)}`;
}

/** Just the time, for compact message bubbles: "14:32". */
export const formatChatTime = (iso: string): string => chatTimeFmt.format(new Date(iso));
