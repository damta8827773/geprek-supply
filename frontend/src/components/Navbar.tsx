import { type ReactNode } from 'react';
import { Languages, Moon, Sun, Truck } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

interface NavbarProps {
  /** Optional slot rendered on the far right (e.g. admin user chip). */
  right?: ReactNode;
}

export default function Navbar({ right }: NavbarProps) {
  const { theme, lang, toggleTheme, toggleLang } = useUiStore();

  return (
    <nav className="z-20 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:px-4 md:py-3">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-brand p-1.5 text-white shadow-glow">
          <Truck size={16} />
        </div>
        <h1 className="text-base font-extrabold tracking-tight md:text-lg">
          Geprek<span className="text-brand">Supply</span>
        </h1>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1.5 text-[11px] font-bold hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
          aria-label="Toggle language"
        >
          <Languages size={14} className="text-brand" />
          {lang.toUpperCase()}
        </button>
        <button
          onClick={toggleTheme}
          className="rounded bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
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
