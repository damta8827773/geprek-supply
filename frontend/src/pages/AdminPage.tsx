import { useState } from 'react';
import { Check, Clock, LogOut, MapPin, Search, ShieldCheck, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { useAllSuppliers, useSetStock } from '@/hooks/useSuppliers';
import { useAdminStore } from '@/store/adminStore';
import { useDictionary } from '@/store/uiStore';
import { formatRupiah } from '@/lib/format';
import ProductThumb from '@/components/ProductThumb';

/** Emails allowed into the admin dashboard (comma-separated; matches the server's ADMIN_EMAIL). */
const ADMIN_EMAILS = ((import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ??
  'damtafaiz@gmail.com')
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
  const [region, setRegion] = useState('all');
  const needle = q.trim().toLowerCase();

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
          <option value="all">Semua kecamatan</option>
          {groups.map((g) => (
            <option key={g.key} value={g.key}>
              {g.name}
            </option>
          ))}
        </select>
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
                          {String(s.openHour).padStart(2, '0')}.00–
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
