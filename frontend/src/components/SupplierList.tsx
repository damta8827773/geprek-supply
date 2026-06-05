import { PackageOpen } from 'lucide-react';
import type { Supplier } from '@/types';
import { useDictionary } from '@/store/uiStore';
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

  return (
    <div className="space-y-3 p-3">
      {suppliers.map((s, i) => (
        <SupplierCard key={s.id} supplier={s} onSelect={onSelect} index={i} />
      ))}
    </div>
  );
}
