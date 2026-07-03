import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Product = { shop: string; material: string; unit: string; price: number; icon: string };
type Region = { key: string; name: string; centerLat: number; centerLng: number };

// One shared catalog so EVERY kecamatan carries the exact same products
// (staples + seasoning + packaging). Prices are example data — edit freely.
const PRODUCTS: Product[] = [
  { shop: 'Pasar Ayam', material: 'Ayam Potong', unit: 'kg', price: 32000, icon: 'fa-drumstick-bite' },
  { shop: 'Pasar Cabai', material: 'Cabai Rawit Merah', unit: 'kg', price: 54000, icon: 'fa-pepper-hot' },
  { shop: 'Grosir Telur', material: 'Telur Ayam', unit: 'kg', price: 26000, icon: 'fa-egg' },
  { shop: 'Agen Minyak', material: 'Minyak Goreng', unit: 'liter', price: 18000, icon: 'fa-bottle-droplet' },
  { shop: 'Agen Gas', material: 'Gas LPG', unit: 'tabung 3 kg', price: 21000, icon: 'fa-fire-flame-simple' },
  { shop: 'Grosir Beras', material: 'Beras', unit: 'kg', price: 13000, icon: 'fa-bowl-rice' },
  { shop: 'Agen Bawang', material: 'Bawang Putih', unit: 'kg', price: 40000, icon: 'fa-seedling' },
  { shop: 'Grosir Bumbu', material: 'Tepung Bumbu', unit: 'kg', price: 12000, icon: 'fa-bowl-food' },
  { shop: 'Toko Garam', material: 'Garam Beryodium', unit: 'bungkus 500 g', price: 5000, icon: 'fa-cube' },
  { shop: 'Toko Baking', material: 'Baking Powder', unit: 'kaleng', price: 12000, icon: 'fa-jar' },
  { shop: 'Toko Tepung Tapioka', material: 'Tepung Tapioka', unit: 'kg', price: 11000, icon: 'fa-wheat-awn' },
  { shop: 'Toko Maizena', material: 'Tepung Maizena', unit: 'kg', price: 16000, icon: 'fa-wheat-awn' },
  { shop: 'Toko Kemasan', material: 'Styrofoam 19x13x7', unit: 'isi 50 pcs', price: 22000, icon: 'fa-box-open' },
  { shop: 'Grosir Kertas Nasi', material: 'Kertas Nasi', unit: 'pak isi 250', price: 15000, icon: 'fa-scroll' },
  { shop: 'Toko Plastik', material: 'Plastik Sambel 6x20', unit: 'pak isi 100', price: 8000, icon: 'fa-bag-shopping' },
  { shop: 'Toko Cup Sambel', material: 'Cup Sambel', unit: 'isi 50 pcs', price: 10000, icon: 'fa-whiskey-glass' },
  { shop: 'Grosir Kantong Plastik', material: 'Plastik Kantong 25', unit: 'pak isi 100', price: 13000, icon: 'fa-bag-shopping' },
];

// Study area: 4 kecamatan (1 in Jakarta Utara + 3 in Depok/Tangsel).
const regions: Region[] = [
  { key: 'tanjung-priok', name: 'Tanjung Priok', centerLat: -6.1194, centerLng: 106.8832 },
  { key: 'ciputat', name: 'Ciputat', centerLat: -6.3122, centerLng: 106.7515 },
  { key: 'pamulang', name: 'Pamulang', centerLat: -6.343, centerLng: 106.738 },
  { key: 'bojongsari', name: 'Bojongsari', centerLat: -6.406, centerLng: 106.756 },
];

/** Builds one supplier per product for a region, spread in a ring near its center. */
function suppliersFor(region: Region) {
  return PRODUCTS.map((p, i) => {
    // Markets/wholesalers/farms open early; agents/shops open later.
    const early = /(pasar|grosir|kebun)/i.test(p.shop);
    return {
      name: `${p.shop} ${region.name}`,
      material: p.material,
      unit: p.unit,
      // Spread points in a small ring around the region center (still within the kecamatan).
      lat: Number((region.centerLat + Math.cos(i) * 0.004).toFixed(4)),
      lng: Number((region.centerLng + Math.sin(i) * 0.004).toFixed(4)),
      price: p.price,
      icon: p.icon,
      // Example rating (4.0–4.8), deterministic & varied. Replace with real ratings later.
      rating: Number((4.0 + ((p.price % 9) / 10)).toFixed(1)),
      openHour: early ? 5 : 7,
      closeHour: early ? 17 : 20,
      inStock: true,
    };
  });
}

async function main() {
  console.log('🌱 Seeding database...');

  // Clean slate so the seed is idempotent.
  await prisma.supplier.deleteMany();
  await prisma.region.deleteMany();

  for (const region of regions) {
    const created = await prisma.region.create({
      data: {
        key: region.key,
        name: region.name,
        centerLat: region.centerLat,
        centerLng: region.centerLng,
        suppliers: { create: suppliersFor(region) },
      },
      include: { suppliers: true },
    });
    console.log(`  ✓ ${created.name} — ${created.suppliers.length} suppliers`);
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
