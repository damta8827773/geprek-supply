import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedSupplier = {
  name: string;
  material: string;
  unit: string;
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
      { name: 'Agen Ayam Priok Jaya', material: 'Ayam Potong', unit: 'kg', lat: -6.1254, lng: 106.8892, price: 32000, icon: 'fa-drumstick-bite' },
      { name: 'Pasar Ular Cabai', material: 'Cabai Rawit Merah', unit: 'kg', lat: -6.1314, lng: 106.8792, price: 54000, icon: 'fa-pepper-hot' },
      { name: 'Gas Koja', material: 'Gas LPG', unit: 'tabung 3 kg', lat: -6.115, lng: 106.89, price: 21000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Pasar Kelapa Gading', material: 'Tepung Bumbu', unit: 'kg', lat: -6.16, lng: 106.9, price: 12000, icon: 'fa-wheat-awn' },
      { name: 'Grosir Telur Sunter', material: 'Telur Ayam', unit: 'kg', lat: -6.145, lng: 106.87, price: 26000, icon: 'fa-egg' },
      { name: 'Agen Minyak Cilincing', material: 'Minyak Goreng', unit: 'liter', lat: -6.108, lng: 106.91, price: 18000, icon: 'fa-bottle-droplet' },
      { name: 'Grosir Beras Priok', material: 'Beras', unit: 'kg', lat: -6.128, lng: 106.875, price: 13000, icon: 'fa-bowl-rice' },
      { name: 'Agen Bawang Pasar Ular', material: 'Bawang Putih', unit: 'kg', lat: -6.133, lng: 106.882, price: 40000, icon: 'fa-seedling' },
    ],
  },
  {
    key: 'ciputat',
    name: 'Ciputat',
    centerLat: -6.3122,
    centerLng: 106.7515,
    suppliers: [
      { name: 'Pasar Ciputat', material: 'Ayam Potong', unit: 'kg', lat: -6.312, lng: 106.746, price: 33000, icon: 'fa-drumstick-bite' },
      { name: 'Agen Cabai Jombang', material: 'Cabai Rawit Merah', unit: 'kg', lat: -6.32, lng: 106.745, price: 58000, icon: 'fa-pepper-hot' },
      { name: 'Gas Kp. Utan', material: 'Gas LPG', unit: 'tabung 3 kg', lat: -6.315, lng: 106.756, price: 20000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Grosir Telur Ciputat', material: 'Telur Ayam', unit: 'kg', lat: -6.308, lng: 106.758, price: 27000, icon: 'fa-egg' },
      { name: 'Toko Tepung Cireundeu', material: 'Tepung Terigu', unit: 'kg', lat: -6.305, lng: 106.762, price: 12500, icon: 'fa-wheat-awn' },
      { name: 'Agen Minyak Ciputat', material: 'Minyak Goreng', unit: 'liter', lat: -6.318, lng: 106.748, price: 18500, icon: 'fa-bottle-droplet' },
      { name: 'Grosir Beras Ciputat', material: 'Beras', unit: 'kg', lat: -6.31, lng: 106.755, price: 13500, icon: 'fa-bowl-rice' },
    ],
  },
  {
    key: 'pamulang',
    name: 'Pamulang',
    centerLat: -6.343,
    centerLng: 106.738,
    suppliers: [
      { name: 'Pasar Pamulang', material: 'Ayam Potong', unit: 'kg', lat: -6.34, lng: 106.74, price: 32500, icon: 'fa-drumstick-bite' },
      { name: 'Agen Cabai Vila Dago', material: 'Cabai Rawit Merah', unit: 'kg', lat: -6.335, lng: 106.745, price: 56000, icon: 'fa-pepper-hot' },
      { name: 'Gas Pamulang Permai', material: 'Gas LPG', unit: 'tabung 3 kg', lat: -6.338, lng: 106.732, price: 19500, icon: 'fa-fire-flame-simple' },
      { name: 'Grosir Telur Reni Jaya', material: 'Telur Ayam', unit: 'kg', lat: -6.35, lng: 106.742, price: 26500, icon: 'fa-egg', inStock: false },
      { name: 'Toko Tepung Benda Baru', material: 'Tepung Bumbu', unit: 'kg', lat: -6.346, lng: 106.73, price: 12000, icon: 'fa-wheat-awn' },
      { name: 'Agen Bawang Pamulang', material: 'Bawang Merah', unit: 'kg', lat: -6.341, lng: 106.735, price: 35000, icon: 'fa-seedling' },
      { name: 'Kebun Sayur Pondok Cabe', material: 'Lalapan (Timun & Kol)', unit: 'kg', lat: -6.349, lng: 106.744, price: 9000, icon: 'fa-leaf' },
    ],
  },
  {
    key: 'bojongsari',
    name: 'Bojongsari',
    centerLat: -6.406,
    centerLng: 106.756,
    suppliers: [
      { name: 'Pasar Bojongsari', material: 'Ayam Potong', unit: 'kg', lat: -6.405, lng: 106.754, price: 31500, icon: 'fa-drumstick-bite' },
      { name: 'Agen Cabai Serua', material: 'Cabai Rawit Merah', unit: 'kg', lat: -6.4, lng: 106.76, price: 54000, icon: 'fa-pepper-hot' },
      { name: 'Gas Bojongsari Baru', material: 'Gas LPG', unit: 'tabung 3 kg', lat: -6.41, lng: 106.75, price: 19000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Grosir Telur Duren Seribu', material: 'Telur Ayam', unit: 'kg', lat: -6.415, lng: 106.758, price: 25500, icon: 'fa-egg' },
      { name: 'Toko Tepung Curug', material: 'Tepung Terigu', unit: 'kg', lat: -6.402, lng: 106.762, price: 12500, icon: 'fa-wheat-awn' },
      { name: 'Agen Minyak Bojongsari', material: 'Minyak Goreng', unit: 'liter', lat: -6.408, lng: 106.752, price: 18000, icon: 'fa-bottle-droplet' },
      { name: 'Toko Kemasan Serua', material: 'Kemasan Box Nasi', unit: 'isi 50 pcs', lat: -6.401, lng: 106.758, price: 25000, icon: 'fa-box' },
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
            unit: s.unit,
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
