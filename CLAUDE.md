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
- i18n: `frontend/src/lib/i18n.tsx` (custom Context, FR default + EN). Language selector on profile page only (Settings section with dropdown).
- Auth context: `frontend/src/lib/auth.tsx` (AuthProvider, JWT in localStorage, `isGuest` flag for guest mode)
- Guest storage: `frontend/src/lib/guest-storage.ts` (guest workout CRUD + medal computation in localStorage, key `guest-workouts`)
- Data source: `frontend/src/lib/useDataSource.ts` (abstraction hook — routes to API or localStorage based on `isGuest`)
- Blurred overlay: `frontend/src/components/BlurredOverlay.tsx` (blur + CTA for guest-restricted sections)
- Rate limiter: `frontend/src/lib/rate-limit.ts` (in-memory, for login/register)
- Default exercises data: `frontend/src/lib/default-exercises.ts` (58 exercises, pure data, no server deps — safe for client import)
- Seed exercises: `frontend/src/lib/seed-exercises.ts` (server-side seeding on registration, re-exports DEFAULT_EXERCISES from default-exercises.ts)
- Middleware: `frontend/src/middleware.ts` (route protection — blocks API calls without Bearer token, except auth + health)
- Error boundary: `frontend/src/components/ErrorBoundary.tsx` (wraps app inside I18nProvider, bilingual fallback UI)
- Workout form shared: `frontend/src/lib/useWorkoutForm.ts` (hook), `frontend/src/components/WorkoutFormShell.tsx` (UI shell), `frontend/src/lib/duration.ts` (parsing), `frontend/src/components/DeleteConfirmModal.tsx` (modal), `frontend/src/lib/drafts.ts` (scan localStorage drafts)
- Shared input: `frontend/src/components/TextInput.tsx` (error state support, used across all forms and auth pages)

## Environment

