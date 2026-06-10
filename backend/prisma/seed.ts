import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedSupplier = {
  name: string;
  material: string;
  lat: number;
  lng: number;
  price: number;
  icon: string;
  inStock?: boolean;
};

type SeedRegion = {
  key: string;
  name: string;
  centerLat: number;
  centerLng: number;
  suppliers: SeedSupplier[];
};

// Regions are modelled at the kecamatan (district) level for consistency.
// Tanjung Priok (Jakarta Utara) plus three Tangsel/Depok kecamatan ordered by
// historical establishment: Ciputat (parent district, oldest) →
// Pamulang (split from Ciputat) → Bojongsari (youngest, Depok — Perda 2007 / 2009).
const regions: SeedRegion[] = [
  {
    key: 'tanjung-priok',
    name: 'Tanjung Priok',
    centerLat: -6.1194,
    centerLng: 106.8832,
    suppliers: [
      { name: 'Agen Ayam Priok Jaya', material: 'Ayam Potong', lat: -6.1254, lng: 106.8892, price: 32000, icon: 'fa-drumstick-bite' },
      { name: 'Pasar Ular Cabai', material: 'Cabai Rawit', lat: -6.1314, lng: 106.8792, price: 55000, icon: 'fa-pepper-hot' },
      { name: 'Gas Koja', material: 'Gas LPG 3kg', lat: -6.115, lng: 106.89, price: 21000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Pasar Kelapa Gading', material: 'Tepung Bumbu', lat: -6.16, lng: 106.9, price: 12000, icon: 'fa-wheat-awn' },
      { name: 'Grosir Telur Sunter', material: 'Telur Ayam', lat: -6.145, lng: 106.87, price: 26000, icon: 'fa-egg' },
      { name: 'Agen Daging Cilincing', material: 'Cabai Grosir', lat: -6.108, lng: 106.93, price: 45000, icon: 'fa-pepper-hot' },
    ],
  },
  {
    key: 'ciputat',
    name: 'Ciputat',
    centerLat: -6.3122,
    centerLng: 106.7515,
    suppliers: [
      { name: 'Pasar Ciputat', material: 'Ayam Potong', lat: -6.312, lng: 106.746, price: 33000, icon: 'fa-drumstick-bite' },
      { name: 'Agen Cabai Jombang', material: 'Cabai Setan', lat: -6.32, lng: 106.745, price: 58000, icon: 'fa-pepper-hot' },
      { name: 'Gas Kp. Utan', material: 'Gas LPG 3kg', lat: -6.315, lng: 106.756, price: 20000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Grosir Telur Ciputat', material: 'Telur Ayam', lat: -6.308, lng: 106.758, price: 27000, icon: 'fa-egg' },
      { name: 'Toko Tepung Cireundeu', material: 'Tepung Terigu', lat: -6.305, lng: 106.762, price: 12500, icon: 'fa-wheat-awn' },
    ],
  },
  {
    key: 'pamulang',
    name: 'Pamulang',
    centerLat: -6.343,
    centerLng: 106.738,
    suppliers: [
      { name: 'Pasar Pamulang', material: 'Ayam Potong', lat: -6.34, lng: 106.74, price: 32500, icon: 'fa-drumstick-bite' },
      { name: 'Agen Cabai Vila Dago', material: 'Cabai Setan', lat: -6.335, lng: 106.745, price: 56000, icon: 'fa-pepper-hot' },
      { name: 'Gas Pamulang Permai', material: 'Gas LPG 3kg', lat: -6.338, lng: 106.732, price: 19500, icon: 'fa-fire-flame-simple' },
      { name: 'Grosir Telur Reni Jaya', material: 'Telur Ayam', lat: -6.35, lng: 106.742, price: 26500, icon: 'fa-egg', inStock: false },
      { name: 'Toko Tepung Benda Baru', material: 'Tepung Bumbu', lat: -6.346, lng: 106.73, price: 12000, icon: 'fa-wheat-awn' },
    ],
  },
  {
    key: 'bojongsari',
    name: 'Bojongsari',
    centerLat: -6.406,
    centerLng: 106.756,
    suppliers: [
      { name: 'Pasar Bojongsari', material: 'Ayam Potong', lat: -6.405, lng: 106.754, price: 31500, icon: 'fa-drumstick-bite' },
      { name: 'Agen Cabai Serua', material: 'Cabai Rawit', lat: -6.4, lng: 106.76, price: 54000, icon: 'fa-pepper-hot' },
      { name: 'Gas Bojongsari Baru', material: 'Gas LPG 3kg', lat: -6.41, lng: 106.75, price: 19000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Grosir Telur Duren Seribu', material: 'Telur Ayam', lat: -6.415, lng: 106.758, price: 25500, icon: 'fa-egg' },
      { name: 'Toko Tepung Curug', material: 'Tepung Terigu', lat: -6.402, lng: 106.762, price: 12500, icon: 'fa-wheat-awn' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clean slate so the seed is idempotent.
  await prisma.supplier.deleteMany();
  await prisma.region.deleteMany();

  for (const region of regions) {
    const { suppliers, ...regionData } = region;
    const created = await prisma.region.create({
      data: {
        ...regionData,
        suppliers: {
          create: suppliers.map((s) => ({
            name: s.name,
            material: s.material,
            lat: s.lat,
            lng: s.lng,
            price: s.price,
            icon: s.icon,
            inStock: s.inStock ?? true,
          })),
        },
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
