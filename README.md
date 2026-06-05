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
cheapest-first — complete with **live distance, fuel-cost estimate, walking-step
estimate, stock status, and a one-tap Waze route**.

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
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS, React Router, TanStack Query (server state), Zustand (UI/session state), React-Leaflet maps. |
| **Backend** | Node.js + Express + TypeScript, layered **routes → controllers → services → middleware**, Pino structured logging, Helmet, CORS allow-list, rate limiting. |
| **Database** | Prisma ORM with **SQLite** by default (zero external setup) — type-safe queries, migrations, and seeding. Portable to MySQL/PostgreSQL via one line. |
| **Validation** | Zod schemas guarding every request (params, query, and body). |
| **Auth** | Server-side admin gate — stock mutations are re-verified against `ADMIN_EMAIL` on the server, never trusting the client UI alone. |
| **Architecture** | npm-workspaces monorepo (`frontend`, `backend`) with a shared, documented REST contract. |

---

## ✨ Key Features

- **🎯 Smart Radius Routing** — Haversine distance from the store origin, filtered
  by a live radius slider and **sorted cheapest-first**.
- **⛽ Decision Metrics** — per-supplier fuel-cost estimate, efficiency tier
  (Irit / Normal / Boros), and a walking-step estimate.
- **🗺️ Interactive Map** — React-Leaflet with custom markers, radius circle,
  auto-fit bounds, and fly-to-on-select.
- **🧭 One-Tap Waze** — deep-links straight into turn-by-turn navigation (disabled
  for out-of-stock suppliers).
- **🛡️ Owner Dashboard** — toggle stock availability in real time; changes sync
  instantly back to the courier map.
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

### 4. Run both apps

```bash
npm run dev          # API → http://localhost:4000   ·   Web → http://localhost:5173
```

Open **http://localhost:5173** in your browser. To manage stock, visit
**/admin** and sign in with the email configured in `backend/.env`
(`ADMIN_EMAIL`).

---

## 🔌 REST API Reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | – | Service health check. |
| `GET` | `/regions` | – | List all serviced regions with their store center. |
| `GET` | `/regions/:key/suppliers?radius=15` | – | Suppliers within a radius (km), enriched with distance/fuel/steps and sorted cheapest-first. |
| `GET` | `/suppliers` | – | Full inventory grouped by region (dashboard). |
| `PATCH` | `/suppliers/:id` | 🔒 | Set a supplier's stock availability. |

Admin requests must send an `x-admin-email` header matching `ADMIN_EMAIL`;
the server returns **401** when missing and **403** when unauthorized.

---

## 📜 Available Scripts (root)

| Script | Action |
| :--- | :--- |
| `npm run dev` | Run API + Web concurrently. |
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
