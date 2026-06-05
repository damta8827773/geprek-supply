import clsx from 'clsx';
import type { Region } from '@/types';

interface RegionTabsProps {
  regions: Region[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function RegionTabs({ regions, activeKey, onChange }: RegionTabsProps) {
  return (
    <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
      {regions.map((r) => {
        const active = r.key === activeKey;
        return (
          <button
            key={r.key}
            onClick={() => onChange(r.key)}
            className={clsx(
              'press flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all',
              active
                ? 'scale-[1.03] bg-white text-brand shadow dark:bg-slate-700'
                : 'text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-700/50',
            )}
          >
            {r.name}
          </button>
        );
      })}
    </div>
  );
}
