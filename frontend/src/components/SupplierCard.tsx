import clsx from 'clsx';
import { Crown, Footprints, Fuel, Navigation } from 'lucide-react';
import type { FuelTier, Supplier } from '@/types';
import { useDictionary } from '@/store/uiStore';
import { formatKm, formatNumber, formatRupiah } from '@/lib/format';

const FUEL_COLOR: Record<FuelTier, string> = {
  efficient: 'text-emerald-500',
  normal: 'text-yellow-500',
  thirsty: 'text-red-500',
};

interface SupplierCardProps {
  supplier: Supplier;
  onSelect: (supplier: Supplier) => void;
  /** Position in the list — drives the staggered entrance animation. */
  index?: number;
  /** Highlight as the cheapest available supplier. */
  best?: boolean;
}

export default function SupplierCard({
  supplier: s,
  onSelect,
  index = 0,
  best = false,
}: SupplierCardProps) {
  const t = useDictionary();
  const fuelLabel =
    s.fuelTier === 'efficient' ? t.fuelEfficient : s.fuelTier === 'normal' ? t.fuelNormal : t.fuelThirsty;

  return (
    <button
      type="button"
      onClick={() => onSelect(s)}
      style={{ animationDelay: `${index * 60}ms` }}
      className={clsx(
        'card-hover animate-slide-up relative block w-full rounded-xl border bg-white p-3 text-left shadow-sm dark:bg-slate-800',
        best
          ? 'border-brand ring-2 ring-brand/40'
          : s.inStock
            ? 'border-slate-200 hover:border-brand dark:border-slate-700'
            : 'border-red-200 opacity-60 dark:border-red-900',
      )}
    >
      {best && (
        <span className="absolute -right-1.5 -top-1.5 z-10 flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-brand px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white shadow-md">
          <Crown size={9} /> {t.bestDeal}
        </span>
      )}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-brand dark:bg-orange-900/30">
            <i className={clsx('fa-solid', s.icon, 'text-xs')} />
          </span>
          <div>
            <h3 className="text-xs font-bold leading-tight">{s.name}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.material}</p>
          </div>
        </div>
        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-slate-700">
          {formatKm(s.distanceKm)}
        </span>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
          {formatRupiah(s.price)}
        </span>
        <span
          className={clsx(
            'rounded px-2 py-0.5 text-[9px] font-extrabold uppercase',
            s.inStock
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
          )}
        >
          {s.inStock ? t.inStock : t.outOfStock}
        </span>
      </div>

      <div className="mb-3 mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 dark:border-slate-700">
        <div className="text-[9px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Fuel size={11} className="text-orange-500" /> {formatRupiah(s.fuelCost)}
          </span>
          <span className={clsx('font-bold', FUEL_COLOR[s.fuelTier])}>{fuelLabel}</span>
        </div>
        <div className="text-right text-[9px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center justify-end gap-1">
            <Footprints size={11} className="text-sky-500" /> {formatNumber(s.steps)} {t.steps}
          </span>
          <span className="font-bold text-slate-400 dark:text-slate-500">{t.landEstimate}</span>
        </div>
      </div>

      {s.inStock ? (
        <a
          href={`https://waze.com/ul?ll=${s.lat},${s.lng}&navigate=yes`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-1 rounded-lg bg-sky-500 py-1.5 text-[10px] font-bold text-white hover:bg-sky-600"
        >
          <Navigation size={12} /> {t.wazeRoute}
        </a>
      ) : (
        <span className="flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-lg bg-slate-200 py-1.5 text-[10px] font-bold text-slate-400 dark:bg-slate-700">
          <Navigation size={12} /> {t.wazeRoute}
        </span>
      )}
    </button>
  );
}
