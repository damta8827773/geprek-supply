import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import FloatingWA from '@/components/FloatingWA';
import LiveChatWidget from '@/components/LiveChatWidget';
import MapPage from '@/pages/MapPage';
import NearbyPage from '@/pages/NearbyPage';
import RegisterPage from '@/pages/RegisterPage';
import LoginPage from '@/pages/LoginPage';
import ResetPage from '@/pages/ResetPage';
import MerchantDashboard from '@/pages/MerchantDashboard';
import PrivacyPage from '@/pages/PrivacyPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Built as a separate app when launched with `npm run admin` (VITE_ADMIN=true).
// The public courier app never bundles or exposes the admin dashboard.
const ADMIN_MODE = import.meta.env.VITE_ADMIN === 'true';

export default function App() {
  const theme = useUiStore((s) => s.theme);
  const { pathname } = useLocation();

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
    <>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/nearby" element={<NearbyPage />} />
        <Route path="/daftar" element={<RegisterPage />} />
        <Route path="/masuk" element={<LoginPage />} />
        <Route path="/reset" element={<ResetPage />} />
        <Route path="/toko" element={<MerchantDashboard />} />
        <Route path="/privasi" element={<PrivacyPage />} />
        {/* Direct-URL access to the dashboard; intentionally not linked in the public UI. */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* Floating live-chat + WhatsApp contact bubbles on every public page (hidden on admin). */}
      {!pathname.startsWith('/admin') && (
        <>
          <LiveChatWidget />
          <FloatingWA />
        </>
      )}
    </>
  );
}
