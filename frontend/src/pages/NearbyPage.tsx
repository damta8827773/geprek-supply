import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bike, LocateFixed, MapPin, Navigation, Timer } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MapView from '@/components/MapView';
import { api } from '@/lib/api';
import { getDistricts, getProvinces, getRegencies } from '@/lib/wilayah';
import { formatKm, formatRupiah } from '@/lib/format';
import type { LatLng, NearbyShop, Supplier } from '@/types';

const JAKARTA: LatLng = { lat: -6.2, lng: 106.816 };

type Source = { type: 'coords'; lat: number; lng: number } | { type: 'place'; q: string };

/** Adapt an OSM shop to the Supplier shape the map component expects. */
function shopToSupplier(s: NearbyShop): Supplier {
  return {
    id: s.id,
    name: s.name,
    material: s.category,
    unit: '',
    lat: s.lat,
    lng: s.lng,
    price: 0,
    icon: 'fa-store',
    imageUrl: null,
    rating: null,
    openHour: 0,
    closeHour: 24,
    inStock: true,
    regionId: 0,
    distanceKm: s.distanceKm,
    deliveryCost: s.deliveryCost,
    deliveryTier: s.deliveryTier,
    etaMinutes: s.etaMinutes,
  };
}

const selectCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700/60';

export default function NearbyPage() {
  const [radius, setRadius] = useState(3);
  const [source, setSource] = useState<Source | null>(null);
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [shops, setShops] = useState<NearbyShop[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [focus, setFocus] = useState<LatLng | null>(null);

  // Cascading wilayah pickers.
  const [provinceId, setProvinceId] = useState('');
  const [regencyId, setRegencyId] = useState('');
  const { data: provinces = [] } = useQuery({ queryKey: ['prov'], queryFn: getProvinces });
  const { data: regencies = [] } = useQuery({
    queryKey: ['reg', provinceId],
    queryFn: () => getRegencies(provinceId),
    enabled: !!provinceId,
  });
  const { data: districts = [] } = useQuery({
    queryKey: ['dist', regencyId],
    queryFn: () => getDistricts(regencyId),
    enabled: !!regencyId,
  });

  // Run the active source (GPS coords or a geocoded place) whenever it or the radius changes.
  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    setLoading(true);
    setErr(null);
    const p =
      source.type === 'coords'
        ? api.getNearby(source.lat, source.lng, radius)
        : api.getNearbyByPlace(source.q, radius);
    p.then((res) => {
      if (cancelled) return;
      setShops(res.shops);
      setOrigin(res.origin);
    })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Gagal memuat data.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [source, radius]);

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setErr('Peramban ini tidak mendukung deteksi lokasi.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setSource({ type: 'coords', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (e) =>
        setErr(
          e.code === e.PERMISSION_DENIED
            ? 'Izin lokasi ditolak. Klik ikon lokasi di address bar, pilih "Izinkan", lalu coba lagi.'
            : 'Gagal membaca lokasi: ' + e.message,
        ),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // Try GPS automatically on first open so nearby shops appear without an extra click.
  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDistrict = (districtId: string) => {
    const d = districts.find((x) => x.id === districtId);
    const r = regencies.find((x) => x.id === regencyId);
    const pv = provinces.find((x) => x.id === provinceId);
    if (d && r && pv) setSource({ type: 'place', q: `${d.name}, ${r.name}, ${pv.name}, Indonesia` });
  };

  const suppliers = useMemo(() => shops.map(shopToSupplier), [shops]);
  const center = origin ?? JAKARTA;

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
      <Navbar
        right={
          <Link
            to="/"
            className="press flex items-center gap-1 rounded bg-slate-100 px-2 py-1.5 text-[11px] font-bold hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <ArrowLeft size={13} /> Peta Kecamatan
          </Link>
        }
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <div className="order-1 h-[40vh] w-full shrink-0 border-b border-slate-200 dark:border-slate-700 md:order-2 md:h-full md:flex-1 md:border-b-0">
          <MapView
            center={center}
            radiusKm={radius}
            suppliers={suppliers}
            focus={focus}
            mainStoreLabel="Titik Pencarian"
          />
        </div>

        <aside className="order-2 z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 md:order-1 md:w-[420px] md:flex-none">
          <div className="shrink-0 border-b border-slate-100 p-3 dark:border-slate-700 md:p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-extrabold">
              <MapPin size={16} className="text-brand" /> Toko & Pasar Nasional
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Pilih kecamatan mana pun di Indonesia (7.285 kecamatan) atau pakai lokasimu. Data toko
              nyata dari OpenStreetMap.
            </p>

            {/* Cascading kecamatan picker */}
            <div className="mt-3 grid grid-cols-1 gap-2">
              <select
                className={selectCls}
                value={provinceId}
                onChange={(e) => {
                  setProvinceId(e.target.value);
                  setRegencyId('');
                }}
              >
                <option value="">Pilih Provinsi...</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                className={selectCls}
                value={regencyId}
                disabled={!provinceId}
                onChange={(e) => setRegencyId(e.target.value)}
              >
                <option value="">Pilih Kota/Kabupaten...</option>
                {regencies.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                className={selectCls}
                disabled={!regencyId}
                defaultValue=""
                onChange={(e) => onDistrict(e.target.value)}
              >
                <option value="">Pilih Kecamatan...</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={locate}
                className="press flex shrink-0 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-600 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-900/30 dark:text-sky-400"
              >
                <LocateFixed size={14} /> Lokasi Saya
              </button>
              <label className="flex flex-1 items-center gap-2 text-[11px] font-semibold text-slate-500">
                Radius {radius} km
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="flex-1 accent-brand"
                />
              </label>
            </div>
            {err && (
              <p className="mt-2 rounded bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {err}
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 custom-scrollbar dark:bg-slate-900">
            {!source ? (
              <p className="p-4 text-center text-xs text-slate-400">
                Pilih kecamatan di atas, atau tekan "Lokasi Saya".
              </p>
            ) : loading ? (
              <p className="p-4 text-center text-xs text-slate-400">Mencari toko nyata...</p>
            ) : shops.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400">
                Belum ada toko/pasar terdata di OpenStreetMap dalam radius ini. Coba perbesar radius.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="px-1 text-[11px] font-bold text-slate-500">
                  {shops.length} toko/pasar ditemukan
                </p>
                {shops.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{s.name}</p>
                        <span className="mt-0.5 inline-block rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-brand dark:bg-orange-900/30">
                          {s.category}
                        </span>
                      </div>
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-slate-700">
                        {formatKm(s.distanceKm)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] dark:border-slate-700">
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <Bike size={12} /> {formatRupiah(s.deliveryCost)}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-sky-500">
                        <Timer size={12} /> {s.etaMinutes} mnt
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setFocus({ lat: s.lat, lng: s.lng })}
                        className="flex items-center gap-1 rounded-lg bg-sky-500 px-2 py-1 font-bold text-white hover:bg-sky-600"
                      >
                        <Navigation size={11} /> Lihat
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
