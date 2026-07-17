import { ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <div className="mx-auto w-full max-w-2xl flex-1 p-4 md:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-brand dark:bg-orange-900/30">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-xl font-bold">Kebijakan Privasi</h1>
          </div>
          <p className="mb-4 text-xs text-slate-400">Berlaku untuk aplikasi Geprek-Supply.</p>

          <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <section>
              <h2 className="font-bold text-slate-800 dark:text-white">1. Data yang Kami Kumpulkan</h2>
              <p>
                Saat mendaftarkan toko, kami menyimpan: nama pemilik, nama toko, email, kata sandi
                (dalam bentuk terenkripsi/hash), serta data wilayah (kecamatan, kota, kabupaten, kode
                pos, nomor, dan patokan). Kata sandi tidak pernah disimpan dalam bentuk asli.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-slate-800 dark:text-white">2. Data Lokasi (GPS)</h2>
              <p>
                Fitur "Lokasi Saya" hanya membaca posisimu setelah kamu memberi izin di peramban.
                Lokasi dipakai untuk mencari toko/pasar terdekat dan tidak disimpan di server kami.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-slate-800 dark:text-white">3. Penggunaan Data</h2>
              <p>
                Data dipakai untuk otentikasi akun, menampilkan tokomu, dan menghitung jarak, ongkir,
                serta estimasi waktu. Kami tidak menjual data pribadimu ke pihak mana pun.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-slate-800 dark:text-white">4. Layanan Pihak Ketiga</h2>
              <p>
                Peta dan data toko memakai OpenStreetMap dan penyedia basemap. Data wilayah memakai
                API wilayah Indonesia. Estimasi rute dapat memakai layanan routing pihak ketiga.
                Nomor WhatsApp support hanya dipakai untuk pelaporan (mis. lupa sandi).
              </p>
            </section>
            <section>
              <h2 className="font-bold text-slate-800 dark:text-white">5. Keamanan</h2>
              <p>
                Akses admin diverifikasi di server, kata sandi di-hash, dan setiap perubahan stok
                dicatat. Meski begitu, tidak ada sistem yang 100 persen bebas risiko; jaga
                kerahasiaan kata sandimu.
              </p>
            </section>
            <section>
              <h2 className="font-bold text-slate-800 dark:text-white">6. Kontak</h2>
              <p>
                Untuk pertanyaan terkait privasi atau menghapus data toko, hubungi admin melalui
                kanal WhatsApp support yang tersedia di halaman Masuk.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
