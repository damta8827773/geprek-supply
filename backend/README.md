# Geprek-Supply · Backend API

Node.js + Express + TypeScript REST API, persisted with Prisma (SQLite by
default).

```
src/
├── routes/        Express routers (region, supplier, health)
├── controllers/   thin request/response handlers
├── services/      business logic — smart routing & stock
├── middleware/    auth gate, Zod validation, error handling
├── schemas/       Zod request schemas
├── utils/         Haversine geo math, ApiError, asyncHandler
├── lib/           Prisma client & Pino logger singletons
├── app.ts         Express app factory (helmet, cors, rate-limit)
└── index.ts       bootstrap & graceful shutdown
```

## Scripts

| Script | Action |
| :--- | :--- |
| `npm run dev` | Hot-reloading dev server (tsx). |
| `npm run build` | `prisma generate` + `tsc`. |
| `npm start` | Run the compiled server. |
| `npm run db:migrate` | `prisma migrate dev`. |
| `npm run db:seed` | Seed the database. |
| `npm run db:reset` | Reset + re-seed. |
| `npm run db:studio` | Open Prisma Studio. |

## Switching database

The schema is portable. To use MySQL/PostgreSQL in production, change the
`provider` in `prisma/schema.prisma` and point `DATABASE_URL` at your instance,
then re-run `npm run db:migrate`.
