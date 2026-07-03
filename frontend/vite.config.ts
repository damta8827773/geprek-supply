import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Always use 5173 - fail loudly instead of silently hopping to 5174/5175,
    // which makes the dev URL a confusing moving target.
    strictPort: true,
    // Allow serving files from the monorepo root. `strict: false` also keeps the
    // dev server working when the project lives in a path with unusual
    // characters (e.g. spaces or "~").
    fs: { allow: ['..'], strict: false },
    proxy: {
      // Convenience: lets the client call `/api/*` in dev without CORS juggling.
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
