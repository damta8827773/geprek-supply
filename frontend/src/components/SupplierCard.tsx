import clsx from 'clsx';
import { Bike, Clock, Crown, Navigation, Star, Timer } from 'lucide-react';
import type { DeliveryTier, LatLng, Supplier } from '@/types';
import { useDictionary } from '@/store/uiStore';
import { formatKm, formatRupiah } from '@/lib/format';
import ProductThumb from '@/components/ProductThumb';

const COST_COLOR: Record<DeliveryTier, string> = {
  low: 'text-emerald-500',
  mid: 'text-yellow-500',
  high: 'text-red-500',
};

const fmtHour = (h: number) => `${String(h).padStart(2, '0')}.00`;

interface SupplierCardProps {
  supplier: Supplier;
  onSelect: (supplier: Supplier) => void;
  /** Position in the list — drives the staggered entrance animation. */
  index?: number;
  /** Highlight as the cheapest available supplier. */
  best?: boolean;
  /** Store origin so the route starts from the same point the system measures from. */
  origin: LatLng;
}

export default function SupplierCard({
  supplier: s,
  onSelect,
  index = 0,
  best = false,
  origin,
}: SupplierCardProps) {
  const t = useDictionary();
  const isOpen = new Date().getHours() >= s.openHour && new Date().getHours() < s.closeHour;

  return (
    <button
      type="button"
      onClick={() => onSelect(s)}
      style={{ animationDelay: `${index * 60}ms` }}
      className={clsx(
        'card-hover animate-slide-up flex w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm dark:bg-slate-800',
        best
          ? 'border-brand ring-2 ring-brand/40'
          : s.inStock
            ? 'border-slate-200 hover:border-brand dark:border-slate-700'
            : 'border-red-200 opacity-70 dark:border-red-900',
      )}
    >
      {/* LEFT — product image panel */}
      <div
        className={clsx(
          'flex w-[84px] shrink-0 items-center justify-center text-[2.6rem] leading-none',
          s.inStock
            ? 'bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-900/40 dark:to-amber-900/20'
            : 'bg-slate-100 grayscale dark:bg-slate-700/60',
        )}
        aria-hidden
      >
        <ProductThumb
          material={s.material}
          src={s.imageUrl}
          className="h-full w-full object-cover"
          emojiClassName="text-[2.6rem]"
        />
      </div>

      {/* RIGHT — info */}
      <div className="min-w-0 flex-1 p-2.5">
        {best && (
          <span className="mb-1 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-brand px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white">
            <Crown size={9} /> {t.bestDeal}
          </span>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-xs font-bold leading-tight">{s.name}</h3>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{s.material}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold dark:bg-slate-700">
              {formatKm(s.distanceKm)}
            </span>
            {s.rating != null && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                <Star size={10} className="fill-amber-400 text-amber-400" /> {s.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              {t.priceLabel}
            </span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formatRupiah(s.price)}
            </span>
            <span className="text-[9px] font-medium text-slate-400">/ {s.unit}</span>
          </div>
          <span
            className={clsx(
              'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase',
              s.inStock
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
            )}
          >
            {s.inStock ? t.inStock : t.outOfStock}
          </span>
        </div>

        {/* Operating hours + open/closed */}
        <div className="mt-1.5 flex items-center justify-between text-[9px]">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Clock size={10} /> {t.hoursLabel} {fmtHour(s.openHour)}–{fmtHour(s.closeHour)}
          </span>
          <span
            className={clsx(
              'rounded px-1.5 py-0.5 font-bold uppercase',
              isOpen
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
            )}
          >
            {isOpen ? t.openNow : t.closedNow}
          </span>
        </div>

        <div className="mb-2 mt-1.5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-1.5 dark:border-slate-700">
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
              <Timer size={11} /> {s.etaMinutes} {t.etaUnit}
            </span>
          </div>
        </div>

        {s.inStock ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${s.lat},${s.lng}&travelmode=two-wheeler`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-sky-500 py-1.5 text-[10px] font-bold text-white hover:bg-sky-600"
          >
            <Navigation size={12} /> {t.mapsRoute}
          </a>
        ) : (
          <span className="flex w-full cursor-not-allowed items-center justify-center gap-1 rounded-lg bg-slate-200 py-1.5 text-[10px] font-bold text-slate-400 dark:bg-slate-700">
            <Navigation size={12} /> {t.mapsRoute}
          </span>
        )}
      </div>
    </button>
  );
}
