# 🍗 Geprek-Supply · Smart Routing Platform

[![CI](https://github.com/damta8827773/geprek-supply/actions/workflows/ci.yml/badge.svg)](https://github.com/damta8827773/geprek-supply/actions/workflows/ci.yml)
![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Prisma-339933)
![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20Prisma%20ORM-003B57)
![License](https://img.shields.io/badge/License-Educational-orange)

> **Konsep Sistem Informasi — Studi Kasus Pemetaan & Sistem Pendukung Keputusan.**
> A full-stack platform that helps an *ayam geprek* business find the **cheapest,
> closest, in-stock** raw-material suppliers using **smart radius routing**.

---

## 📌 Project Overview

**Geprek-Supply** is a decision-support & mapping system for a fried-chicken
(*ayam geprek*) supply chain. From a single store origin, a courier can sweep a
configurable radius and instantly see every nearby supplier — ranked
cheapest-first — complete with **live distance, GoRide delivery-cost estimate,
traffic-aware ETA, supplier rating, operating hours, stock status, and a one-tap
Google Maps route**.

What started as a single static HTML prototype has been re-engineered into a
**typed full-stack monorepo**: a **React 18 + TypeScript (Vite)** client talking
to a **Node.js + Express + Prisma** REST API. All supplier, region, and stock
data is served dynamically from the API and persisted in a database — and the
**owner dashboard** mutates stock in real time through a **server-verified admin
gate**.

The signature **orange neon brand**, **glassmorphism sidebar**, **light/dark
theming**, and **bilingual UI** are fully preserved — the same experience,
rebuilt on a professional, scalable foundation that **runs from the terminal**,
not a live-preview extension.

---

## ⚠️ Academic Integrity & Usage Policy

**Please read this section before exploring the code.**

This repository is published as **Open Source for Educational Analysis**.

> "Official source code for my Information Systems coursework. Published for
> **educational analysis and technical reference only**. To foster authentic
> learning, please use this repository to understand the underlying logic rather
> than for direct duplication."

### ✅ Permitted Use

- **Code Analysis** — studying the monorepo structure, REST API design, and
  state management.
- **Reference** — reusing isolated patterns (the i18n dictionary, the smart-radius
  Haversine logic, the layered controller/service architecture) in your own work.
- **Inspiration** — observing how a static prototype is migrated into a typed
  full-stack application.

### ❌ Prohibited Use

- **Direct Cloning** — copy-pasting the whole codebase and submitting it as your
  own assignment.
- **Plagiarism** — claiming this design or architecture as your own intellectual
  property.

> *"True mastery in engineering comes from building, breaking, and fixing code
> yourself — not by copying results."*

---

## 🛠️ Technical Specifications

| Layer | Implementation Details |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS, React Router, TanStack Query (server state), Zustand (UI/session state), **MapLibre GL** maps (CARTO basemap). |
| **Backend** | Node.js + Express + TypeScript, layered **routes → controllers → services → middleware**, Pino structured logging, Helmet, CORS allow-list, rate limiting. |
| **Database** | Prisma ORM with **SQLite** by default (zero external setup) — type-safe queries, migrations, and seeding. Portable to MySQL/PostgreSQL via one line. |
| **Validation** | Zod schemas guarding every request (params, query, and body). |
| **Auth** | Server-side admin gate — stock mutations are re-verified against `ADMIN_EMAIL` on the server (constant-time compare), with an **optional shared-secret token** second factor, a dedicated admin rate limiter, and an **audit log** of every change. |
| **Routing/ETA** | **TomTom Routing API** (motorbike + live traffic) for real-time distance & ETA, falling back to OSRM / Haversine estimates when unavailable. |
| **Architecture** | npm-workspaces monorepo (`frontend`, `backend`) with a shared, documented REST contract. |

---

## ✨ Key Features

- **🎯 Smart Radius Routing** — Haversine distance from the store origin, filtered
  by a live radius slider and **sorted cheapest-first**.
- **🛵 Decision Metrics** — per-supplier **GoRide delivery-cost** estimate, cost
  tier, ETA, and operating hours (open/closed status).
- **🗺️ Interactive Map** — MapLibre GL with custom markers, popups, a radius ring,
  routing lines from the store to each supplier, and fly-to-on-select.
- **🧭 One-Tap Google Maps** — deep-links straight into turn-by-turn directions
  (disabled for out-of-stock suppliers).
- **🛡️ Owner Dashboard** — toggle stock availability in real time; changes sync
  instantly back to the courier map. Each supplier shows its **region, coordinates,
  and a view-on-map link** so the owner can verify locations at a glance.
- **📸 Real Product Photos** — each material shows a real photo (CC0 images in
  `frontend/public/products/`, swappable for your own), with a graceful emoji
  fallback if an image fails to load.
- **🌗 Theme Switcher** — seamless Dark (neon) / Light mode, persisted locally.
- **🌐 Bilingual (i18n)** — built-in Indonesian 🇮🇩 & English 🇬🇧 support.
- **📱 Fully Responsive** — split map/sidebar layout that reflows for mobile.

---

## 🗂️ Project Structure

```
geprek-supply/
├── frontend/                 # React 18 + TypeScript + Vite client
│   ├── src/
│   │   ├── components/        # Navbar, MapView, RegionTabs, RadiusControl, Supplier*…
│   │   ├── pages/             # MapPage, AdminPage, NotFoundPage
│   │   ├── hooks/             # TanStack Query data hooks
│   │   ├── store/             # Zustand stores (UI theme/lang, admin session)
│   │   ├── lib/               # API client, formatters
│   │   ├── i18n/              # ID / EN dictionaries
│   │   └── types/             # Shared API types
│   └── vite.config.ts
│
├── backend/                  # Node.js + Express + Prisma REST API
│   ├── prisma/
│   │   ├── schema.prisma      # Region & Supplier models
│   │   └── seed.ts            # Initial supplier dataset
│   └── src/
│       ├── routes/            # Express routers
│       ├── controllers/       # Request/response handlers
│       ├── services/          # Business logic (smart routing, stock)
│       ├── middleware/        # auth, validation, error handling
│       ├── schemas/           # Zod request schemas
│       ├── utils/             # Haversine geo math, helpers
│       └── app.ts / index.ts  # App factory & bootstrap
│
├── package.json              # npm workspaces + root scripts
├── README.md
└── LICENSE
```

---

## 🚀 Getting Started (Local Development)

> This is a real client/server application — it runs **from the terminal**, not by
> opening an HTML file.

### Prerequisites

- **Node.js** ≥ 20

### 1. Clone & install

```bash
git clone https://github.com/damta8827773/geprek-supply.git
cd geprek-supply
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Set up the database

```bash
npm run db:migrate   # create the SQLite schema (Prisma)
npm run db:seed      # load the initial supplier dataset
```

### 4. Run the public courier app

```bash
npm run dev          # API → http://localhost:4000   ·   Web → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

### 5. Run the Admin Dashboard (separate app)

The owner dashboard is a **separate application** — it is **not** exposed on the
public courier site. With `npm run dev` already running (it provides the shared
API), open a **second terminal**:

```bash
npm run admin        # Admin dashboard → http://localhost:5174
```

Open **http://localhost:5174** and sign in with the email configured in
`backend/.env` (`ADMIN_EMAIL`). Stock changes sync live to the public map.

---

## 🔌 REST API Reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | – | Service health check. |
| `GET` | `/regions` | – | List all serviced regions with their store center. |
| `GET` | `/regions/:key/suppliers?radius=15` | – | Suppliers within a radius (km), enriched with distance, delivery cost, and traffic-aware ETA, sorted cheapest-first. |
| `GET` | `/suppliers` | – | Full inventory grouped by region (dashboard). |
| `PATCH` | `/suppliers/:id` | 🔒 | Set a supplier's stock availability. |

Admin requests must send an `x-admin-email` header matching `ADMIN_EMAIL`;
the server returns **401** when missing and **403** when unauthorized. When
`ADMIN_TOKEN` is configured, a matching `x-admin-token` header is **also**
required (**401** otherwise). Admin writes are additionally capped at **20
req/min** and every successful change is written to the audit log.

---

## 🔒 Security

Security is enforced **server-side** — the client UI is never trusted as the sole
gatekeeper. Controls in place:

| # | Control | Implementation | Status |
| :-: | :--- | :--- | :---: |
| 1 | **Authorization** | Stock mutations require `x-admin-email` = `ADMIN_EMAIL`, checked on the server with a **constant-time compare** (`timingSafeEqual`). Wrong/absent → **403/401**. | ✅ |
| 2 | **Second factor (optional)** | When `ADMIN_TOKEN` is set, a matching `x-admin-token` header is also required — knowing the email alone is no longer enough. | ✅ |
| 3 | **Input validation** | **Zod** validates every param, query, and body before it reaches business logic; JSON body capped at **100 kb**. | ✅ |
| 4 | **Injection safety** | All DB access goes through **Prisma** (parameterized) — no raw SQL string building. | ✅ |
| 5 | **Rate limiting** | Global **120 req/min** on `/api`, plus a stricter **20 req/min** limiter on admin mutations. | ✅ |
| 6 | **Security headers** | **Helmet** sets hardened HTTP headers; `x-powered-by` disabled. | ✅ |
| 7 | **CORS** | Explicit **allow-list** (`CORS_ORIGINS`) — only trusted origins may call the API. | ✅ |
| 8 | **Audit trail** | Every stock change is logged (admin email, supplier id, new status) via **Pino** for traceability. | ✅ |
| 9 | **Error hygiene** | Central error handler returns a generic **500** and never leaks stack traces to clients. | ✅ |
| 10 | **Secret hygiene** | `TOMTOM_API_KEY` / `ADMIN_TOKEN` live in `.env` (git-ignored); env is validated by Zod at boot. | ✅ |

### Approval status

**Prototype: APPROVED ✅** — for an educational prototype, authorization,
integrity, availability, and confidentiality controls are all enforced at the
server (aligned with COBIT / ISO 27002 principles).

**Production hardening (recommended before public deployment):**

- 🔑 Replace the email gate with real authentication (**JWT / OAuth / Firebase Auth**);
  enable `ADMIN_TOKEN` as an interim measure.
- 🔐 Terminate **HTTPS** at a reverse proxy (TLS/HSTS) and set `NODE_ENV=production`.
- 👥 Add proper **user accounts & roles** if more than one admin is needed.

> These map directly to the *Audit Sistem Informasi* findings in the project
> documentation — the current gaps are **known and documented**, not overlooked.

---

## 📜 Available Scripts (root)

| Script | Action |
| :--- | :--- |
| `npm run dev` | Run API + public Web concurrently (port 5173). |
| `npm run admin` | Run the separate Admin Dashboard (port 5174). |
| `npm run build` | Type-check & build both workspaces. |
| `npm run db:migrate` | Apply the Prisma schema. |
| `npm run db:seed` | Seed the database. |
| `npm run db:reset` | Drop, re-migrate, and re-seed. |
| `npm run format` | Prettier across the repo. |

---

## 📬 Contact

For questions about the architecture or a potential collaboration, feel free to
reach out.

- **Email:** damtafaiz@gmail.com
- **GitHub:** [@damta8827773](https://github.com/damta8827773)

---

<p align="center">
  Crafted with passion by <strong>Damta Noviyan Muhamad Faiz</strong>. <br>
  <em>Happy Coding & Keep Learning! 🚀</em>
</p>
