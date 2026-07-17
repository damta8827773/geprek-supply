import { type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Globe, Languages, LogIn, LogOut, Map, Moon, ShieldCheck, Store, Sun } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { useMerchantStore } from '@/store/merchantStore';
import Logo from '@/components/Logo';

const ADMIN_MODE = import.meta.env.VITE_ADMIN === 'true';

interface NavbarProps {
  /** Optional slot rendered on the far right (e.g. admin user chip). */
  right?: ReactNode;
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
    isActive
      ? 'bg-orange-100 text-brand dark:bg-orange-900/30'
      : 'text-slate-500 hover:bg-slate-100 hover:text-brand dark:text-slate-400 dark:hover:bg-slate-700'
  }`;

export default function Navbar({ right }: NavbarProps) {
  const { theme, lang, toggleTheme, toggleLang } = useUiStore();
  const merchant = useMerchantStore((s) => s.merchant);
  const logout = useMerchantStore((s) => s.logout);

  return (
    <nav className="z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:px-4 md:py-3">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <Logo size={32} />
          <h1 className="text-base font-extrabold tracking-tight md:text-lg">
            Geprek<span className="text-brand">Supply</span>
          </h1>
        </Link>

        {!ADMIN_MODE && (
          <div className="hidden items-center gap-0.5 md:flex">
            <NavLink to="/" className={linkCls} end>
              <Map size={13} /> Peta Kecamatan
            </NavLink>
            <NavLink to="/nearby" className={linkCls}>
              <Globe size={13} /> Cari Nasional
            </NavLink>
            <NavLink to="/daftar" className={linkCls}>
              <Store size={13} /> Daftarkan Toko
            </NavLink>
            <NavLink to="/privasi" className={linkCls}>
              <ShieldCheck size={13} /> Privasi
            </NavLink>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        {!ADMIN_MODE &&
          (merchant ? (
            <div className="flex items-center gap-1">
              <Link
                to="/toko"
                className="press flex max-w-[150px] items-center gap-1 truncate rounded bg-orange-100 px-2 py-1.5 text-[11px] font-bold text-brand hover:bg-orange-200 dark:bg-orange-900/30"
              >
                <Store size={13} /> {merchant.shopName}
              </Link>
              <button
                onClick={logout}
                className="press flex items-center gap-1 rounded bg-red-100 px-2 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
              >
                <LogOut size={13} /> Keluar
              </button>
            </div>
          ) : (
            <Link
              to="/masuk"
              className="press flex items-center gap-1 rounded bg-brand px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-orange-600"
            >
              <LogIn size={13} /> Masuk
            </Link>
          ))}

        <button
          onClick={toggleLang}
          className="press flex items-center gap-1 rounded bg-slate-100 px-2 py-1.5 text-[11px] font-bold hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
          aria-label="Toggle language"
        >
          <Languages size={14} className="text-brand" />
          {lang.toUpperCase()}
        </button>
        <button
          onClick={toggleTheme}
          className="press rounded bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun size={14} className="text-yellow-400" />
          ) : (
            <Moon size={14} className="text-indigo-500" />
          )}
        </button>
        {right}
      </div>
    </nav>
  );
}
