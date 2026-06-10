import { Loader2, SatelliteDish, SortAsc } from 'lucide-react';
import { useDictionary } from '@/store/uiStore';

interface RadiusControlProps {
  radius: number;
  onRadiusChange: (value: number) => void;
  onSearch: () => void;
  searching: boolean;
}

export default function RadiusControl({
  radius,
  onRadiusChange,
  onSearch,
  searching,
}: RadiusControlProps) {
  const t = useDictionary();

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/60">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-tight">{t.searchRadius}</label>
        <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
          {radius} Km
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={radius}
        onChange={(e) => onRadiusChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-300 accent-brand dark:bg-slate-800"
      />

      <button
        onClick={onSearch}
        disabled={searching}
        className="press mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2.5 text-xs font-bold text-white shadow transition-colors hover:bg-brand hover:shadow-glow disabled:opacity-80 dark:bg-slate-900 dark:hover:bg-brand"
      >
        {searching ? (
          <>
            <Loader2 size={14} className="animate-spin" /> {t.processing}
          </>
        ) : (
          <>
            <SatelliteDish size={14} /> {t.checkAvailability}
          </>
        )}
      </button>

      <div className="mt-1.5 flex items-center justify-center gap-1 rounded bg-emerald-100 p-1.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
        <SortAsc size={12} /> {t.sortedCheapest}
      </div>
    </div>
  );
}
