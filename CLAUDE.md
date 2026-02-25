# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sport Tracker — a mobile-first workout tracking webapp (cycling + weight training) for personal use. French UI. Monorepo with separate frontend and backend apps + PostgreSQL database.

## Commands

```bash
# Development (runs both frontend and backend concurrently)
npm run dev

# Individual servers
npm run dev:backend    # Express on http://localhost:3001
npm run dev:frontend   # Next.js on http://localhost:3000

# Build
cd backend && npm run build     # TypeScript → dist/
cd frontend && npm run build    # Next.js production build

# Type check backend
cd backend && npx tsc --noEmit

# Database setup
createdb sport_tracker
psql sport_tracker < database/init.sql

# Database migrations (Drizzle)
cd backend && npm run db:generate   # Generate migration after schema.ts change
cd backend && npm run db:migrate    # Apply pending migrations
cd backend && npm run db:studio     # Web UI to explore DB
```

## Architecture

```
├── backend/     Express.js API (port 3001)
├── frontend/    Next.js 14 App Router (port 3000)
└── database/    PostgreSQL init scripts
```

**Backend:** Express.js 5 + TypeScript. Drizzle ORM for schema + migrations, raw SQL via `pg` pool for existing routes (both exported from `src/db.ts`). Schema defined in `src/schema.ts`. Routes at `src/routes/`. Uses transactions for multi-table writes (workout + cycling_details or exercise_logs).

**Frontend:** Next.js 14 (App Router) + Tailwind CSS + TypeScript. All pages are client components. API client at `src/lib/api.ts` talks to backend REST API. Path alias: `@/*` → `./src/*`.

**Database:** 4 tables — `workouts` (parent), `cycling_details`, `exercises`, `exercise_logs`. Workout type is either `musculation` or `velo`. Foreign keys use ON DELETE CASCADE. Schema changes go through Drizzle migrations: edit `backend/src/schema.ts` → `npm run db:generate` → review SQL → `npm run db:migrate`. Migration files live in `backend/drizzle/`.

## API Endpoints

- `GET/POST /api/workouts`, `GET/PUT/DELETE /api/workouts/:id` — month filter: `?month=YYYY-MM`
- `GET/POST /api/exercises`, `PUT/DELETE /api/exercises/:id`
- `GET /api/exercises/:id/last-performance` — returns sets/reps/weight from most recent session
- `GET /api/stats/monthly?month=YYYY-MM` — aggregated monthly stats

## Environment

- Backend: `backend/.env` → `PORT=3001`, `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sport_tracker`
- Frontend: `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3001`

## Key Patterns

- `useSearchParams()` requires a `<Suspense>` boundary in Next.js 14 — workout pages split into inner form + wrapper component
- Workout creation sends related data (cycling_details or exercise_logs) in the same POST body, handled in a single transaction
- Stats values come back as strings from PostgreSQL aggregate queries
