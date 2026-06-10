import { useState } from 'react';
import { Check, LogOut, MapPin, ShieldCheck, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { useAllSuppliers, useSetStock } from '@/hooks/useSuppliers';
import { useAdminStore } from '@/store/adminStore';
import { useDictionary } from '@/store/uiStore';

function LoginCard() {
  const t = useDictionary();
  const login = useAdminStore((s) => s.login);
  const [email, setEmail] = useState('');

  const submit = () => {
    if (!email.includes('@')) {
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

      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 custom-scrollbar dark:border-slate-700 dark:bg-slate-800">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-400">Loading…</p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="mb-6">
              <h3 className="mb-3 rounded-lg border border-slate-100 bg-slate-50 p-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900">
                <MapPin size={14} className="mr-1 inline text-brand" /> {group.name}
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {group.suppliers.map((s, i) => (
                  <div
                    key={s.id}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="card-hover animate-slide-up flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div>
                      <p className="text-sm font-bold">{s.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.material}</p>
                    </div>
                    <button
                      onClick={() => toggle(s.id, s.inStock)}
                      disabled={setStock.isPending}
                      className={
                        'press flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ' +
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
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const email = useAdminStore((s) => s.email);

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar
        right={
          <span className="flex items-center gap-1 rounded bg-orange-100 px-2 py-1.5 text-[11px] font-bold text-brand dark:bg-orange-900/30">
            <ShieldCheck size={14} /> Admin Panel
          </span>
        }
      />
      {email ? (
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
