# CLAUDE.md

Jupiter Tracker — mobile-first multi-sport tracking webapp. 6 workout types: cycling, strength, running, swimming, walking, custom. Bilingual FR/EN. Single Next.js app with API Route Handlers + Supabase PostgreSQL. PWA-installable on Android & iOS.

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

- `frontend/.env.local` → `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_EXERCISE_IMAGE_URL=/jupiter/exercises`
- Production adds: `NEXT_PUBLIC_API_URL=/jupiter`, `NEXT_PUBLIC_BASE_PATH=/jupiter`, `NEXT_PUBLIC_EXERCISE_IMAGE_URL=/jupiter/exercises`
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

`/` (home), `/calendar`, `/profile`, `/stats`, `/workout/cycling`, `/workout/strength`, `/workout/running`, `/workout/swimming`, `/workout/walking`, `/workout/custom`, `/workout/templates`. Account creation via bottom sheet on profile page. Nav always visible.

## Gotchas & Key Patterns

- PostgreSQL returns dates as ISO timestamps — `parseDate()` in api.ts converts to `YYYY-MM-DD` local timezone
- Stats values come back as strings from aggregate queries — parse with `parseInt()`/`parseFloat()`
- `useSearchParams()` requires `<Suspense>` boundary — workout pages split into inner form + wrapper
- Workout types: `velo`, `musculation`, `course`, `natation`, `marche`, `custom` — DB CHECK constraint
- workout_details used by: `course`, `natation`, `marche`, `custom`
- DB values (muscle groups, ride types) stay in French — display translated via `t.muscleGroups[dbValue]`
- Numeric inputs: `type="text"` + `inputMode="decimal"/"numeric"` (NOT `type="number"`). Distance fields accept comma (converted to dot), limited to 2 decimal places. Integer fields use `/^[0-9]*$/`.
- Default exercises split: `default-exercises.ts` (pure data) vs `seed-exercises.ts` (imports db-server). Client components must import from `default-exercises.ts` — `seed-exercises.ts` client-side fails (pg module can't be bundled).
- Exercise catalog: Migrated from Free Exercise DB to **ExerciseDB API** (RapidAPI). `exercisedb-catalog.json` (1258 exercises, all data in one file). `exercise-catalog-index.ts` defines `CatalogExercise` interface (id, name_en, name_fr, muscle_group, equipment, level, target, secondaryMuscles, instructions, description). `exercise-catalog.ts` has lookup helpers + `getExerciseImageUrl()` returning GIF proxy URL. `catalog_id` on `exercises` table links user exercises to ExerciseDB IDs (e.g. "0025"). Env: `RAPIDAPI_KEY` in `.env.local`.
- Exercise GIF proxy: `/api/exercise-image?id={exerciseId}&res=360` — server-side proxy to ExerciseDB image API (hides API key). 7-day browser cache. GIFs are 360x360 animated.
- Exercise picker (strength page): two sections — "Mes exercices" (user's) on top, then "Catalogue" below, separated by a centered divider. Both sorted alphabetically within muscle groups. Equipment filter pills are cumulative (multi-select) and persist across picker open/close. Advanced filter modal (muscles, level) opens on top via filter icon button. "+ nouveau" button in header to create custom exercises.
- Exercise cleanup: unused exercises (no workout history, no template references) are automatically deleted after each workout save (POST/PUT). On remove from session, catalog exercises with no history/templates are also cleaned up immediately. Exercises with catalog info show an orange ℹ icon in the picker — tapping it opens the info modal directly (without adding the exercise).
- Workout generator: `workout-generator.ts` (pure algorithm, no React). Takes muscles/level/equipment → returns exercises with sets/reps. Rules: 3-8 exercises, compound-first ordering, push/pull balance, secondary muscle volume tracking at 50%, level-based filtering. `swapExercise()` for replacing one exercise. `BodyMuscleSelector.tsx` = SVG body front/back with tappable muscle zones + split tags (Full body/Haut/Bas/Push/Pull). `WorkoutGeneratorModal.tsx` = 4-step onboarding (muscles → level → equipment → summary). Empty state on strength page shows 3 CTAs: generate (gold), templates (outline), from scratch. Generator also in ⋮ menu with overwrite confirmation. Swap button per exercise on generated sessions. Prefs persisted in `generator-prefs` localStorage.
- `window.location.href` redirects use `BASE_PATH` env var (for subpath deployment)
- ErrorBoundary wraps app inside I18nProvider (order: I18nProvider → ErrorBoundary → AuthProvider → App)
- Security headers in `next.config.mjs`: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Homepage i18n keys prefixed `home*` to avoid conflicts with stats page keys
- Medal formula: `GREATEST(count - 2, 0)` — 3 sessions/week = 1 medal
- Athlete level: `computeLevel(totalMedals)` in `data.ts` — threshold = `N*(9+N)/2`. Label: "Débutant"/"Niveau X" (FR), "Beginner"/"Level X" (EN)
- Muscle groups: Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets. No "Jambes" or "Autre".
- Guest mode: `isGuest` from AuthContext. API 401 guard redirects to `/` — components MUST check `isGuest` before calling API functions.
- localStorage draft autosave: `{type}-draft-${date}` / `{type}-edit-${workoutId}`. Drafts appear on Calendar + HomePage with dashed border + 50% opacity.
- Templates: `workout_templates` + `workout_template_exercises` tables. API at `/api/templates`. Guest templates in `guest-templates` localStorage key. `TemplateButton` component is reusable (accepts `workoutType` prop). Apply flow uses `sessionStorage` `apply-template` key for cross-page data handoff. Max 50 templates per user. Access via ⋮ header menu (strength page) or full-width CTA when session is empty. Create from scratch: `?templateMode=1` on strength page changes save button to "Save as template" with name modal. Apply confirmation uses gentle orange styling (not destructive red).
- Strength page header menu (⋮): contains "Templates" and "Delete draft/workout". Uses `headerRight` prop on `WorkoutFormHeader`. Only visible in edit/create mode.
- Save redirect: `/calendar?saved=1` triggers medal celebration. `replaceState` uses `pathname` to strip query param.
- PWA: `manifest.json` + minimal service worker (`sw.js`) in `public/`. Icons generated from favicon SVG (192, 512, apple-touch-icon). `InstallPrompt` component handles Android (`beforeinstallprompt` event) and iOS Safari (manual instructions). Dismissal stored in localStorage for 7 days. Service worker registered in the component.
- Brand colors: accent is gold `#c9a96e` (matching logo). Gradient pairs: `#c9a96e` → `#a0833a` (dark gold) or `#c9a96e` → `#e2c992` (light gold). Custom workout type stays violet `#a78bfa`.
- Page titles: all pages (home, calendar, stats, profile) use `text-[32px] lg:text-[38px] font-serif` for consistency.
- Logo: favicon SVG has intentional `#333` background. Horizontal dark logo in desktop sidebar via `<img>` tag.
