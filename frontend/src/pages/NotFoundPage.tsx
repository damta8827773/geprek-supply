import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function NotFoundPage() {
  return (
    <AuroraBackground className="h-[100dvh]">
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <Compass size={48} className="text-brand" />
        <h1 className="text-3xl font-extrabold dark:text-white">404</h1>
        <p className="text-slate-500 dark:text-slate-300">This route is off the map.</p>
        <Link
          to="/"
          className="press rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white shadow-glow hover:bg-brand-dark"
        >
          Back to Smart Routing
        </Link>
      </div>
    </AuroraBackground>
  );
}
