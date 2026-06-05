# Geprek-Supply · Frontend

React 18 + TypeScript + Vite client.

- **Routing** — React Router (`/` map, `/admin` dashboard).
- **Server state** — TanStack Query (caching, invalidation).
- **UI state** — Zustand (theme, language, admin session), persisted to
  `localStorage`.
- **Maps** — React-Leaflet with custom div-icon markers and a smart-radius circle.
- **Styling** — Tailwind CSS with a custom `brand` palette, glassmorphism, and
  class-based dark mode.

```
src/
├── components/   Navbar, MapView, RegionTabs, RadiusControl, SupplierList/Card
├── pages/        MapPage, AdminPage, NotFoundPage
├── hooks/        useRegions, useRegionSuppliers, useAllSuppliers, useSetStock
├── store/        uiStore, adminStore
├── lib/          api client, formatters
├── i18n/         ID / EN dictionaries
└── types/        shared API types
```

## Scripts

| Script | Action |
| :--- | :--- |
| `npm run dev` | Vite dev server (proxies `/api` → backend). |
| `npm run build` | Type-check + production build. |
| `npm run preview` | Preview the production build. |

The API base URL is configured via `VITE_API_URL` (defaults to `/api`, which the
Vite dev server proxies to `http://localhost:4000`).
