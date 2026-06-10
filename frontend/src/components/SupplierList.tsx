import { PackageOpen, Store, Tag } from 'lucide-react';
import type { Supplier } from '@/types';
import { useDictionary } from '@/store/uiStore';
import { formatRupiah } from '@/lib/format';
import SupplierCard from './SupplierCard';

interface SupplierListProps {
  suppliers: Supplier[];
  loading: boolean;
  onSelect: (supplier: Supplier) => void;
}

export default function SupplierList({ suppliers, loading, onSelect }: SupplierListProps) {
  const t = useDictionary();

  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer h-28 rounded-xl bg-slate-200/70 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="mt-10 px-6 text-center text-xs font-bold text-slate-400">
        <PackageOpen size={32} className="mx-auto mb-2" />
        <p>{t.emptyTitle}</p>
        <p className="mt-1 font-normal">{t.emptyBody}</p>
      </div>
    );
  }

  // Suppliers arrive sorted cheapest-first, so the first in-stock one is the best deal.
  const bestIndex = suppliers.findIndex((s) => s.inStock);
  const cheapest = bestIndex >= 0 ? suppliers[bestIndex].price : null;

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-[11px] font-bold shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/70">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
          <Store size={13} className="text-brand" /> {suppliers.length} {t.statSuppliers}
        </span>
        {cheapest !== null && (
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Tag size={13} /> {t.statFrom} {formatRupiah(cheapest)}
          </span>
        )}
      </div>

      {suppliers.map((s, i) => (
        <SupplierCard
          key={s.id}
          supplier={s}
          onSelect={onSelect}
          index={i}
          best={i === bestIndex}
        />
      ))}
    </div>
  );
}
