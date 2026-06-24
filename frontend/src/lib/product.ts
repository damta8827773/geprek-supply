/** Maps a material name to a representative product emoji (visual cue / "gambar produk"). */
export function productEmoji(material: string): string {
  const m = material.toLowerCase();
  if (m.includes('ayam')) return '🍗';
  if (m.includes('cabai') || m.includes('cabe')) return '🌶️';
  if (m.includes('gas')) return '🔥';
  if (m.includes('telur')) return '🥚';
  if (m.includes('tepung')) return '🌾';
  if (m.includes('minyak')) return '🛢️';
  if (m.includes('beras')) return '🍚';
  if (m.includes('bawang')) return '🧅';
  if (m.includes('lalapan') || m.includes('sayur') || m.includes('timun') || m.includes('kol'))
    return '🥬';
  if (m.includes('kemasan') || m.includes('box') || m.includes('dus')) return '📦';
  return '🛒';
}
