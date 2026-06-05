import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-slate-50 text-center dark:bg-slate-900">
      <Compass size={48} className="text-brand" />
      <h1 className="text-3xl font-extrabold">404</h1>
      <p className="text-slate-500 dark:text-slate-400">This route is off the map.</p>
      <Link
        to="/"
        className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
      >
        Back to Smart Routing
      </Link>
    </div>
  );
}
