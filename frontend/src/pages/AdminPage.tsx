import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Clock, LocateFixed, LogOut, MapPin, Search, ShieldCheck, Store, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { api } from '@/lib/api';
import { useAllSuppliers, useSetStock } from '@/hooks/useSuppliers';
import { useAdminStore } from '@/store/adminStore';
import { useDictionary } from '@/store/uiStore';
import { formatRupiah } from '@/lib/format';
import ProductThumb from '@/components/ProductThumb';

/** Emails allowed into the admin dashboard (comma-separated; matches the server's ADMIN_EMAIL). */
const ADMIN_EMAILS = ((import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'admin@example.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean); 

function LoginCard() {
  const t = useDictionary();
  const login = useAdminStore((s) => s.login);
  const [email, setEmail] = useState('');

  const submit = () => {
    if (!ADMIN_EMAILS.includes(email.trim().toLowerCase())) {
      alert(t.accessDenied);
      return;
    }
    login(email);
  };

  return (
    <div className="animate-slide-up w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl text-brand dark:bg-orange-900/30">
        <ShieldCheck size={30} />
      </div>
      <h2 className="mb-1 text-xl font-bold">{t.adminTitle}</h2>
      <p className="mb-6 text-xs text-slate-500 dark:text-slate-400">{t.adminSubtitle}</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder={t.adminEmailPlaceholder}
        className="mb-4 w-full rounded-xl border border-slate-200 p-3 text-center text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-900"
      />
      <button
        onClick={submit}
        className="press w-full rounded-xl bg-slate-900 py-3 font-bold text-white shadow-lg transition-colors hover:bg-brand hover:shadow-glow"
      >
        {t.adminEnter}
      </button>
    </div>
  );
}

function Dashboard() {
  const t = useDictionary();
  const email = useAdminStore((s) => s.email)!;
  const logout = useAdminStore((s) => s.logout);
  const { data: groups = [], isLoading } = useAllSuppliers();
  const setStock = useSetStock();
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('');
  const [showMerchants, setShowMerchants] = useState(false);
  const needle = q.trim().toLowerCase();

  // Registered self-service shops (kept in sync with the merchant sign-up flow).
  const { data: merchants = [] } = useQuery({
    queryKey: ['admin-merchants', email],
    queryFn: () => api.listMerchants(email),
    enabled: !!email,
  });

  // Default to the first kecamatan (never show all at once by default).
  useEffect(() => {
    if (!region && groups.length > 0) setRegion(groups[0].key);
  }, [groups, region]);

  // Reads the admin's GPS location and switches to their nearest kecamatan.
  const locateKecamatan = () => {
    if (!('geolocation' in navigator)) {
      alert('Peramban ini tidak mendukung deteksi lokasi.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        let bestKey = region;
        let best = Infinity;
        for (const g of groups) {
          if (g.suppliers.length === 0) continue;
          const cLat = g.suppliers.reduce((a, s) => a + s.lat, 0) / g.suppliers.length;
          const cLng = g.suppliers.reduce((a, s) => a + s.lng, 0) / g.suppliers.length;
          const d = (cLat - me.lat) ** 2 + (cLng - me.lng) ** 2;
          if (d < best) {
            best = d;
            bestKey = g.key;
          }
        }
        setRegion(bestKey);
      },
      (err) =>
        alert(
          err.code === err.PERMISSION_DENIED
            ? 'Izin lokasi ditolak. Klik ikon lokasi di address bar browser, pilih "Izinkan", muat ulang, lalu coba lagi.'
            : 'Gagal membaca lokasi: ' + err.message,
        ),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const toggle = (id: number, current: boolean) => {
    setStock.mutate(
      { id, inStock: !current, adminEmail: email },
      {
        onError: (err) => alert(err instanceof Error ? err.message : t.accessDenied),
      },
    );
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.stockMgmt}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.stockMgmtSub}</p>
        </div>
        <button
          onClick={logout}
          className="press flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
        >
          <LogOut size={14} /> {t.logout}
        </button>
      </div>

      {/* System stats at a glance */}
      {(() => {
        const all = groups.flatMap((g) => g.suppliers);
        const avail = all.filter((s) => s.inStock).length;
        const totalProducts = merchants.reduce((a, m) => a + m.productCount, 0);
        const stats = [
          { label: 'Total Pemasok', value: all.length, cls: 'text-brand' },
          { label: 'Tersedia', value: avail, cls: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Kosong', value: all.length - avail, cls: 'text-red-600 dark:text-red-400' },
          { label: 'Toko Terdaftar', value: merchants.length, cls: 'text-sky-600 dark:text-sky-400' },
          { label: 'Produk Toko', value: totalProducts, cls: 'text-amber-600 dark:text-amber-400' },
        ];
        return (
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-center dark:border-slate-700 dark:bg-slate-800"
              >
                <p className={`text-xl font-black ${s.cls}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-700 dark:bg-slate-800"
        >
          {groups.map((g) => (
            <option key={g.key} value={g.key}>
              {g.name}
            </option>
          ))}
          <option value="all">Semua kecamatan</option>
        </select>
        <button
          type="button"
          onClick={locateKecamatan}
          title="Pilih kecamatan sesuai lokasi saya"
          className="press flex shrink-0 items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-bold text-sky-600 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400"
        >
          <LocateFixed size={15} /> Kecamatan Saya
        </button>
      </div>

      {/* Registered self-service shops */}
      <div className="mb-3 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={() => setShowMerchants((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-bold"
        >
          <span className="flex items-center gap-2">
            <Store size={15} className="text-brand" /> Toko Terdaftar ({merchants.length})
          </span>
          <span className="text-xs text-slate-400">{showMerchants ? 'Sembunyikan' : 'Lihat'}</span>
        </button>
        {showMerchants && (
          <div className="max-h-60 overflow-y-auto border-t border-slate-100 p-2 custom-scrollbar dark:border-slate-700">
            {merchants.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400">Belum ada toko yang mendaftar.</p>
            ) : (
              <div className="space-y-1.5">
                {merchants.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-slate-100 p-2 text-xs dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{m.shopName}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                        {m.productCount} produk
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {m.ownerName} · {m.kecamatan}
                      {m.kota ? `, ${m.kota}` : ''} · {m.phone || 'tanpa nomor'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 custom-scrollbar dark:border-slate-700 dark:bg-slate-800">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-400">Loading…</p>
        ) : (
          groups
            .filter((g) => region === 'all' || g.key === region)
            .map((group) => {
            const matched = group.suppliers.filter((s) =>
              `${s.name} ${s.material}`.toLowerCase().includes(needle),
            );
            if (matched.length === 0) return null;
            const available = matched.filter((s) => s.inStock).length;
            return (
            <div key={group.key} className="mb-6">
              <h3 className="mb-3 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900">
                <span>
                  <MapPin size={14} className="mr-1 inline text-brand" /> {group.name}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  {available}/{matched.length} tersedia
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {matched.map((s, i) => (
                  <div
                    key={s.id}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="card-hover animate-slide-up flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-100 text-lg dark:bg-orange-900/30">
                        <ProductThumb
                          material={s.material}
                          className="h-full w-full object-cover"
                          emojiClassName="text-lg"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{s.name}</p>
                        <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                          {s.material} ·{' '}
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(s.price)}
                          </span>{' '}
                          / {s.unit}
                        </p>
                        <p className="flex items-center gap-1 text-[9px] text-slate-400">
                          <Clock size={9} />
                          {String(s.openHour).padStart(2, '0')}.00-
                          {String(s.closeHour).padStart(2, '0')}.00
                        </p>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-sky-500 hover:underline"
                          title="Lihat lokasi supplier di peta"
                        >
                          <MapPin size={9} /> {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(s.id, s.inStock)}
                      disabled={setStock.isPending}
                      className={
                        'press flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ' +
                        (s.inStock
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400')
                      }
                    >
                      {s.inStock ? <Check size={14} /> : <X size={14} />}
                      {s.inStock ? t.inStock : t.outOfStock}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const email = useAdminStore((s) => s.email);
  const isAdmin = !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar
        right={
          <span className="flex items-center gap-1 rounded bg-orange-100 px-2 py-1.5 text-[11px] font-bold text-brand dark:bg-orange-900/30">
            <ShieldCheck size={14} /> Admin Panel
          </span>
        }
      />
      {isAdmin ? (
        <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
          <Dashboard />
        </div>
      ) : (
        <AuroraBackground className="flex-1 overflow-hidden p-6">
          <LoginCard />
        </AuroraBackground>
      )}
    </div>
  );
}
