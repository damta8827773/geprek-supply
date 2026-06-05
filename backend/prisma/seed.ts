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

const regions: SeedRegion[] = [
  {
    key: 'priok',
    name: 'Priok',
    centerLat: -6.1194,
    centerLng: 106.8832,
    suppliers: [
      { name: 'Agen Ayam Priok Jaya', material: 'Ayam Potong', lat: -6.1254, lng: 106.8892, price: 32000, icon: 'fa-drumstick-bite' },
      { name: 'Pasar Ular Cabai', material: 'Cabai Rawit', lat: -6.1314, lng: 106.8792, price: 55000, icon: 'fa-pepper-hot' },
      { name: 'Gas Koja', material: 'Gas LPG 3kg', lat: -6.115, lng: 106.89, price: 21000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Pasar Kelapa Gading', material: 'Tepung Bumbu', lat: -6.16, lng: 106.9, price: 12000, icon: 'fa-wheat-awn' },
      { name: 'Grosir Telur Sunter', material: 'Telur Ayam', lat: -6.145, lng: 106.87, price: 26000, icon: 'fa-egg' },
      { name: 'Pasar Senen (Pusat)', material: 'Cabai Grosir', lat: -6.175, lng: 106.84, price: 45000, icon: 'fa-pepper-hot' },
    ],
  },
  {
    key: 'sawangan',
    name: 'Sawangan',
    centerLat: -6.3917,
    centerLng: 106.777,
    suppliers: [
      { name: 'Pasar Sawangan Baru', material: 'Ayam Potong', lat: -6.395, lng: 106.77, price: 31000, icon: 'fa-drumstick-bite' },
      { name: 'Toko Muchtar', material: 'Tepung', lat: -6.398, lng: 106.765, price: 11000, icon: 'fa-wheat-awn', inStock: false },
      { name: 'Grosir Gas Parung', material: 'Gas LPG 3kg', lat: -6.42, lng: 106.73, price: 19000, icon: 'fa-fire-flame-simple' },
      { name: 'Pasar Depok Lama', material: 'Telur Ayam', lat: -6.4, lng: 106.82, price: 25500, icon: 'fa-egg' },
      { name: 'Agen Margonda', material: 'Ayam Potong Segar', lat: -6.37, lng: 106.83, price: 30500, icon: 'fa-drumstick-bite' },
    ],
  },
  {
    key: 'tangsel',
    name: 'Tangsel',
    centerLat: -6.2917,
    centerLng: 106.7214,
    suppliers: [
      { name: 'Pasar Jombang', material: 'Cabai Setan', lat: -6.285, lng: 106.715, price: 60000, icon: 'fa-pepper-hot' },
      { name: 'Gas Villa Mutiara', material: 'Gas LPG', lat: -6.29, lng: 106.72, price: 20000, icon: 'fa-fire-flame-simple', inStock: false },
      { name: 'Pasar Ciputat', material: 'Ayam Potong', lat: -6.312, lng: 106.746, price: 33000, icon: 'fa-drumstick-bite' },
      { name: 'Pasar Modern BSD', material: 'Tepung Terigu', lat: -6.305, lng: 106.68, price: 12500, icon: 'fa-wheat-awn' },
      { name: 'Grosir Telur Bintaro', material: 'Telur Ayam', lat: -6.27, lng: 106.7, price: 27000, icon: 'fa-egg' },
      { name: 'Pasar Serpong', material: 'Cabai Kiloan', lat: -6.32, lng: 106.66, price: 50000, icon: 'fa-pepper-hot' },
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
