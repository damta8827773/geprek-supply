import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Surface any fatal error (module load / async) on the page if React never mounts.
function showFatal(message: string) {
  const el = document.getElementById('root');
  if (el && !el.hasChildNodes()) {
    el.innerHTML = `<pre style="padding:24px;color:#b91c1c;white-space:pre-wrap;font:14px monospace">⚠️ ${message}</pre>`;
  }
}
window.addEventListener('error', (e) => showFatal(`${e.message}\n${e.error?.stack ?? ''}`));
window.addEventListener('unhandledrejection', (e) =>
  showFatal(`Unhandled rejection: ${e.reason?.message ?? e.reason}`),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
