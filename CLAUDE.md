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
cd frontend && npm install && npm run build && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public && sudo systemctl restart jupiter-frontend
```

**Port range:** 3100-3199. Grafana at https://disqt.com/metrics/

## Pages

`/` (home), `/calendar`, `/profile`, `/stats`, `/workout/cycling`, `/workout/strength`, `/workout/running`, `/workout/swimming`, `/workout/walking`, `/workout/custom`, `/workout/templates`, `/workout/{sport}/library`, `/workout/{sport}/library/[sessionType]`. Account creation via bottom sheet on profile page. Nav always visible.

## Gotchas & Key Patterns

- PostgreSQL returns dates as ISO timestamps — `parseDate()` in api.ts converts to `YYYY-MM-DD` local timezone
- Stats values come back as strings from aggregate queries — parse with `parseInt()`/`parseFloat()`
- `useSearchParams()` requires `<Suspense>` boundary — workout pages split into inner form + wrapper
- Workout types: `velo`, `musculation`, `course`, `natation`, `marche`, `custom` — DB CHECK constraint
- workout_details used by: `course`, `natation`, `marche`, `custom`
- DB values (muscle groups, ride types) stay in French — display translated via `t.muscleGroups[dbValue]`
- Numeric inputs: `type="text"` + `inputMode="decimal"/"numeric"` (NOT `type="number"`). Distance fields accept comma (converted to dot), limited to 2 decimal places. Integer fields use `/^[0-9]*$/`.
- Default exercises split: `default-exercises.ts` (pure data) vs `seed-exercises.ts` (imports db-server). Client components must import from `default-exercises.ts` — `seed-exercises.ts` client-side fails (pg module can't be bundled).
- Exercise catalog: **ExerciseDB API** (RapidAPI) — `exercisedb-catalog.json` (~386 hand-triaged exercises from 1324 total). `exercise-catalog-index.ts` defines `CatalogExercise` interface (id, name_en, name_fr, muscle_group, equipment, level, target, secondaryMuscles, instructions, description, deltPortion?). Shoulder exercises have `deltPortion`: `front`, `side`, `rear`, or `compound`. `exercise-catalog.ts` has lookup helpers + `getExerciseImageUrl()` returning GIF proxy URL. `catalog_id` on `exercises` table links user exercises to ExerciseDB IDs (e.g. "0025"). Env: `RAPIDAPI_KEY` in `.env.local`. Fetch script: `scripts/fetch-exercisedb.ts`. Triage tool: `docs/exercise-triage.html` + `docs/exercisedb-full.json` (full 1324 DB dump) + `docs/exercise-triage-results.json` (kept/removed IDs).
- Exercise GIF proxy: `/api/exercise-image?id={exerciseId}&res=360` — server-side proxy to ExerciseDB image API (hides API key, public route in middleware). 7-day browser cache. GIFs are 360x360 animated.
- Muscle groups: 11 groups — Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets, Avant-bras. Avant-bras not in any preset split (only manual selection).
- Exercise picker (strength page): two sections — "Mes exercices" (user's) on top, then "Catalogue" below, separated by a centered divider. Both sorted alphabetically within muscle groups. Equipment filter pills are cumulative (multi-select) and persist across picker open/close. Advanced filter modal (muscles, level) opens on top via filter icon button. "+ nouveau" button in header to create custom exercises.
- Exercise cleanup: unused exercises (no workout history, no template references) are automatically deleted after each workout save (POST/PUT). On remove from session, catalog exercises with no history/templates are also cleaned up immediately. Exercises with catalog info show an orange ℹ icon in the picker — tapping it opens the info modal directly (without adding the exercise).
- Workout generator: `workout-generator.ts` (pure algorithm, no React). Takes muscles/equipment/weeklyFrequency → returns exercises with sets/reps. No level parameter — frequency + muscle count drive all volume decisions via `getSessionConfig()`. Rules: 3-7 exercises (varies by frequency × muscle count), compound-first ordering, push/pull balance (inferred from target), movement family dedup (max 1 bench press variant), secondary muscle volume tracking at 50%, equipment priority (barbell/dumbbell favored), classic exercises scored highest (beginner-level exercises get top score regardless of user). Shoulder exercises filtered to `side` + `compound` deltPortion only (no front/rear raises in auto-generation). `swapExercise()` for replacing one exercise. Exercise picker in replace mode pre-applies muscle group + equipment filters. `BodyMuscleSelector.tsx` = custom Illustrator SVG body front/back with tappable muscle zones + split tags (Full body/Haut/Bas/Push/Pull). `WorkoutGeneratorModal.tsx` = 4-step onboarding (muscles → frequency → equipment → summary) with progress bar, orange strength theme. Empty state on strength page shows 3 CTAs: generate (orange), templates (outline), from scratch (dashed, + icon is clickable). Generator also in ⋮ menu with overwrite confirmation. Swap button per exercise with confirmation popup. Coach tip card after generation. Prefs persisted in `generator-prefs` localStorage.
- Stats muscle volume chart: `MuscleVolumeChart.tsx` — Recharts bar chart showing sets or reps per muscle group. Toggle (Séries/Reps) with orange muscu `#ff8a3b` active state. API: `/api/stats/muscle-volume?month=YYYY-MM` or `?year=YYYY` — joins exercise_logs → workouts → exercises, groups by muscle_group. Fixed canonical bar order (upper → lower → extremities). i18n: `muscleGroupsShort` maps DB names to abbreviated labels (FR: Pecs/Abdos/Quads/Av-bras, EN: Chest/Abs/Quads/Forearms). Only visible when muscu sessions exist in period. Positioned above strength volume cards on stats page.
- `window.location.href` redirects use `BASE_PATH` env var (for subpath deployment)
- ErrorBoundary wraps app inside I18nProvider (order: I18nProvider → ErrorBoundary → AuthProvider → App)
- Security headers in `next.config.mjs`: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Homepage i18n keys prefixed `home*` to avoid conflicts with stats page keys
- Medal formula: `GREATEST(count - (target - 1), 0)` — dynamic per-user target (default 3). Table `user_goals(id, user_id, target, effective_from)` stores goal history as append-only event log. `effective_from` = Monday of ISO week when goal was set. Prospective: past weeks keep their original threshold. No row = default target 3. API: `GET/PUT /api/user-goal`. Medal SQL queries use temporal JOIN (`WHERE effective_from <= week_start ORDER BY effective_from DESC LIMIT 1`). Guest mode: fixed target 3, no change. `GoalModal.tsx` on profile page: 3 preset cards (Occasionnel 2x, Régulier 3x, Sportif 5x) + custom stepper 1-7. Guest variant shows grayed cards + upsell. `weekly-progress` API returns `current_target` for client-side use (Calendar, recap, save flows).
- Athlete level: `computeLevel(totalMedals)` in `data.ts` — threshold = `N*(9+N)/2`. Label: "Débutant"/"Niveau X" (FR), "Beginner"/"Level X" (EN)
- Muscle groups: Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets. No "Jambes" or "Autre".
- Guest mode: `isGuest` from AuthContext. API 401 guard redirects to `/` — components MUST check `isGuest` before calling API functions.
- localStorage draft autosave: `{type}-draft-${date}` / `{type}-edit-${workoutId}`. Drafts appear on Calendar + HomePage with dashed border + 50% opacity.
- Templates: `workout_templates` + `workout_template_exercises` tables. API at `/api/templates`. Guest templates in `guest-templates` localStorage key. `TemplateButton` component is reusable (accepts `workoutType` prop). Apply flow uses `sessionStorage` `apply-template` key for cross-page data handoff. Max 50 templates per user. Access via ⋮ header menu (strength page) or full-width CTA when session is empty. Create from scratch: `?templateMode=1` on strength page changes save button to "Save as template" with name modal. Apply confirmation uses gentle orange styling (not destructive red).
- Strength page header menu (⋮): contains "Templates" and "Delete draft/workout". Uses `headerRight` prop on `WorkoutFormHeader`. Only visible in edit/create mode.
- Workout recap screen: `WorkoutRecap.tsx` — full-screen gamified overlay shown after saving any workout (replaced old `SaveAnimation`). Sequential auto-reveal blocks (~1.5s each) with tap-to-skip. Shows: session stats, sport-specific details (chips), personal records (PR cards with pulse), weekly streak, medals earned, level progression (animated bar). Dark minimal style (#0a0a0a bg, gold accents, serif numbers). Auto-scrolls to each new block via refs + `scrollIntoView`. Back button intercepted during reveal. Guest mode shows only stats blocks (no PRs/streak/medals). i18n keys prefixed `recap*`.
- Personal records: `pr-computation.ts` — server-side helper called inside DB transaction during workout POST/PUT. Computes PRs for: distance/duration (cardio), weight (muscu per exercise). Returns `{ type, value, previous }` array. `previous: null` for first-time records.
- Workout save flow: save → compute PRs in transaction → fetch weekly-progress → `buildRecapData()` → show `WorkoutRecap`. Both `useWorkoutForm` (cardio/custom) and strength page (independent save flow) wire this. Navigate to `/calendar` on recap dismiss (no more `?saved=1`).
- `workout-recap-data.ts`: `REVEAL_TIMING` config, `RecapData` interface, `buildRecapData()` builder, `getVisibleBlocks()` helper.
- BottomSheet keyboard fix: `visualViewport` resize listener. Non-fullscreen sheets: `translateY` shifts sheet upward when keyboard opens, `focusout` resets. Fullscreen sheets (`fullScreenMobile`): uses `scrollIntoView({ block: 'center' })` on focused input instead of translateY (avoids pushing content off-screen).
- Weight inputs accept comma: strength page weight fields use `e.target.value.replace(',', '.')` before regex validation (same pattern as distance fields).
- Cardio/custom duration required: duration is the only mandatory field for course/natation/marche/custom workouts. All other fields (distance, laps, elevation, session_type) are optional. Optional fields show "(facultatif)" / "(optional)" next to their label.
- Session types: optional field on all cardio forms (not musculation/custom). `SESSION_TYPES` in `data.ts` maps sport → allowed types (e.g. velo: endurance/intervals/tempo/recovery/climbing). `SessionTypeCard.tsx` renders pill selector with sport-colored link to library. Stored in `cycling_details.session_type` or `workout_details.session_type` (VARCHAR 30, nullable). API validates against `SESSION_TYPES[workoutType]` in POST/PUT handlers.
- Cardio library: static educational articles per sport at `/workout/{sport}/library`. Content in `library-content.ts` + per-sport files (`cycling-articles.ts`, etc.). `LibraryArticle` type with 7 block types (hero, big-numbers, intro, benefits-grid, caution, examples, tip). `LibraryListPage.tsx` (shared list), `LibraryArticle.tsx` (block renderer with scroll animations). Articles in FR + EN, beginner-friendly, technical terms always explained in parentheses. `SESSION_TYPE_COLORS` in `data.ts` for consistent color theming across cards, tags, and article heroes.
- CardioHeaderMenu: shared ⋮ menu on all 4 cardio pages with "Séances type" link to library. Added via `headerRight` prop on `WorkoutFormShell`.
- Save redirect: workout save now navigates to `/calendar` directly (no `?saved=1` query param). Medal celebration replaced by recap screen.
- PWA: `manifest.json` + minimal service worker (`sw.js`) in `public/`. Icons generated from favicon SVG (192, 512, apple-touch-icon). `InstallPrompt` component handles Android (`beforeinstallprompt` event) and iOS Safari (manual instructions). Dismissal stored in localStorage for 7 days. Service worker registered in the component.
- Brand colors: accent is gold `#c9a96e` (matching logo). Gradient pairs: `#c9a96e` → `#a0833a` (dark gold) or `#c9a96e` → `#e2c992` (light gold). Custom workout type stays violet `#a78bfa`.
- Page titles: all pages (home, calendar, stats, profile) use `text-[32px] lg:text-[38px] font-serif` for consistency.
- Ko-fi support: card on profile page (both guest & authenticated, top of page) + discreet round button in calendar header next to title. Links to `https://ko-fi.com/jupitertracker`. Gold-themed (`#c9a96e`). i18n keys prefixed `kofi*`.
- Logo: favicon SVG has intentional `#333` background. Horizontal dark logo in desktop sidebar via `<img>` tag.
- Onboarding: `OnboardingFlow` overlay shown when `has_seen_onboarding` is false on user record. 4 swipeable screens (welcome → goal → medals → discovery). `SwipeContainer` handles touch swipe with dot indicators. Discovery screen has 3 internal sub-slides (sports → calendar → CTA). `OnboardingGate` in Providers.tsx checks auth state and renders overlay. Completion calls `PUT /api/auth/me` with `has_seen_onboarding: true`. Register page at `/register` (full-screen, 2-step: identity → password). Guest data migration happens after registration.
