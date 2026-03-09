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
- Server libs: `frontend/src/lib/db-server.ts` (pg pool), `frontend/src/lib/schema.ts` (Drizzle), `frontend/src/lib/auth-api.ts` (JWT helper + `getJwtSecret()`)
- Validation: `frontend/src/lib/validations.ts` (Zod schemas for all API inputs)
- Frontend API client: `frontend/src/lib/api.ts` (typed fetch functions, same-origin calls)
- Constants: `frontend/src/lib/data.ts` (WorkoutType, WORKOUT_CONFIG, muscle groups, ride types, SPORT_EMOJIS)
- i18n: `frontend/src/lib/i18n.tsx` (custom Context, FR default + EN)
- Auth context: `frontend/src/lib/auth.tsx` (AuthProvider, JWT in localStorage)
- Rate limiter: `frontend/src/lib/rate-limit.ts` (in-memory, for login/register)
- Seed exercises: `frontend/src/lib/seed-exercises.ts` (default exercises on registration)
- Middleware: `frontend/src/middleware.ts` (route protection — blocks API calls without Bearer token, except auth + health)
- Error boundary: `frontend/src/components/ErrorBoundary.tsx` (wraps app inside I18nProvider, bilingual fallback UI)

## Environment

- `frontend/.env.local` → `DATABASE_URL`, `JWT_SECRET`, `INVITE_CODE`
- Production adds: `NEXT_PUBLIC_API_URL=/jupiter`, `NEXT_PUBLIC_BASE_PATH=/jupiter`
- Production systemd service also sets env vars (standalone mode doesn't read `.env.local`)
- **Never commit `.env` files**

## Deployment (VPS)

**URL:** https://disqt.com/jupiter/ — **VPS:** `ssh -p 24420 jupiter@disqt.com`

**Architecture:**
```
nginx → /jupiter/metrics/  → Grafana :3102
nginx → /jupiter/api/*     → Next.js :3100 (API Route Handlers)
nginx → /jupiter/*         → Next.js :3100 (basePath: /jupiter, standalone mode)
```

**Services (systemd):**
- `jupiter-frontend` — Next.js standalone on port 3100 (serves both UI + API)
- `jupiter-grafana` — Grafana on port 3102

**Key files on VPS:**
- App code: `~/app/`
- Services: `~/services/jupiter-frontend.service` (includes DATABASE_URL, JWT_SECRET, INVITE_CODE env vars)
- Nginx: config in `/etc/nginx/sites-enabled/disqt.com` (Jupiter section)
- Grafana: `~/grafana/` (config, data, provisioning)
- Frontend env: `~/app/frontend/.env.local`

**Deploy flow:**
```bash
# Local: commit, push, PR, merge
# VPS:
cd ~/app && git pull
cd frontend && npm install && npm run build && cp -r .next/static .next/standalone/.next/static && sudo systemctl restart jupiter-frontend
```

**Monitoring:** Grafana at https://disqt.com/metrics/ — dashboard "Jupiter Sport Tracker" (PostgreSQL datasource `cfemdlx9lrim8f`)

**Port range:** 3100-3199 reserved for Jupiter. All services prefixed `jupiter-`.

## Gotchas & Key Patterns

- PostgreSQL returns dates as ISO timestamps — `parseDate()` in api.ts converts to `YYYY-MM-DD` local timezone
- Stats values come back as strings from aggregate queries — parse with `parseInt()`/`parseFloat()`
- `useSearchParams()` requires `<Suspense>` boundary — workout pages split into inner form + wrapper
- Workout types: `velo`, `musculation`, `course`, `natation`, `marche`, `custom` — DB CHECK constraint limits allowed values
- Workout creation sends cycling_details, exercise_logs, or workout_details in same POST, handled in single transaction
- workout_details used by: `course`, `natation`, `marche`, `custom` — API route checks `['course', 'natation', 'marche', 'custom'].includes(type)`
- Type config centralized in `WORKOUT_CONFIG` (data.ts) — emoji, color, route per type. Calendar uses lookup helpers, not ternaries.
- Custom emoji/name per workout: stored in `workouts.custom_emoji`/`custom_name`, null = use type default
- PATCH `/api/workouts/:id` updates only emoji/name without touching workout details — used for instant persist from EmojiPicker/NameEditor on existing workouts
- Duration input: smart text field accepting "2h30", "1:45", "90" (minutes) — parseDuration/formatDuration in each form page
- localStorage draft autosave for all workout types (`{type}-draft-${date}` / `{type}-edit-${workoutId}`)
- Save animation + redirect with `/calendar?saved=1` triggers medal celebration in WeeklyProgress. `replaceState` uses `pathname` (not hardcoded `/`) to strip query param without changing route.
- DB values (muscle groups, ride types) stay in French — display translated via `t.muscleGroups[dbValue]`
- env vars (`JWT_SECRET`, `INVITE_CODE`) read at call time in API route handlers — `getJwtSecret()` throws if undefined (never fallback to empty string)
- All POST/PUT API routes validate input with Zod schemas (`frontend/src/lib/validations.ts`) — returns 400 with field errors on invalid input
- Middleware (`frontend/src/middleware.ts`) blocks unauthenticated API calls at the edge (except `/api/auth/*` and `/api/health`)
- Security headers in `next.config.mjs`: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- ErrorBoundary wraps app inside I18nProvider (order: I18nProvider → ErrorBoundary → AuthProvider → App) so error UI is bilingual
- DB indexes: `workouts(user_id, date)`, `workouts(user_id, type)`, `cycling_details(workout_id)`, `workout_details(workout_id)`, `exercise_logs(workout_id)`, `exercise_logs(exercise_id)`, `exercises(user_id, muscle_group)` — migration in `database/migrations/001_add_indexes.sql`
- Numeric inputs use `type="text"` + `inputMode="decimal"/"numeric"` (NOT `type="number"`) — prevents silent value coercion. onChange filters non-numeric chars via regex (`/^[0-9]*\.?[0-9]*$/` for decimals, `/^[0-9]*$/` for integers). Validation also at save time + Zod on server.
- Medal formula: `GREATEST(count - 2, 0)` — 3 sessions/week = 1 medal, 4 = 2, etc.
- Medal UI: header card = total medals (big icon + number), monthly card = month medals (sum of weeklyMedals) + progress bar + info modal on tap
- Muscle groups: Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets. Split into `UPPER_BODY_GROUPS` / `LOWER_BODY_GROUPS`. No "Jambes" or "Autre".
- Default exercises seeded per user on registration (`frontend/src/lib/seed-exercises.ts`) — 58 exercises across 10 muscle groups
- Exercises sorted by `muscle_group, id` (oldest/seeded first, user-created last)
- Strength sets: only reps required, weight defaults to 0 if empty. Weight auto-fills empty sets below on blur (not on keystroke) + new sets copy previous weight.
- `window.location.href` redirects use `BASE_PATH` env var (for subpath deployment)
- BottomNav active state: exact match for `/` (home), `startsWith` for other routes — prevents home from highlighting on `/calendar`. Home tab uses gold `#c9a96e` when active (matches homepage accent), other tabs use default `text-accent`.
- Strength exercises: collapsible cards with chevron toggle. Collapsed by default in view mode (shows summary like "4×10 @ 80kg"), expanded in edit mode. Delete button on left with confirmation popup.
- Bottom sheets use `BottomSheet` component (`frontend/src/components/BottomSheet.tsx`) — handles backdrop, notch, animation, and swipe-to-close gesture. Props: `open`, `onClose`, `desktopSidebarOffset` (for sidebar offset), `fullScreenMobile` (exercise picker), `className`. Scrollable children need `data-bottom-sheet-scroll` attribute to prevent swipe from fighting scroll.
- All bottom-sheet modals follow same pattern: notch at top (swipe down to close) + "Annuler" button at bottom. No ✕ close buttons.
- Homepage modals use `lg:left-[200px]` to offset for desktop sidebar — pass `desktopSidebarOffset` to `BottomSheet`
- Homepage i18n keys prefixed `home*` to avoid conflicts with stats page keys (e.g. `homeMedalsLabel`, `homeDistance`, `homeVolume`)
- Desktop layout: `page-container` (896px) / `page-container-wide` (1152px) utility classes in `globals.css` — use on page wrapper divs for consistent width, centering, and padding on `lg:`. Calendar uses `page-container-wide`, all other pages use `page-container`.

## Pages

`/` (home), `/calendar`, `/login`, `/register`, `/profile`, `/stats`, `/workout/cycling`, `/workout/strength`, `/workout/running`, `/workout/swimming`, `/workout/walking`, `/workout/custom`. Nav hidden on auth pages.

## Home Page

`HomePage` component (`frontend/src/components/HomePage.tsx`) — dashboard landing page:
- Greeting with user name + time-of-day (matin/après-midi/soir), gold accent color (`#c9a96e` / `#e2c992`)
- Today's workouts card with sport chips + "Commencer une séance" button (always visible, opens workout type picker modal)
- Weekly tracker: 7 animated bars (Mon-Sun) with colored dots per workout type
- Medals card (clickable → medal info modal): total + monthly count with gold styling
- Key insights grid (2x2): sessions, distance, active time, strength volume — with trend vs previous week
- Streak card: consecutive days + best streak
- API route: `GET /api/home` (`frontend/src/app/api/home/route.ts`) — returns today, week, medals, insights, streak in one call. Today's `exercise_count` uses `COUNT(DISTINCT exercise_id)` (not total sets).

## Calendar Page

Moved from `/` to `/calendar`. All workout form redirects (`router.push`, `?saved=1`) point to `/calendar`.

## Stats Page

`StatsPage` component (`frontend/src/components/StatsPage.tsx`) — single scrollable page with Recharts graphs:
- Period selector: month/year toggle + navigation arrows
- Summary cards: total sessions, distance (km), elevation (m), active days
- Medal progression: AreaChart with cumulative medals (always full history, not filtered by period)
- Type distribution: PieChart donut with sport colors + legend
- Distance by sport: stacked BarChart with sport filter chips
- Strength volume: conditional card (tonnage, exercises, sets) — only if musculation data exists
- Recharts dependency in frontend/package.json
