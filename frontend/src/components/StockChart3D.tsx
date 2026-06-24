import type { CSSProperties } from 'react';
import type { AdminRegionGroup } from '@/types';

/**
 * Interactive 3D (oblique-projection) bar chart of supplier counts per kecamatan.
 * Bar height = total suppliers; colour = availability ratio (red → green).
 * Hover a bar to lift it and reveal the available/total tooltip.
 */
export default function StockChart3D({ groups }: { groups: AdminRegionGroup[] }) {
  const max = Math.max(1, ...groups.map((g) => g.suppliers.length));

  return (
    <div className="chart3d mb-4 rounded-2xl border border-slate-200 bg-white pb-1 dark:border-slate-700 dark:bg-slate-800">
      <p className="px-3 pt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
        📊 Pemasok per kecamatan{' '}
        <span className="font-normal">— tinggi = jumlah, warna = % tersedia (arahkan kursor)</span>
      </p>
      <div className="chart3d-scene">
        {groups.map((g) => {
          const total = g.suppliers.length;
          const avail = g.suppliers.filter((s) => s.inStock).length;
          const ratio = total ? avail / total : 0;
          const h = Math.round((total / max) * 150) + 14;
          const hue = Math.round(ratio * 130); // 0 = red, 130 = green
          const style = {
            '--h': `${h}px`,
            '--c1': `hsl(${hue} 80% 58%)`,
            '--c2': `hsl(${hue} 80% 45%)`,
            '--c-top': `hsl(${hue} 80% 68%)`,
            '--c-side': `hsl(${hue} 80% 36%)`,
          } as CSSProperties;
          return (
            <div key={g.key} className="bar3d" style={style}>
              <span className="bar3d-tip">
                {avail}/{total} tersedia
              </span>
              <div className="bar3d-col" />
              <span className="mt-2 max-w-[70px] truncate text-center text-[10px] font-semibold">
                {g.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