- `frontend/.env.local` → `DATABASE_URL`, `JWT_SECRET`
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
- Services: `~/services/jupiter-frontend.service` (includes DATABASE_URL, JWT_SECRET env vars)
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
- Duration input: smart text field accepting "2h30", "1:45", "90" (minutes) — shared `parseDuration`/`formatDuration` in `frontend/src/lib/duration.ts`
- Workout forms (5 simple types) use shared `useWorkoutForm()` hook (`frontend/src/lib/useWorkoutForm.ts`) + `WorkoutFormShell` component (`frontend/src/components/WorkoutFormShell.tsx`). Each form page is ~70 lines (hook config + field JSX). Adding a new type = ~30 lines.
- Strength form is separate (complex exercise logs UI) but uses shared `DeleteConfirmModal` (`frontend/src/components/DeleteConfirmModal.tsx`)
- localStorage draft autosave for all workout types (`{type}-draft-${date}` / `{type}-edit-${workoutId}`) — handled by useWorkoutForm hook
- Draft visibility: unsaved drafts appear on Calendar grid + day panel + HomePage "Today" section with dashed border + 50% opacity. `getDraftWorkouts()` in `frontend/src/lib/drafts.ts` scans localStorage. Clicking a draft card navigates to the form which auto-loads it. "Supprimer le brouillon" button clears localStorage and redirects to calendar.
- Save animation + redirect with `/calendar?saved=1` triggers medal celebration in WeeklyProgress. `replaceState` uses `pathname` (not hardcoded `/`) to strip query param without changing route.
- DB values (muscle groups, ride types) stay in French — display translated via `t.muscleGroups[dbValue]`
- env vars (`JWT_SECRET`) read at call time in API route handlers — `getJwtSecret()` throws if undefined (never fallback to empty string)
- All POST/PUT API routes validate input with Zod schemas (`frontend/src/lib/validations.ts`) — returns 400 with field errors on invalid input
- Middleware (`frontend/src/middleware.ts`) blocks unauthenticated API calls at the edge (except `/api/auth/*` and `/api/health`)
- Security headers in `next.config.mjs`: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- ErrorBoundary wraps app inside I18nProvider (order: I18nProvider → ErrorBoundary → AuthProvider → App) so error UI is bilingual
- DB indexes: `workouts(user_id, date)`, `workouts(user_id, type)`, `cycling_details(workout_id)`, `workout_details(workout_id)`, `exercise_logs(workout_id)`, `exercise_logs(exercise_id)`, `exercises(user_id, muscle_group)` — migration in `database/migrations/001_add_indexes.sql`
- DB migrations: `003_exercise_log_mode.sql` (adds `mode TEXT DEFAULT 'reps-weight'` + `duration INTEGER` to exercise_logs), `004_exercise_default_mode.sql` (adds `default_mode TEXT DEFAULT 'reps-weight'` to exercises)
- Numeric inputs use `type="text"` + `inputMode="decimal"/"numeric"` (NOT `type="number"`) — prevents silent value coercion. onChange filters non-numeric chars via regex (`/^[0-9]*\.?[0-9]*$/` for decimals, `/^[0-9]*$/` for integers). Validation also at save time + Zod on server.
- TextInput component (`frontend/src/components/TextInput.tsx`): shared input with `error` prop (red border + red text). Used in all workout forms, login, register, profile. Pass `className="bg-bg"` to override background on auth pages.
- Field-level validation errors: `useWorkoutForm.validate()` returns `{ message, fields[] }`. Hook tracks `fieldErrors: Set<keyof F>`, clears on field input. TextInput gets `error={form.fieldErrors.has('fieldName')}`.
- Exercise notes: `exercise_workout_notes` table (workout_id, exercise_id, note, pinned). Pinned notes auto-appear on future workouts with same exercise. Notes visible in view mode + exercise history modal.
- WorkoutFormShell save button uses static `colorClasses` map (NOT dynamic `bg-${color}`) — Tailwind cannot detect dynamic class names.
- Medal formula: `GREATEST(count - 2, 0)` — 3 sessions/week = 1 medal, 4 = 2, etc.
- Medal UI: header card = total medals (big icon + number), monthly card = month medals (sum of weeklyMedals) + progress bar + info modal on tap
- Athlete level: `computeLevel(totalMedals)` in `data.ts` — level 0 = beginner, level N threshold = `N*(9+N)/2` (5, 11, 18, 26...). Displayed on HomePage header + StatsPage top card with progress bar + period medals. Clickable info modal on both. Label: "Débutant"/"Niveau X" (FR), "Beginner"/"Level X" (EN) — no "sportif"/"athlete" in the level value display.
- Muscle groups: Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets. Split into `UPPER_BODY_GROUPS` / `LOWER_BODY_GROUPS`. No "Jambes" or "Autre".
- Default exercises seeded per user on registration (`frontend/src/lib/seed-exercises.ts`) — 58 exercises across 10 muscle groups. Data lives in `default-exercises.ts` (client-safe), seeding function in `seed-exercises.ts` (server-only).
- Exercises sorted by `muscle_group, id` (oldest/seeded first, user-created last)
- Strength sets (reps-weight mode): only reps required, weight defaults to 0 if empty. Weight auto-fills empty sets below on blur (not on keystroke) + new sets copy previous weight.
- Strength sets (time mode): duration in seconds required. Duration auto-fills below on blur + new sets copy previous duration. Saved as `mode='time'`, `duration=N`, `reps=0`, `weight=0` in exercise_logs.
- `window.location.href` redirects use `BASE_PATH` env var (for subpath deployment)
- BottomNav active state: exact match for `/` (home), `startsWith` for other routes — prevents home from highlighting on `/calendar`. Home tab uses gold `#c9a96e` when active (matches homepage accent), other tabs use default `text-accent`.
- Strength exercise cards: chevron on left (collapse toggle), three-dot menu (⋮) on right. Collapsed by default in view mode (shows summary like "4×10 @ 80kg" or "3× 45s"), expanded in edit mode.
- Three-dot menu (⋮) options: History (always), Replace (edit mode — opens exercise picker, confirmation if data exists), Tracking mode (edit mode — BottomSheet with "Reps & weight" / "Time" selectable cards), Add note (edit mode, hidden when note visible), Remove (edit mode, red, confirmation modal).
- Exercise tracking modes: `reps-weight` (default — columns: Set, Previous, Reps, Weight) and `time` (columns: Set, Previous, Duration in seconds). Mode stored per exercise_log in DB (`mode` column) + per exercise as default (`exercises.default_mode`). Time input: `inputMode="numeric"`, raw seconds, formatted as mm:ss in view/history. Duration auto-fills empty sets below on blur (like weight).
- New exercise modal: name + muscle group + tracking mode selector (two side-by-side cards: dumbbell "Reps & poids" / chrono "Temps"). Default mode persists to `exercises.default_mode` and auto-applies when adding the exercise to future workouts.
- Bottom sheets use `BottomSheet` component (`frontend/src/components/BottomSheet.tsx`) — handles backdrop, notch, animation, and swipe-to-close gesture. Props: `open`, `onClose`, `desktopSidebarOffset` (for sidebar offset), `fullScreenMobile` (exercise picker), `className`. Scrollable children need `data-bottom-sheet-scroll` attribute to prevent swipe from fighting scroll.
- All bottom-sheet modals follow same pattern: notch at top (swipe down to close) + "Annuler" button at bottom. No ✕ close buttons.
- Homepage modals use `lg:left-[200px]` to offset for desktop sidebar — pass `desktopSidebarOffset` to `BottomSheet`
- Homepage i18n keys prefixed `home*` to avoid conflicts with stats page keys (e.g. `homeMedalsLabel`, `homeDistance`, `homeVolume`)
- Desktop layout: `page-container` (896px) / `page-container-wide` (1152px) utility classes in `globals.css` — use on page wrapper divs for consistent width, centering, and padding on `lg:`. Calendar uses `page-container-wide`, all other pages use `page-container`.
- Page titles: Calendar, Stats, Profile all use `h1.font-serif.text-[22px].font-normal` inside `div.pt-14.pb-4.lg:pt-8`. HomePage has its own larger greeting pattern. Keep consistent when adding pages.
- Profile page layout: sectioned cards with `Section` (icon + title) and `SettingRow` components. Sections: user avatar header card, profile (nickname), security (password change), app settings (language dropdown), logout button. Guest view: centered avatar + CTA + settings.
- Guest mode: app usable without account, workouts stored in localStorage (`guest-workouts` key). `useDataSource()` hook routes all data ops to API (authenticated) or localStorage (guest). `isGuest` from AuthContext determines mode.
- Guest exercises: stored in `guest-exercises` localStorage key, seeded from `seed-exercises.ts` on first strength form access.
- Account creation: bottom sheet on profile page (email + nickname + password, no invite code). Migrates guest workouts + custom exercises to DB on registration/login.
- BlurredOverlay: wraps content with blur + CTA button. Used on HomePage (insights, streak) and StatsPage (charts) for guest users.
- Guest medals: computed client-side in `guest-storage.ts` using same formula `max(count - 2, 0)` per ISO week. Functions: `getGuestWeeklyProgress()`, `getGuestWeeklyMedalsForMonth()`, `getGuestMedals()`. WeeklyProgress, Calendar, HomePage all use these in guest mode.
- API 401 guard: `api.ts` `request()` does `window.location.href = '/'` on 401. ANY component calling API functions MUST check `isGuest` first to avoid infinite reload loops. WeeklyProgress, Calendar, HomePage, StatsPage all guard with `if (isGuest)` branch.
- Default exercises split: `default-exercises.ts` (pure data) vs `seed-exercises.ts` (imports db-server). Client components must import from `default-exercises.ts` — importing `seed-exercises.ts` client-side fails because `pg` module can't be bundled.

