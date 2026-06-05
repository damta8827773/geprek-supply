# Architecture

## Overview

Geprek-Supply is an npm-workspaces monorepo with two deployable apps that
communicate over a documented REST contract.

```
┌──────────────────────┐        HTTP / JSON         ┌──────────────────────┐
│      frontend         │  ───────────────────────▶  │       backend         │
│  React 18 + Vite      │   GET /api/regions         │  Express + TypeScript │
│  TanStack Query       │   GET /api/.../suppliers   │  routes → controllers │
│  Zustand · Leaflet    │   PATCH /api/suppliers/:id │  → services → Prisma  │
└──────────────────────┘  ◀───────────────────────  └──────────┬───────────┘
                                                                │
                                                          ┌─────▼─────┐
                                                          │  SQLite   │
                                                          │  (Prisma) │
                                                          └───────────┘
```

## Request lifecycle (backend)

1. **Router** matches the path and attaches middleware.
2. **Validation middleware** parses params/query/body with a **Zod** schema,
   replacing the raw input with a typed, coerced value.
3. **Auth middleware** (mutations only) verifies `x-admin-email` against
   `ADMIN_EMAIL` server-side.
4. **Controller** reads the typed request and delegates to a service.
5. **Service** runs the business logic — Haversine distance, radius filtering,
   cheapest-first sorting, stock updates — against Prisma.
6. **Error middleware** converts any thrown `ApiError` (or unexpected error) into
   a consistent JSON envelope.

## Smart routing

For each supplier the API computes, relative to the region's store center:

- **distance** — great-circle (Haversine) kilometres.
- **fuelCost** — `(distance / 40 km·L⁻¹) × Rp 10.000`, rounded to Rp 500.
- **fuelTier** — `efficient ≤ 3 km`, `normal ≤ 7 km`, else `thirsty`.
- **steps** — `distance × 1312` (a playful "could you walk it?" stat).

Results are filtered to the requested radius and sorted by ascending price so the
cheapest viable supplier always surfaces first.

## State management (frontend)

- **Server state** lives in TanStack Query — supplier/region data is cached and
  re-fetched/invalidated after an admin mutation.
- **UI state** (theme, language) and the **admin session** live in small Zustand
  stores persisted to `localStorage`, so preferences survive reloads.
