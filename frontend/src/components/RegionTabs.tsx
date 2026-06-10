import clsx from 'clsx';
import type { Region } from '@/types';

interface RegionTabsProps {
  regions: Region[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function RegionTabs({ regions, activeKey, onChange }: RegionTabsProps) {
  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto rounded-lg bg-slate-100 p-1 custom-scrollbar dark:bg-slate-900">
      {regions.map((r) => {
        const active = r.key === activeKey;
        return (
          <button
            key={r.key}
            onClick={() => onChange(r.key)}
            className={clsx(
              'press shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all',
              active
                ? 'bg-gradient-to-r from-brand to-orange-500 text-white shadow-glow'
                : 'text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-700/50',
            )}
          >
            {r.name}
          </button>
        );
      })}
    </div>
  );
}