## Pages

`/` (home), `/calendar`, `/profile`, `/stats`, `/workout/cycling`, `/workout/strength`, `/workout/running`, `/workout/swimming`, `/workout/walking`, `/workout/custom`. No login/register pages — account creation via bottom sheet on profile page. Nav always visible.

## Home Page

`HomePage` component (`frontend/src/components/HomePage.tsx`) — dashboard landing page:
- Greeting with user name + time-of-day (matin/après-midi/soir), gold accent color (`#c9a96e` / `#e2c992`). Athlete level card on the right (clickable → level info modal with progress bar).
- Today's workouts card with sport chips + "Commencer une séance" button (always visible, opens workout type picker modal)
- Weekly tracker: 7 animated bars (Mon-Sun) with colored dots per workout type
- Medals card (clickable → medal info modal): total + monthly count with gold styling
- Key insights grid (2x2): sessions, distance, active time, strength volume — with trend vs previous week
- Streak card: consecutive days + best streak
- API route: `GET /api/home` (`frontend/src/app/api/home/route.ts`) — returns today, week, medals, insights, streak in one call. Today's `exercise_count` uses `COUNT(DISTINCT exercise_id)` (not total sets).
- Guest mode: today's workouts + weekly tracker + medals computed from localStorage. Insights + streak wrapped in `<BlurredOverlay>` with placeholder data. Greeting shows no name. Medal card is fully functional (total, monthly badge, info modal).

