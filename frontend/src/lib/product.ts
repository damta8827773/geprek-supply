/**
 * Maps a material name to a category slug. Order matters: more specific keywords
 * come first so that e.g. "Tepung Tapioka" → tapioka (not the generic tepung)
 * and "Penyedap Rasa Masako" → masako (not ayam).
 */
function categorySlug(material: string): string {
  const m = material.toLowerCase();
  if (m.includes('garam')) return 'garam';
  // "Tepung Bumbu" (and kaldu/penyedap) use the Masako photo.
  if (m.includes('bumbu') || m.includes('kaldu') || m.includes('penyedap') || m.includes('masako'))
    return 'masako';
  if (m.includes('baking')) return 'bakingpowder';
  if (m.includes('tapioka') || m.includes('kanji')) return 'tapioka';
  if (m.includes('maizena')) return 'maizena';
  if (m.includes('cup')) return 'cupsambel';
  if (m.includes('styrofoam') || m.includes('sterofoam')) return 'styrofoam';
  if (m.includes('kertas')) return 'kertasnasi';
  if (m.includes('kantong')) return 'kantong';
  if (m.includes('sambel') || m.includes('sambal')) return 'plastiksambel';
  if (m.includes('kemasan') || m.includes('box') || m.includes('dus')) return 'kemasan';
  if (m.includes('ayam') && !m.includes('telur')) return 'ayam';
  if (m.includes('telur')) return 'telur';
  if (m.includes('cabai') || m.includes('cabe')) return 'cabai';
  if (m.includes('gas')) return 'gas';
  if (m.includes('tepung')) return 'tepung';
  if (m.includes('minyak')) return 'minyak';
  if (m.includes('beras')) return 'beras';
  if (m.includes('bawang')) return 'bawang';
  if (m.includes('lalapan') || m.includes('sayur') || m.includes('timun') || m.includes('kol'))
    return 'sayur';
  return 'default';
}

const EMOJI: Record<string, string> = {
  garam: '🧂',
  masako: '🍲',
  bakingpowder: '🧁',
  tapioka: '🌾',
  maizena: '🌽',
  cupsambel: '🥤',
  styrofoam: '🍱',
  kertasnasi: '📄',
  kantong: '🛍️',
  plastiksambel: '🥡',
  kemasan: '📦',
  ayam: '🍗',
  telur: '🥚',
  cabai: '🌶️',
  gas: '🔥',
  tepung: '🌾',
  minyak: '🛢️',
  beras: '🍚',
  bawang: '🧅',
  sayur: '🥬',
  default: '🛒',
};

/** Emoji fallback shown when a product photo fails to load. */
export function productEmoji(material: string): string {
  return EMOJI[categorySlug(material)] ?? '🛒';
}

/**
 * Real product photo path for a material (stored in `public/products/`).
 * Swap the files for your own product photos anytime - just keep the file name.
 */
export function productImage(material: string): string {
  return `/products/${categorySlug(material)}.jpg`;
}
