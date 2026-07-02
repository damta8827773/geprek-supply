/** Maps a material name to a representative product emoji (fallback when a photo fails to load). */
export function productEmoji(material: string): string {
  const m = material.toLowerCase();
  if (m.includes('telur')) return '🥚';
  if (m.includes('ayam')) return '🍗';
  if (m.includes('cabai') || m.includes('cabe')) return '🌶️';
  if (m.includes('gas')) return '🔥';
  if (m.includes('tepung')) return '🌾';
  if (m.includes('minyak')) return '🛢️';
  if (m.includes('beras')) return '🍚';
  if (m.includes('bawang')) return '🧅';
  if (m.includes('lalapan') || m.includes('sayur') || m.includes('timun') || m.includes('kol'))
    return '🥬';
  if (m.includes('cup')) return '🥤';
  if (m.includes('styrofoam') || m.includes('sterofoam')) return '🍱';
  if (m.includes('kertas')) return '📄';
  if (m.includes('kantong')) return '🛍️';
  if (m.includes('sambel') || m.includes('sambal')) return '🧂';
  if (m.includes('kemasan') || m.includes('box') || m.includes('dus')) return '📦';
  return '🛒';
}

/**
 * Maps a material to a real product photo stored in `public/products/`.
 * Photos are openly-licensed stock images (via Openverse); swap them for your
 * own product photos anytime — just keep the same file name.
 */
export function productImage(material: string): string {
  const m = material.toLowerCase();
  let slug = 'default';
  if (m.includes('ayam') && !m.includes('telur')) slug = 'ayam';
  else if (m.includes('cabai') || m.includes('cabe')) slug = 'cabai';
  else if (m.includes('gas')) slug = 'gas';
  else if (m.includes('telur')) slug = 'telur';
  else if (m.includes('tepung')) slug = 'tepung';
  else if (m.includes('minyak')) slug = 'minyak';
  else if (m.includes('beras')) slug = 'beras';
  else if (m.includes('bawang')) slug = 'bawang';
  else if (m.includes('lalapan') || m.includes('sayur') || m.includes('timun') || m.includes('kol'))
    slug = 'sayur';
  else if (m.includes('cup')) slug = 'cupsambel';
  else if (m.includes('styrofoam') || m.includes('sterofoam')) slug = 'styrofoam';
  else if (m.includes('kertas')) slug = 'kertasnasi';
  else if (m.includes('kantong')) slug = 'kantong';
  else if (m.includes('sambel') || m.includes('sambal')) slug = 'plastiksambel';
  else if (m.includes('kemasan') || m.includes('box') || m.includes('dus')) slug = 'kemasan';
  return `/products/${slug}.jpg`;
}
