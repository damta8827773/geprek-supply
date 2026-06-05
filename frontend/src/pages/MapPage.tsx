import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import RegionTabs from '@/components/RegionTabs';
import RadiusControl from '@/components/RadiusControl';
import SupplierList from '@/components/SupplierList';
import MapView from '@/components/MapView';
import { useRegionSuppliers, useRegions } from '@/hooks/useSuppliers';
import { useDictionary } from '@/store/uiStore';
import type { LatLng, Supplier } from '@/types';

export default function MapPage() {
  const t = useDictionary();
  const { data: regions = [] } = useRegions();

  const [activeKey, setActiveKey] = useState<string>('');
  const [radius, setRadius] = useState(15);
  const [appliedRadius, setAppliedRadius] = useState(15);
  const [focus, setFocus] = useState<LatLng | null>(null);

  // Pick the first region once the list arrives.
  useEffect(() => {
    if (!activeKey && regions.length > 0) setActiveKey(regions[0].key);
  }, [regions, activeKey]);

  const { data, isFetching } = useRegionSuppliers(activeKey || undefined, appliedRadius);

  const center: LatLng = useMemo(() => {
    if (data?.region.center) return data.region.center;
    const r = regions.find((x) => x.key === activeKey);
    return r?.center ?? { lat: -6.1194, lng: 106.8832 };
  }, [data, regions, activeKey]);

  const suppliers: Supplier[] = data?.suppliers ?? [];

  const handleRegionChange = (key: string) => {
    setActiveKey(key);
    setFocus(null);
  };

  const handleSearch = () => setAppliedRadius(radius);
  const handleSelect = (s: Supplier) => setFocus({ lat: s.lat, lng: s.lng });

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden">
      <Navbar
        right={
          <Link
            to="/admin"
            className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1.5 text-[11px] font-bold hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <ShieldCheck size={14} className="text-brand" /> Admin
          </Link>
        }
      />

      <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Map (top on mobile, right on desktop) */}
        <div className="order-1 h-[40vh] w-full shrink-0 border-b border-slate-200 dark:border-slate-700 md:order-2 md:h-full md:flex-1 md:border-b-0">
          <MapView
            center={center}
            radiusKm={appliedRadius}
            suppliers={suppliers}
            focus={focus}
            mainStoreLabel={t.mainStore}
          />
        </div>

        {/* Sidebar */}
        <aside className="order-2 z-10 flex w-full flex-1 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 md:order-1 md:w-[420px] md:flex-none">
          <div className="shrink-0 border-b border-slate-100 p-3 dark:border-slate-700 md:p-4">
            <RegionTabs regions={regions} activeKey={activeKey} onChange={handleRegionChange} />
            <RadiusControl
              radius={radius}
              onRadiusChange={setRadius}
              onSearch={handleSearch}
              searching={isFetching}
            />
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 custom-scrollbar dark:bg-slate-900">
            <SupplierList suppliers={suppliers} loading={isFetching} onSelect={handleSelect} />
          </div>
        </aside>
      </div>
    </div>
  );
}
