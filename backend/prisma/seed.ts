import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Product = { material: string; unit: string; price: number; icon: string };
type Market = { name: string; lat: number; lng: number };
type Region = { key: string; name: string; markets: Market[] };

// Shared product catalog carried by every kecamatan (staples + seasoning + packaging).
// Prices are example data; edit freely.
const PRODUCTS: Product[] = [
  { material: 'Ayam Potong', unit: 'kg', price: 32000, icon: 'fa-drumstick-bite' },
  { material: 'Cabai Rawit Merah', unit: 'kg', price: 54000, icon: 'fa-pepper-hot' },
  { material: 'Telur Ayam', unit: 'kg', price: 26000, icon: 'fa-egg' },
  { material: 'Minyak Goreng', unit: 'liter', price: 18000, icon: 'fa-bottle-droplet' },
  { material: 'Gas LPG', unit: 'tabung 3 kg', price: 21000, icon: 'fa-fire-flame-simple' },
  { material: 'Beras', unit: 'kg', price: 13000, icon: 'fa-bowl-rice' },
  { material: 'Bawang Putih', unit: 'kg', price: 40000, icon: 'fa-seedling' },
  { material: 'Tepung Bumbu', unit: 'kg', price: 12000, icon: 'fa-bowl-food' },
  { material: 'Garam Beryodium', unit: 'bungkus 500 g', price: 5000, icon: 'fa-cube' },
  { material: 'Baking Powder', unit: 'kaleng', price: 12000, icon: 'fa-jar' },
  { material: 'Tepung Tapioka', unit: 'kg', price: 11000, icon: 'fa-wheat-awn' },
  { material: 'Tepung Maizena', unit: 'kg', price: 16000, icon: 'fa-wheat-awn' },
  { material: 'Styrofoam 19x13x7', unit: 'isi 50 pcs', price: 22000, icon: 'fa-box-open' },
  { material: 'Kertas Nasi', unit: 'pak isi 250', price: 15000, icon: 'fa-scroll' },
  { material: 'Plastik Sambel 6x20', unit: 'pak isi 100', price: 8000, icon: 'fa-bag-shopping' },
  { material: 'Cup Sambel', unit: 'isi 50 pcs', price: 10000, icon: 'fa-whiskey-glass' },
  { material: 'Plastik Kantong 25', unit: 'pak isi 100', price: 13000, icon: 'fa-bag-shopping' },
];

// REAL traditional markets per kecamatan, coordinates geocoded from OpenStreetMap.
// These pasar genuinely sell the staples/packaging listed above.
const regions: Region[] = [
  {
    key: 'tanjung-priok',
    name: 'Tanjung Priok',
    markets: [
      { name: 'Pasar Koja', lat: -6.1214, lng: 106.9157 },
      { name: 'Pasar Ular', lat: -6.13, lng: 106.8948 },
      { name: 'Pasar Sunter Podomoro', lat: -6.1392, lng: 106.8705 },
    ],
  },
  {
    key: 'ciputat',
    name: 'Ciputat',
    markets: [
      { name: 'Pasar Ciputat', lat: -6.3126, lng: 106.7463 },
      { name: 'Pasar Jombang', lat: -6.296, lng: 106.7119 },
    ],
  },
  {
    key: 'pamulang',
    name: 'Pamulang',
    markets: [{ name: 'Pasar Kita Pamulang', lat: -6.3408, lng: 106.7375 }],
  },
  {
    key: 'bojongsari',
    name: 'Bojongsari',
    markets: [{ name: 'Pasar Bojongsari', lat: -6.362, lng: 106.7311 }],
  },
];

/** Builds suppliers for a region: each product sits at one of its real markets. */
function buildRegion(region: Region) {
  const cLat = region.markets.reduce((a, m) => a + m.lat, 0) / region.markets.length;
  const cLng = region.markets.reduce((a, m) => a + m.lng, 0) / region.markets.length;
  const suppliers = PRODUCTS.map((p, i) => {
    const m = region.markets[i % region.markets.length];
    // Fresh goods open early; dry goods/packaging open later.
    const fresh = /ayam|cabai|telur|bawang|beras|sayur|lalapan/i.test(p.material);
    return {
      name: m.name,
      material: p.material,
      unit: p.unit,
      // Small offset so multiple stalls in the same market do not overlap exactly.
      lat: Number((m.lat + Math.cos(i) * 0.0008).toFixed(5)),
      lng: Number((m.lng + Math.sin(i) * 0.0008).toFixed(5)),
      price: p.price,
      icon: p.icon,
      // Example rating (4.0-4.8), deterministic & varied. Replace with real ratings later.
      rating: Number((4.0 + ((p.price % 9) / 10)).toFixed(1)),
      openHour: fresh ? 5 : 7,
      closeHour: fresh ? 17 : 20,
      inStock: true,
    };
  });
  return { centerLat: Number(cLat.toFixed(4)), centerLng: Number(cLng.toFixed(4)), suppliers };
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean slate so the seed is idempotent.
  await prisma.supplier.deleteMany();
  await prisma.region.deleteMany();

  for (const region of regions) {
    const { centerLat, centerLng, suppliers } = buildRegion(region);
    const created = await prisma.region.create({
      data: {
        key: region.key,
        name: region.name,
        centerLat,
        centerLng,
        suppliers: { create: suppliers },
      },
      include: { suppliers: true },
    });
    console.log(`  ✓ ${created.name} - ${created.suppliers.length} suppliers`);
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
