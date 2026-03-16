# CLAUDE.md

Sport Tracker — mobile-first workout tracking webapp. 6 workout types: cycling, strength, running, swimming, walking, custom. Bilingual FR/EN. Single Next.js app with API Route Handlers + Supabase PostgreSQL.

## Commands

```bash
npm run dev                         # Next.js dev server (port 3000)
npm run build                       # Next.js production build
cd frontend && npx tsc --noEmit     # Type check
```

## Architecture

```
├── frontend/    Next.js 14 App Router — Tailwind CSS, API Route Handlers, all client components
├── backend/     Legacy Express backend (kept as reference, no longer used)
└── database/    Legacy PostgreSQL init scripts (Supabase is now the DB)
```

**Data flow:** Browser → Next.js API Routes (`/api/...`) → Supabase PostgreSQL. Single process.

**Key files:**
- API routes: `frontend/src/app/api/` (auth, workouts, exercises, stats, home, health)
- Server libs: `frontend/src/lib/db-server.ts` (pg pool), `frontend/src/lib/schema.ts` (Drizzle), `frontend/src/lib/auth-api.ts` (JWT helper)
- Validation: `frontend/src/lib/validations.ts` (Zod schemas for all API inputs)
- Frontend API client: `frontend/src/lib/api.ts` (typed fetch functions, same-origin calls)
- Constants: `frontend/src/lib/data.ts` (WorkoutType, WORKOUT_CONFIG, muscle groups, ride types, SPORT_EMOJIS)
- i18n: `frontend/src/lib/i18n.tsx` (custom Context, FR default + EN)
- Auth: `frontend/src/lib/auth.tsx` (AuthProvider, JWT in localStorage, `isGuest` flag for guest mode)
- Guest storage: `frontend/src/lib/guest-storage.ts` (guest workout CRUD + medal computation in localStorage)
- Workout form shared: `frontend/src/lib/useWorkoutForm.ts` (hook), `frontend/src/components/WorkoutFormShell.tsx` (UI shell)
- Default exercises: `frontend/src/lib/default-exercises.ts` (pure data, client-safe) vs `seed-exercises.ts` (server-only, imports db-server)

## Environment

- `frontend/.env.local` → `DATABASE_URL`, `JWT_SECRET`
- Production adds: `NEXT_PUBLIC_API_URL=/jupiter`, `NEXT_PUBLIC_BASE_PATH=/jupiter`
- Production systemd service also sets env vars (standalone mode doesn't read `.env.local`)
- **Never commit `.env` files**

## Deployment (VPS)

**URL:** https://disqt.com/jupiter/ — **VPS:** `ssh -p 24420 jupiter@disqt.com`

```
nginx → /jupiter/metrics/  → Grafana :3102
nginx → /jupiter/api/*     → Next.js :3100 (API Route Handlers)
nginx → /jupiter/*         → Next.js :3100 (basePath: /jupiter, standalone mode)
```

**Deploy flow:**
```bash
# Local: commit, push, PR, merge
# VPS:
cd ~/app && git pull
cd frontend && npm install && npm run build && cp -r .next/static .next/standalone/.next/static && sudo systemctl restart jupiter-frontend
```

**Port range:** 3100-3199. Grafana at https://disqt.com/metrics/

## Pages

`/` (home), `/calendar`, `/profile`, `/stats`, `/workout/cycling`, `/workout/strength`, `/workout/running`, `/workout/swimming`, `/workout/walking`, `/workout/custom`. Account creation via bottom sheet on profile page. Nav always visible.

## Gotchas & Key Patterns

- PostgreSQL returns dates as ISO timestamps — `parseDate()` in api.ts converts to `YYYY-MM-DD` local timezone
- Stats values come back as strings from aggregate queries — parse with `parseInt()`/`parseFloat()`
- `useSearchParams()` requires `<Suspense>` boundary — workout pages split into inner form + wrapper
- Workout types: `velo`, `musculation`, `course`, `natation`, `marche`, `custom` — DB CHECK constraint
- workout_details used by: `course`, `natation`, `marche`, `custom`
- DB values (muscle groups, ride types) stay in French — display translated via `t.muscleGroups[dbValue]`
- Numeric inputs: `type="text"` + `inputMode="decimal"/"numeric"` (NOT `type="number"`). Distance fields accept comma (converted to dot), limited to 2 decimal places. Integer fields use `/^[0-9]*$/`.
- Default exercises split: `default-exercises.ts` (pure data) vs `seed-exercises.ts` (imports db-server). Client components must import from `default-exercises.ts` — `seed-exercises.ts` client-side fails (pg module can't be bundled).
- `window.location.href` redirects use `BASE_PATH` env var (for subpath deployment)
- ErrorBoundary wraps app inside I18nProvider (order: I18nProvider → ErrorBoundary → AuthProvider → App)
- Security headers in `next.config.mjs`: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Homepage i18n keys prefixed `home*` to avoid conflicts with stats page keys
- Medal formula: `GREATEST(count - 2, 0)` — 3 sessions/week = 1 medal
- Athlete level: `computeLevel(totalMedals)` in `data.ts` — threshold = `N*(9+N)/2`. Label: "Débutant"/"Niveau X" (FR), "Beginner"/"Level X" (EN)
- Muscle groups: Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets. No "Jambes" or "Autre".
- Guest mode: `isGuest` from AuthContext. API 401 guard redirects to `/` — components MUST check `isGuest` before calling API functions.
- localStorage draft autosave: `{type}-draft-${date}` / `{type}-edit-${workoutId}`. Drafts appear on Calendar + HomePage with dashed border + 50% opacity.
- Save redirect: `/calendar?saved=1` triggers medal celebration. `replaceState` uses `pathname` to strip query param.
