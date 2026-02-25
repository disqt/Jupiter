# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sport Tracker — a mobile-first workout tracking webapp (cycling + weight training) for personal use. French UI. Monorepo with separate frontend and backend apps + PostgreSQL database hosted on Supabase.

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

# Type check
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Database migrations (Drizzle)
cd backend && npm run db:generate   # Generate migration after schema.ts change
cd backend && npm run db:migrate    # Apply pending migrations
cd backend && npm run db:studio     # Web UI to explore DB
```

## Architecture

```
├── backend/     Express.js API (port 3001)
├── frontend/    Next.js 14 App Router (port 3000)
└── database/    PostgreSQL init scripts (legacy, Supabase is now the DB)
```

**Backend:** Express.js 5 + TypeScript. Drizzle ORM for schema + migrations (`src/schema.ts`), raw SQL via `pg` pool for routes (`src/db.ts`). Routes at `src/routes/`. Uses transactions for multi-table writes (workout + cycling_details or exercise_logs). Connected to Supabase via session pooler.

**Frontend:** Next.js 14 (App Router) + Tailwind CSS + TypeScript. All pages are client components. API client at `src/lib/api.ts` talks to backend REST API. Constants (muscle groups, ride types) in `src/lib/data.ts`. Path alias: `@/*` → `./src/*`.

**Data flow:** Browser → Next.js frontend (port 3000) → Express API (port 3001) → Supabase PostgreSQL. No direct frontend → Supabase connection.

## API Endpoints

- `GET/POST /api/workouts`, `GET/PUT/DELETE /api/workouts/:id` — month filter: `?month=YYYY-MM`. GET list includes `exercise_count` via subquery.
- `GET/POST /api/exercises`, `PUT/DELETE /api/exercises/:id`
- `GET /api/exercises/:id/last-performance` — returns sets/reps/weight from most recent session
- `GET /api/stats/monthly?month=YYYY-MM` — aggregated monthly stats (cycling_count, strength_count, total_distance_km, total_elevation_m, active_days)
- `GET /api/stats/weekly-progress` — returns `week_count` (current week) and `total_medals` (all-time, computed via SQL)

## Frontend API Client (`src/lib/api.ts`)

All backend communication goes through typed functions:
- `fetchWorkouts(month)`, `fetchWorkout(id)`, `createWorkout(data)`, `deleteWorkout(id)`
- `fetchExercises()`, `createExercise(name, muscleGroup)`, `fetchLastPerformance(exerciseId)`
- `fetchMonthlyStats(month)`, `fetchWeeklyProgress()`

**Date handling:** PostgreSQL returns dates as ISO timestamps (`2026-02-24T23:00:00.000Z`). The `parseDate()` helper in api.ts converts them to `YYYY-MM-DD` using local timezone.

**Stats values** come back as strings from PostgreSQL — parse with `parseInt()`/`parseFloat()` in the frontend.

## Database (Supabase)

Dev database hosted on Supabase (EU West — Ireland). MCP server `mcp__supabase` configured for direct access.

**Tables (schema `public`):**
- `workouts` — id, date, type (`musculation`|`velo`), notes, created_at
- `cycling_details` — id, workout_id (FK CASCADE), duration, distance, elevation, ride_type
- `exercises` — id, name, muscle_group (18 seeded exercises with French accents)
- `exercise_logs` — id, workout_id (FK CASCADE), exercise_id (FK CASCADE), set_number, reps, weight

**Muscle groups:** Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets. Frontend splits into `UPPER_BODY_GROUPS` and `LOWER_BODY_GROUPS` in `data.ts`. No "Jambes" or "Autre" — removed.

**Supabase MCP tools:**
- `mcp__supabase__list_tables` — voir les tables
- `mcp__supabase__execute_sql` — requêtes SQL (SELECT, INSERT, UPDATE, DELETE)
- `mcp__supabase__apply_migration` — DDL (CREATE TABLE, ALTER TABLE, etc.)
- `mcp__supabase__get_advisors` — vérifier sécurité/performance

**RLS:** Désactivé (pas nécessaire — le frontend passe par l'API Express, pas d'accès direct navigateur → Supabase).

**Connection:** Backend uses session pooler URL (`aws-1-eu-west-1.pooler.supabase.com:5432`). Direct connection (`db.xxx.supabase.co`) doesn't resolve (IPv6 issue).

**Schema changes workflow:** Modifier `backend/src/schema.ts` → `npm run db:generate` → review SQL → appliquer via `mcp__supabase__apply_migration` (Supabase) ou `npm run db:migrate` (local).

## Environment

- Backend: `backend/.env` → `PORT=3001`, `DATABASE_URL` (Supabase session pooler connection string)
- Frontend: `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3001`
- **Never commit `.env` files** — they contain the database password

## Key Patterns

- `useSearchParams()` requires a `<Suspense>` boundary in Next.js 14 — workout pages split into inner form + wrapper component
- Workout creation sends related data (cycling_details or exercise_logs) in the same POST body, handled in a single transaction
- Stats values come back as strings from PostgreSQL aggregate queries
- Gamification (medals/weekly progress) computed server-side in SQL (`/api/stats/weekly-progress`), displayed in `WeeklyProgress` component
- Exercise picker modal: search bar + upper/lower body filter buttons, filter state persists during the workout session
- localStorage draft autosave for strength workouts (`strength-draft-${date}`)
- Save animation (`SaveAnimation.tsx`) + redirect with `?saved=1` triggers medal celebration in `WeeklyProgress`
