# CLAUDE.md

Sport Tracker — mobile-first workout tracking webapp. 6 workout types: cycling, strength, running, swimming, walking, custom. Bilingual FR/EN. Monorepo: Next.js frontend + Express backend + Supabase PostgreSQL.

## Commands

```bash
npm run dev                         # Both frontend (3000) + backend (3001)
npm run dev:backend                 # Express only
npm run dev:frontend                # Next.js only

cd backend && npm run build         # TypeScript → dist/
cd frontend && npm run build        # Next.js production build

cd backend && npx tsc --noEmit      # Backend type check
cd frontend && npx tsc --noEmit     # Frontend type check

cd backend && npm run db:generate   # Generate migration after schema.ts change
cd backend && npm run db:migrate    # Apply pending migrations
cd backend && npm run db:studio     # Web UI to explore DB
```

## Architecture

```
├── backend/     Express.js 5 API (port 3001) — TypeScript, Drizzle ORM + raw SQL via pg
├── frontend/    Next.js 14 App Router (port 3000) — Tailwind CSS, all client components
└── database/    Legacy PostgreSQL init scripts (Supabase is now the DB)
```

**Data flow:** Browser → Next.js (3000) → Express API (3001) → Supabase PostgreSQL. No direct frontend→Supabase.

**Key files:**
- Backend routes: `backend/src/routes/`
- Backend schema: `backend/src/schema.ts` (Drizzle), `backend/src/db.ts` (pg pool)
- Frontend API client: `frontend/src/lib/api.ts` (typed fetch functions)
- Constants: `frontend/src/lib/data.ts` (WorkoutType, WORKOUT_CONFIG, muscle groups, ride types, SPORT_EMOJIS)
- i18n: `frontend/src/lib/i18n.tsx` (custom Context, FR default + EN)
- Auth context: `frontend/src/lib/auth.tsx` (AuthProvider, JWT in localStorage)

## Environment

- Backend: `backend/.env` → `PORT`, `DATABASE_URL`, `JWT_SECRET`, `INVITE_CODE`
- Frontend: `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3001`
- **Never commit `.env` files**

## Gotchas & Key Patterns

- PostgreSQL returns dates as ISO timestamps — `parseDate()` in api.ts converts to `YYYY-MM-DD` local timezone
- Stats values come back as strings from aggregate queries — parse with `parseInt()`/`parseFloat()`
- `useSearchParams()` requires `<Suspense>` boundary — workout pages split into inner form + wrapper
- Workout types: `velo`, `musculation`, `course`, `natation`, `marche`, `custom` — DB CHECK constraint limits allowed values
- Workout creation sends cycling_details, exercise_logs, or workout_details in same POST, handled in single transaction
- workout_details used by: `course`, `natation`, `marche`, `custom` — backend checks `['course', 'natation', 'marche', 'custom'].includes(type)`
- Type config centralized in `WORKOUT_CONFIG` (data.ts) — emoji, color, route per type. Calendar uses lookup helpers, not ternaries.
- Custom emoji/name per workout: stored in `workouts.custom_emoji`/`custom_name`, null = use type default
- PATCH `/api/workouts/:id` updates only emoji/name without touching workout details — used for instant persist from EmojiPicker/NameEditor on existing workouts
- Duration input: smart text field accepting "2h30", "1:45", "90" (minutes) — parseDuration/formatDuration in each form page
- localStorage draft autosave for all workout types (`{type}-draft-${date}` / `{type}-edit-${workoutId}`)
- Save animation + redirect with `?saved=1` triggers medal celebration in WeeklyProgress
- DB values (muscle groups, ride types) stay in French — display translated via `t.muscleGroups[dbValue]`
- env vars (`JWT_SECRET`, `INVITE_CODE`) read at call time, not module load (dotenv import order)
- Medal formula: `GREATEST(count - 2, 0)` — 3 sessions/week = 1 medal, 4 = 2, etc.
- Medal UI: header card = total medals (big icon + number), monthly card = month medals (sum of weeklyMedals) + progress bar + info modal on tap
- Muscle groups: Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets. Split into `UPPER_BODY_GROUPS` / `LOWER_BODY_GROUPS`. No "Jambes" or "Autre".

## Pages

`/login`, `/register`, `/profile`, `/stats`, `/workout/cycling`, `/workout/strength`, `/workout/running`, `/workout/swimming`, `/workout/walking`, `/workout/custom`. Nav hidden on auth pages.

## Stats Page

`StatsPage` component (`frontend/src/components/StatsPage.tsx`) — single scrollable page with Recharts graphs:
- Period selector: month/year toggle + navigation arrows
- Summary cards: total sessions, distance (km), elevation (m), active days
- Medal progression: AreaChart with cumulative medals (always full history, not filtered by period)
- Type distribution: PieChart donut with sport colors + legend
- Distance by sport: stacked BarChart with sport filter chips
- Strength volume: conditional card (tonnage, exercises, sets) — only if musculation data exists
- Recharts dependency in frontend/package.json
