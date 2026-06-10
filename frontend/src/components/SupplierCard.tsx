import clsx from 'clsx';
import { Bike, Clock, Crown, Navigation } from 'lucide-react';
import type { DeliveryTier, Supplier } from '@/types';
import { useDictionary } from '@/store/uiStore';
import { formatKm, formatRupiah } from '@/lib/format';

const COST_COLOR: Record<DeliveryTier, string> = {
  low: 'text-emerald-500',
  mid: 'text-yellow-500',
  high: 'text-red-500',
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
        <div className="flex items-baseline gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            {t.priceLabel}
          </span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {formatRupiah(s.price)}
          </span>
        </div>
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
          <span className="block text-[8px] font-bold uppercase tracking-wide text-slate-400">
            {t.deliveryCost}
          </span>
          <span className={clsx('flex items-center gap-1 font-bold', COST_COLOR[s.deliveryTier])}>
            <Bike size={11} /> {formatRupiah(s.deliveryCost)}
          </span>
        </div>
        <div className="text-right text-[9px] text-slate-500 dark:text-slate-400">
          <span className="block text-[8px] font-bold uppercase tracking-wide text-slate-400">
            {t.etaLabel}
          </span>
          <span className="flex items-center justify-end gap-1 font-bold text-sky-500">
            <Clock size={11} /> {s.etaMinutes} {t.etaUnit}
          </span>
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