## Calendar Page

Moved from `/` to `/calendar`. All workout form redirects (`router.push`, `?saved=1`) point to `/calendar`.

## Adding a New Workout Type (checklist)

1. **DB**: Add value to `workouts.type` CHECK constraint in Supabase (`ALTER TABLE workouts DROP CONSTRAINT ..., ADD CONSTRAINT ... CHECK (type IN ('velo','musculation','course','natation','marche','custom','NEW_TYPE'))`)
2. **`data.ts`**: Add to `WorkoutType` union + `WORKOUT_TYPES` array + `WORKOUT_CONFIG` (emoji, color, colorSoft, route)
3. **Tailwind**: Add `bg-NEWCOLOR` / `text-NEWCOLOR` classes in `tailwind.config.ts` `theme.extend.colors` if new color. Also add to `colorClasses` map in `WorkoutFormShell.tsx`
4. **`i18n.tsx`**: Add translation keys for workout name (FR + EN), add to `workoutTypeLabels` and `workoutTypeTags` in both locales
5. **`useWorkoutForm.ts`**: Add workout name mapping in `workoutNames` record (~line 202)
6. **Page**: Create `frontend/src/app/workout/NEWTYPE/page.tsx` — ~30-70 lines using `useWorkoutForm()` + `<WorkoutFormShell>`. Copy from `running/page.tsx` (simplest) and adapt: type, storagePrefix, defaultFields, buildPayload, validate, loadFromApi, color, shadowColor
7. **API**: If using `workout_details`, add type to the allowed list in `frontend/src/app/api/workouts/route.ts` (`['course', 'natation', 'marche', 'custom'].includes(type)`)
8. **Zod**: Add type to `createWorkoutSchema`/`updateWorkoutSchema` in `frontend/src/lib/validations.ts`
9. **Calendar**: Type will auto-appear via `WORKOUT_CONFIG` lookup — no changes needed
10. **Home/Stats**: `api.ts` `toWorkout()` needs a case for the new type's detail string. Stats pages auto-include via type distribution.

## Stats Page

`StatsPage` component (`frontend/src/components/StatsPage.tsx`) — single scrollable page with Recharts graphs:
- Period selector: month/year toggle + navigation arrows
- Athlete level card (first, clickable → info modal): level + progress bar + period medals (month or year)
- Summary cards: total sessions, distance (km), elevation (m), active days
- Medal progression: AreaChart with cumulative medals (always full history, not filtered by period)
- Type distribution: PieChart donut with sport colors + legend
- Distance by sport: stacked BarChart with sport filter chips
- Strength volume: conditional card (tonnage, exercises, sets) — only if musculation data exists
- Recharts dependency in frontend/package.json
- Guest mode: total sessions + active days shown, all charts wrapped in `<BlurredOverlay>` with CTA
