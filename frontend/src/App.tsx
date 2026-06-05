import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import MapPage from '@/pages/MapPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  const theme = useUiStore((s) => s.theme);

  // Keep the <html> class in sync so Tailwind's `dark:` variants apply globally.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
