/**
 * Rule-based FAQ assistant for the live-chat widget. This is intentionally NOT
 * a call to an external LLM (no API key is configured for this project) - it
 * is a transparent keyword matcher over this system's real features, honest
 * about what it does and doesn't know.
 *
 * The bot NEVER escalates to a human on its own. It only *suggests* doing so
 * (suggestEscalate: true); the actual handoff happens only when the visitor
 * clicks the "Sambungkan ke Admin" button, which calls a separate endpoint.
 */

export interface BotReply {
  reply: string;
  suggestEscalate: boolean;
}

type Rule = { patterns: RegExp[]; reply: string };

const RULES: Rule[] = [
  {
    patterns: [/\b(halo|hai|hi|hello|pagi|siang|sore|malam)\b/i],
    reply:
      'Halo! Selamat datang di Geprek-Supply. Saya asisten otomatis - tanya soal cara pakai sistem, ' +
      'daftar toko, ongkir, atau lupa sandi, dan saya bantu. Kalau butuh admin, tinggal bilang saja.',
  },
  {
    patterns: [/radius|termurah|terdekat|cari (pemasok|supplier|bahan)/i],
    reply:
      'Di halaman utama, pilih kecamatan lalu atur slider radius (1-10 km) dan tekan "Cek Ketersediaan". ' +
      'Sistem otomatis mengurutkan pemasok termurah dan menampilkan ongkir + estimasi waktu tiap pemasok.',
  },
  {
    patterns: [/(kecamatan|kota|kabupaten).*(lain|luar|nasional)|7\.?285|se[- ]?indonesia|di luar (4|empat) kecamatan/i],
    reply:
      'Untuk daerah di luar 4 kecamatan studi, buka menu "Cari Nasional" - kamu bisa pilih provinsi/kota/ ' +
      'kecamatan mana pun di Indonesia atau pakai lokasi GPS, dan sistem menampilkan toko/pasar nyata dari OpenStreetMap.',
  },
  {
    patterns: [/daftar(kan)? toko|jadi (pemasok|supplier|penjual)|jual di sini/i],
    reply:
      'Klik "Daftarkan Toko" di menu atas, isi nama pemilik, nama toko, email, kata sandi, dan alamat ' +
      '(kecamatan/kota). Setelah daftar kamu langsung masuk ke dashboard toko untuk menambah produk, harga, dan stok.',
  },
  {
    patterns: [/lupa (sandi|password)|reset (sandi|password)|ganti (sandi|password)/i],
    reply:
      'Di halaman Masuk, klik "Lupa sandi?" - kamu bisa minta link reset lewat email, atau kalau sedang ' +
      'login, ubah sandi langsung dari menu "Pengaturan Toko" di dashboard tokomu.',
  },
  {
    patterns: [/ongkir|goride|biaya (antar|kirim)|tarif/i],
    reply:
      'Ongkir dihitung otomatis mengikuti tarif GoRide (motor): minimum Rp10.200, lalu bertambah sesuai ' +
      'jarak dari toko ke pemasok. Angka ini estimasi, bukan tarif final dari aplikasi ojek online.',
  },
  {
    patterns: [/eta|estimasi waktu|berapa lama|waktu tempuh/i],
    reply:
      'ETA dihitung dari jarak dengan asumsi kecepatan motor di kota (≈ 24 km/jam), minimum 5 menit. ' +
      'Ini estimasi kasar untuk perbandingan antar pemasok, bukan janji waktu pasti.',
  },
  {
    patterns: [/jam (buka|operasional|tutup)|buka jam berapa/i],
    reply:
      'Tiap pemasok punya jam operasional sendiri, ditampilkan di kartunya dengan status "Buka"/"Tutup" ' +
      'sesuai jam saat ini. Untuk toko yang kamu daftarkan sendiri, jam operasional belum ada - itu masukan bagus untuk kami kembangkan.',
  },
  {
    patterns: [/privasi|data (saya|pribadi)|kebijakan/i],
    reply:
      'Kamu bisa baca lengkap di halaman "Privasi" pada menu atas - mencakup data apa yang kami simpan ' +
      'dan bagaimana lokasi GPS dipakai.',
  },
  {
    patterns: [/terima kasih|makasih|thanks/i],
    reply: 'Sama-sama! Ada lagi yang bisa saya bantu?',
  },
];

const ESCALATE_HINT =
  /\b(admin|cs|customer service|manusia|orang asli|komplain|keluhan|error|bug|rusak|gagal terus|tolong hubungi|bicara langsung|operator)\b/i;

const FALLBACK =
  'Maaf, saya belum menangkap maksudnya. Saya bisa bantu soal cara mencari pemasok, daftar toko, ongkir, ' +
  'ETA, atau lupa sandi. Kalau butuh dijawab manusia, klik tombol di bawah untuk sambungkan ke admin.';

/** Matches a visitor message against the FAQ rules and returns a reply. */
export function getBotReply(text: string): BotReply {
  const wantsHuman = ESCALATE_HINT.test(text);

  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return {
        reply: wantsHuman ? `${rule.reply}\n\nSepertinya kamu juga butuh bantuan admin langsung.` : rule.reply,
        suggestEscalate: wantsHuman,
      };
    }
  }

  return { reply: FALLBACK, suggestEscalate: true };
}
