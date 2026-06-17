import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import MapPage from '@/pages/MapPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Built as a separate app when launched with `npm run admin` (VITE_ADMIN=true).
// The public courier app never bundles or exposes the admin dashboard.
const ADMIN_MODE = import.meta.env.VITE_ADMIN === 'true';

export default function App() {
  const theme = useUiStore((s) => s.theme);

  // Keep the <html> class in sync so Tailwind's `dark:` variants apply globally.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  if (ADMIN_MODE) {
    return (
      <Routes>
        <Route path="/" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      {/* Direct-URL access to the dashboard; intentionally not linked in the public UI. */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
