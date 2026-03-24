# Cardio Session Types & Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional session type field to cardio workout forms, an inspiration card linking to a static library of educational articles per sport with rich editorial design.

**Architecture:** New `session_type` column on both detail tables. Cardio forms gain an optional toggle field (custom page `_activeFields` pattern). Static library pages per sport (`/workout/{sport}/library`) with structured article blocks rendered by a shared component. Inspiration card + ⋮ menu provide access points.

**Tech Stack:** Next.js 14 App Router, PostgreSQL (Supabase), Recharts-free (pure CSS animations), custom i18n

---

### Task 1: Database + Constants + i18n + Validations

**Files:**
- Modify: `frontend/src/lib/schema.ts` (add sessionType columns)
- Modify: `frontend/src/lib/data.ts` (add SESSION_TYPES, SESSION_TYPE_COLORS)
- Modify: `frontend/src/lib/i18n.tsx` (add session type + library i18n keys)
- Modify: `frontend/src/lib/validations.ts` (add session_type to Zod schemas)
- Modify: `frontend/src/lib/guest-storage.ts` (add session_type to GuestWorkout)

**Context:** `data.ts` has RIDE_TYPES and WORKOUT_CONFIG. `validations.ts` has `cyclingDetailsSchema` (lines 41-46) and `workoutDetailsSchema` (lines 63-68). `schema.ts` has `cyclingDetails` (lines 22-29) and `workoutDetails` (lines 31-38). `guest-storage.ts` has `GuestWorkout` interface (lines 3-38) with `cycling_details` and `workout_details` sub-objects.

- [ ] **Step 1: Run DB migration**

```sql
ALTER TABLE cycling_details ADD COLUMN session_type VARCHAR(30);
ALTER TABLE workout_details ADD COLUMN session_type VARCHAR(30);
```

Run via Supabase SQL editor or `psql`. No default, nullable.

- [ ] **Step 2: Add sessionType to schema.ts**

In `cyclingDetails` table (after `rideType` line ~29), add:
```typescript
sessionType: varchar('session_type', { length: 30 }),
```

In `workoutDetails` table (after `laps` line ~38), add:
```typescript
sessionType: varchar('session_type', { length: 30 }),
```

- [ ] **Step 3: Add SESSION_TYPES and SESSION_TYPE_COLORS to data.ts**

After `RIDE_TYPES` (~line 31), add:

```typescript
export const SESSION_TYPES: Record<string, string[]> = {
  velo: ['endurance', 'intervals', 'tempo', 'recovery', 'climbing'],
  course: ['endurance', 'intervals', 'tempo', 'recovery', 'fartlek'],
  natation: ['endurance', 'intervals', 'technique', 'recovery', 'mixed'],
  marche: ['walk', 'brisk', 'hike', 'recovery'],
};

export const SESSION_TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  endurance: { text: '#4ade80', bg: '#1a3a2a' },
  intervals: { text: '#f87171', bg: '#3a1a1a' },
  tempo: { text: '#facc15', bg: '#2a2a1a' },
  recovery: { text: '#60a5fa', bg: '#1a2a3a' },
  climbing: { text: '#c084fc', bg: '#2a1a2a' },
  fartlek: { text: '#fb923c', bg: '#2a1a0a' },
  technique: { text: '#2dd4bf', bg: '#0a2a2a' },
  mixed: { text: '#a78bfa', bg: '#1a1a3a' },
  walk: { text: '#4ade80', bg: '#1a3a2a' },
  brisk: { text: '#facc15', bg: '#2a2a1a' },
  hike: { text: '#c084fc', bg: '#2a1a2a' },
};
```

- [ ] **Step 4: Add i18n keys**

In FR translations, add:
```typescript
sessionType: 'Type de séance',
addSessionType: '+ Type de séance',
libraryMenuLabel: 'Séances type',
librarySubtitle: (n: number) => `${n} séance${n > 1 ? 's' : ''}`,
libraryInspireTitle: "Besoin d'inspiration ?",
libraryInspireSubtitle: (sport: string) => `Découvrez nos séances type ${sport}`,
libraryInspireAction: 'Voir',
sessionTypes: {
  endurance: 'Endurance',
  intervals: 'Intervalles',
  tempo: 'Tempo',
  recovery: 'Récupération',
  climbing: 'Côtes / Grimpée',
  fartlek: 'Fartlek',
  technique: 'Technique',
  mixed: 'Mixte',
  walk: 'Balade',
  brisk: 'Marche rapide',
  hike: 'Randonnée',
} as Record<string, string>,
librarySportNames: {
  velo: 'vélo',
  course: 'course à pied',
  natation: 'natation',
  marche: 'marche',
} as Record<string, string>,
```

In EN translations, add:
```typescript
sessionType: 'Session type',
addSessionType: '+ Session type',
libraryMenuLabel: 'Session guides',
librarySubtitle: (n: number) => `${n} session${n > 1 ? 's' : ''}`,
libraryInspireTitle: 'Need inspiration?',
libraryInspireSubtitle: (sport: string) => `Discover our ${sport} session guides`,
libraryInspireAction: 'See',
sessionTypes: {
  endurance: 'Endurance',
  intervals: 'Intervals',
  tempo: 'Tempo',
  recovery: 'Recovery',
  climbing: 'Climbing',
  fartlek: 'Fartlek',
  technique: 'Technique',
  mixed: 'Mixed',
  walk: 'Walk',
  brisk: 'Brisk walk',
  hike: 'Hike',
} as Record<string, string>,
librarySportNames: {
  velo: 'cycling',
  course: 'running',
  natation: 'swimming',
  marche: 'walking',
} as Record<string, string>,
```

Also add the types to the Translations interface (wherever `sessionType` etc. need to be typed).

- [ ] **Step 5: Add session_type to Zod schemas in validations.ts**

In `cyclingDetailsSchema` (~line 41), add after `ride_type`:
```typescript
session_type: z.string().max(30).optional().nullable(),
```

In `workoutDetailsSchema` (~line 63), add after `laps`:
```typescript
session_type: z.string().max(30).optional().nullable(),
```

- [ ] **Step 6: Add session_type to guest-storage.ts**

In the `GuestWorkout` interface, add `session_type` to both detail sub-objects:

In `cycling_details` (~line 14, after `ride_type`):
```typescript
session_type: string | null;
```

In `workout_details` (~line 22, after `laps`):
```typescript
session_type: string | null;
```

- [ ] **Step 7: Type check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add frontend/src/lib/schema.ts frontend/src/lib/data.ts frontend/src/lib/i18n.tsx frontend/src/lib/validations.ts frontend/src/lib/guest-storage.ts
git commit -m "feat: add session type constants, i18n, validations, schema"
```

**Note:** The spec mentions `SPORT_URL_SLUGS` in `data.ts` — we deliberately skip this since `WORKOUT_CONFIG[sportType].route` already provides the URL mapping (e.g. `velo` → `/workout/cycling`). No need for a redundant constant.

---

### Task 2: API Changes (POST/PUT/GET)

**Files:**
- Modify: `frontend/src/app/api/workouts/route.ts` (GET SELECT + POST INSERT + validation)
- Modify: `frontend/src/app/api/workouts/[id]/route.ts` (GET SELECT + PUT INSERT + validation)

**Context:** The GET in `route.ts` (line 16) explicitly lists columns: `cd.duration, cd.distance, cd.elevation, cd.ride_type` and `wd.duration as wd_duration, wd.distance as wd_distance, wd.elevation as wd_elevation, wd.laps as wd_laps`. The POST INSERT for `cycling_details` (lines 53-60) destructures `{ duration, distance, elevation, ride_type }`. The PUT in `[id]/route.ts` uses delete-then-reinsert with the same column lists. The `[id]` GET uses `SELECT *` for detail tables, so it will pick up `session_type` automatically.

- [ ] **Step 1: Update GET in route.ts**

In the SELECT query (~line 16), add `cd.session_type` after `cd.ride_type`, and `wd.session_type as wd_session_type` after `wd.laps as wd_laps`:

```sql
SELECT w.*,
  cd.duration, cd.distance, cd.elevation, cd.ride_type, cd.session_type,
  wd.duration as wd_duration, wd.distance as wd_distance, wd.elevation as wd_elevation, wd.laps as wd_laps, wd.session_type as wd_session_type,
  (SELECT COUNT(DISTINCT el.exercise_id) FROM exercise_logs el WHERE el.workout_id = w.id) as exercise_count
FROM workouts w
...
```

- [ ] **Step 2: Add session_type validation in POST route.ts**

After Zod validation succeeds, before the INSERT, add runtime validation of `session_type` against allowed values:

```typescript
import { SESSION_TYPES } from '@/lib/data';

// After Zod parse, before DB insert:
if (cycling_details?.session_type) {
  const allowed = SESSION_TYPES[type];
  if (!allowed || !allowed.includes(cycling_details.session_type)) {
    return NextResponse.json({ error: 'Invalid session_type' }, { status: 400 });
  }
}
if (workout_details?.session_type) {
  const allowed = SESSION_TYPES[type];
  if (!allowed || !allowed.includes(workout_details.session_type)) {
    return NextResponse.json({ error: 'Invalid session_type' }, { status: 400 });
  }
}
```

Add the same validation in the PUT handler (`[id]/route.ts`).

- [ ] **Step 3: Update POST cycling_details INSERT in route.ts**

Change the destructure (~line 54) and INSERT (~line 56):

```typescript
if (type === 'velo' && cycling_details) {
  const { duration, distance, elevation, ride_type, session_type } = cycling_details;
  await client.query(
    `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type, session_type)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [workout.id, duration, distance, elevation, ride_type, session_type || null]
  );
}
```

- [ ] **Step 4: Update POST workout_details INSERT in route.ts**

Change the destructure (~line 84) and INSERT (~line 86):

```typescript
if (['course', 'natation', 'marche', 'custom'].includes(type) && workout_details) {
  const { duration, distance, elevation, laps, session_type } = workout_details;
  await client.query(
    `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps, session_type)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [workout.id, duration || null, distance || null, elevation || null, laps || null, session_type || null]
  );
}
```

- [ ] **Step 5: Update PUT cycling_details INSERT in [id]/route.ts**

Same change as POST — add `session_type` to the destructure and INSERT (~lines 76-82):

```typescript
await client.query('DELETE FROM cycling_details WHERE workout_id = $1', [id]);
if (type === 'velo' && cycling_details) {
  const { duration, distance, elevation, ride_type, session_type } = cycling_details;
  await client.query(
    `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type, session_type)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, duration, distance, elevation, ride_type, session_type || null]
  );
}
```

- [ ] **Step 6: Update PUT workout_details INSERT in [id]/route.ts**

Same change (~lines 107-115):

```typescript
await client.query('DELETE FROM workout_details WHERE workout_id = $1', [id]);
if (['course', 'natation', 'marche', 'custom'].includes(type) && workout_details) {
  const { duration, distance, elevation, laps, session_type } = workout_details;
  await client.query(
    `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps, session_type)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, duration || null, distance || null, elevation || null, laps || null, session_type || null]
  );
}
```

- [ ] **Step 7: Type check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/api/workouts/route.ts frontend/src/app/api/workouts/\[id\]/route.ts
git commit -m "feat: add session_type to workout API endpoints"
```

---

### Task 3: Session Type Field on Cycling Page

**Files:**
- Modify: `frontend/src/app/workout/cycling/page.tsx`

**Context:** Cycling currently has `defaultFields: { duration: '', distance: '', elevation: '', rideType: RIDE_TYPES[0] }` with NO `_activeFields`. All fields always visible. We need to add `sessionType: ''` and `_activeFields: ''`, plus the toggle button and dropdown. Follow the custom page pattern from `frontend/src/app/workout/custom/page.tsx` (lines 50-60 for toggleField, lines 112-130 for button JSX). Import `SESSION_TYPES` from `data.ts`.

- [ ] **Step 1: Add fields + toggle logic**

Add `sessionType: ''` and `_activeFields: ''` to `defaultFields`.

Add `SESSION_TYPES` to imports from `@/lib/data`.

Update `buildPayload` to include `session_type` only when active:
```typescript
buildPayload: (f) => {
  const active = new Set(f._activeFields ? f._activeFields.split(',') : []);
  return {
    cycling_details: {
      duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
      distance: f.distance ? parseFloat(f.distance) : undefined,
      elevation: f.elevation ? parseInt(f.elevation) : undefined,
      ride_type: f.rideType,
      session_type: active.has('sessionType') && f.sessionType ? f.sessionType : undefined,
    },
  };
},
```

Update `loadFromApi` to reconstruct `_activeFields`:
```typescript
loadFromApi: (cd) => {
  const activeList: string[] = [];
  if (cd.session_type) activeList.push('sessionType');
  return {
    duration: cd.duration ? formatDuration(Number(cd.duration)) : '',
    distance: cd.distance ? String(cd.distance) : '',
    elevation: cd.elevation ? String(cd.elevation) : '',
    rideType: cd.ride_type ? String(cd.ride_type) : RIDE_TYPES[0],
    sessionType: cd.session_type ? String(cd.session_type) : '',
    _activeFields: activeList.join(','),
  };
},
```

- [ ] **Step 2: Add toggle and dropdown JSX**

Inside the form component, add the toggle logic (same pattern as custom page):
```typescript
const activeFields = new Set(form.fields._activeFields ? form.fields._activeFields.split(',') : []);
const toggleField = (field: string) => {
  const next = new Set(activeFields);
  if (next.has(field)) {
    next.delete(field);
    if (field === 'sessionType') form.setField('sessionType', '');
  } else {
    next.add(field);
  }
  form.setField('_activeFields', Array.from(next).join(','));
};
```

After the elevation field, add:

```tsx
{/* Session type (optional toggle) */}
{activeFields.has('sessionType') && (
  <div className="mb-4">
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs text-text-muted uppercase tracking-wide">{t.sessionType}</label>
      {!form.readOnly && (
        <button type="button" onClick={() => toggleField('sessionType')}
          className="text-xs text-text-muted">{t.removeField}</button>
      )}
    </div>
    <select value={form.fields.sessionType}
      onChange={(e) => form.setField('sessionType', e.target.value)}
      disabled={form.readOnly}
      className="w-full py-3.5 px-4 bg-bg-card border border-border rounded-sm text-[15px] text-text disabled:opacity-50">
      <option value="">{t.sessionType}</option>
      {SESSION_TYPES.velo.map((st) => (
        <option key={st} value={st}>{t.sessionTypes[st]}</option>
      ))}
    </select>
  </div>
)}

{/* + Type de séance button */}
{!form.readOnly && !activeFields.has('sessionType') && (
  <div className="mb-4">
    <button type="button" onClick={() => toggleField('sessionType')}
      className="py-2 px-3 bg-bg-card border border-border rounded-sm text-text-secondary text-[13px] font-medium transition-all duration-150 active:scale-[0.96]">
      {t.addSessionType}
    </button>
  </div>
)}
```

- [ ] **Step 3: Type check + visual test**

Run: `cd frontend && npx tsc --noEmit`
Then visually test: open `/workout/cycling`, verify "+ Type de séance" button appears, clicking it shows dropdown with 5 options, "Remove" hides it.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/workout/cycling/page.tsx
git commit -m "feat: add optional session type field to cycling form"
```

---

### Task 4: Session Type Field on Running, Swimming, Walking Pages

**Files:**
- Modify: `frontend/src/app/workout/running/page.tsx`
- Modify: `frontend/src/app/workout/swimming/page.tsx`
- Modify: `frontend/src/app/workout/walking/page.tsx`

**Context:** Same pattern as Task 3 (cycling) but using `workout_details` instead of `cycling_details`, and each sport's own `SESSION_TYPES[type]` list. Running has `defaultFields: { duration: '', distance: '' }`. Swimming has `{ duration: '', laps: '' }`. Walking has `{ duration: '', distance: '' }`. None have `_activeFields` yet.

- [ ] **Step 1: Update running/page.tsx**

Add `sessionType: ''` and `_activeFields: ''` to `defaultFields`.

Update `buildPayload`:
```typescript
buildPayload: (f) => {
  const active = new Set(f._activeFields ? f._activeFields.split(',') : []);
  return {
    workout_details: {
      duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
      distance: f.distance ? parseFloat(f.distance) : undefined,
      session_type: active.has('sessionType') && f.sessionType ? f.sessionType : undefined,
    },
  };
},
```

Update `loadFromApi`:
```typescript
loadFromApi: (wd) => {
  const activeList: string[] = [];
  if (wd.session_type) activeList.push('sessionType');
  return {
    duration: wd.duration ? formatDuration(Number(wd.duration)) : '',
    distance: wd.distance ? String(wd.distance) : '',
    sessionType: wd.session_type ? String(wd.session_type) : '',
    _activeFields: activeList.join(','),
  };
},
```

Add toggle logic + JSX (same as cycling Task 3 Step 2 but with `SESSION_TYPES.course`).

- [ ] **Step 2: Update swimming/page.tsx**

Same pattern but `SESSION_TYPES.natation`. Swimming uses `laps` instead of `distance` — the session type toggle is independent of that.

- [ ] **Step 3: Update walking/page.tsx**

Same pattern but `SESSION_TYPES.marche`.

- [ ] **Step 4: Type check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/workout/running/page.tsx frontend/src/app/workout/swimming/page.tsx frontend/src/app/workout/walking/page.tsx
git commit -m "feat: add optional session type field to running, swimming, walking forms"
```

---

### Task 5: CardioHeaderMenu + WorkoutFormShell headerRight

**Files:**
- Create: `frontend/src/components/CardioHeaderMenu.tsx`
- Modify: `frontend/src/components/WorkoutFormShell.tsx` (add headerRight prop)
- Modify: `frontend/src/app/workout/cycling/page.tsx` (pass headerRight)
- Modify: `frontend/src/app/workout/running/page.tsx` (pass headerRight)
- Modify: `frontend/src/app/workout/swimming/page.tsx` (pass headerRight)
- Modify: `frontend/src/app/workout/walking/page.tsx` (pass headerRight)

**Context:** `WorkoutFormShell` currently has NO `headerRight` prop (props interface at lines 11-18). It renders `<WorkoutFormHeader {...form.headerProps} />` at line 37. `WorkoutFormHeader` already accepts `headerRight` (used by strength page). The strength page bypasses `WorkoutFormShell` — it has its own layout. We need to add `headerRight` passthrough to the shell.

The ⋮ menu pattern from the strength page (~lines 983-1057): a `w-9 h-9 rounded-full bg-bg-card border border-border` button with three-dots SVG, absolute-positioned dropdown with `animate-fadeIn`.

- [ ] **Step 1: Create CardioHeaderMenu component**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import type { WorkoutType } from '@/lib/data';
import { WORKOUT_CONFIG } from '@/lib/data';

interface Props {
  sportType: WorkoutType;
}

export default function CardioHeaderMenu({ sportType }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const libraryPath = WORKOUT_CONFIG[sportType].route + '/library';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center"
      >
        <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor" className="text-text-muted">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-11 bg-bg-card border border-border rounded-xl shadow-lg z-50 min-w-[200px] overflow-hidden animate-fadeIn">
          <button
            type="button"
            onClick={() => { setOpen(false); router.push(libraryPath); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-[14px] text-text hover:bg-bg-elevated transition-colors"
          >
            <span className="text-base">📖</span>
            {t.libraryMenuLabel}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add headerRight prop to WorkoutFormShell**

In the `WorkoutFormShellProps` interface, add:
```typescript
headerRight?: React.ReactNode;
```

In the component body, pass it to the header:
```typescript
<WorkoutFormHeader {...form.headerProps} headerRight={headerRight} />
```

Accept the prop in the function signature.

- [ ] **Step 3: Pass CardioHeaderMenu to all 4 cardio pages**

In each cardio page (cycling, running, swimming, walking), import `CardioHeaderMenu` and pass it to `WorkoutFormShell`:

```tsx
import CardioHeaderMenu from '@/components/CardioHeaderMenu';

// In the JSX, on WorkoutFormShell:
<WorkoutFormShell
  form={form}
  color="cycling" // or running/swimming/walking
  shadowColor="..."
  headerRight={
    !form.loadingWorkout && (!workoutId || form.editing) ? (
      <CardioHeaderMenu sportType="velo" />
    ) : undefined
  }
>
```

Use the correct `sportType` for each page: `velo`, `course`, `natation`, `marche`.

- [ ] **Step 4: Type check + visual test**

Run: `cd frontend && npx tsc --noEmit`
Then visually test: open any cardio form, verify ⋮ button appears in header, dropdown shows "Séances type", clicking navigates to `/workout/{sport}/library` (will 404 for now — that's fine).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/CardioHeaderMenu.tsx frontend/src/components/WorkoutFormShell.tsx frontend/src/app/workout/cycling/page.tsx frontend/src/app/workout/running/page.tsx frontend/src/app/workout/swimming/page.tsx frontend/src/app/workout/walking/page.tsx
git commit -m "feat: add header menu with library link to cardio pages"
```

---

### Task 6: Inspiration Card

**Files:**
- Create: `frontend/src/components/InspirationCard.tsx`
- Modify: `frontend/src/app/workout/cycling/page.tsx` (render card)
- Modify: `frontend/src/app/workout/running/page.tsx` (render card)
- Modify: `frontend/src/app/workout/swimming/page.tsx` (render card)
- Modify: `frontend/src/app/workout/walking/page.tsx` (render card)

**Context:** The card shows on empty, new workouts (no `workoutId`). It uses the `useWorkoutForm` hook's state — the card is rendered inside each page's form children, above the fields. It dismisses itself via localStorage key `library-card-dismissed-{sport}`.

- [ ] **Step 1: Create InspirationCard component**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { WORKOUT_CONFIG } from '@/lib/data';
import type { WorkoutType } from '@/lib/data';

interface Props {
  sportType: WorkoutType;
  accentColor: string; // sport color e.g. 'text-cycling' or hex
  hasData: boolean;
  workoutId?: string | null;
}

export default function InspirationCard({ sportType, hasData, workoutId }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const storageKey = `library-card-dismissed-${sportType}`;

  useEffect(() => {
    if (sessionStorage.getItem(storageKey)) setDismissed(true);
  }, [storageKey]);

  if (workoutId || hasData || dismissed) return null;

  const libraryPath = WORKOUT_CONFIG[sportType].route + '/library';
  const sportName = t.librarySportNames[sportType] || sportType;

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(storageKey, '1');
    setDismissed(true);
  };

  return (
    <div
      onClick={() => router.push(libraryPath)}
      className="relative mb-5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, #1a2332 0%, #1a1b22 100%)',
        borderColor: '#2a3a4a',
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full text-text-muted text-xs hover:bg-bg-elevated"
      >
        ✕
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xl">💡</span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-text">{t.libraryInspireTitle}</div>
          <div className="text-[11px] text-text-muted mt-0.5">{t.libraryInspireSubtitle(sportName)}</div>
        </div>
        <span className={`text-[13px] font-medium ${accentColor}`}>{t.libraryInspireAction} →</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add InspirationCard to all 4 cardio pages**

In each page, import `InspirationCard` and render it as the first child inside `WorkoutFormShell`, above the form fields:

```tsx
import InspirationCard from '@/components/InspirationCard';

// Inside WorkoutFormShell children, at the top:
<InspirationCard
  sportType="velo"
  hasData={/* check if any field is non-empty */}
  workoutId={workoutId}
/>
```

For `hasData`, use a simple check like:
```typescript
const hasFormData = Object.entries(form.fields).some(
  ([k, v]) => k !== '_activeFields' && k !== 'rideType' && v !== '' && v !== RIDE_TYPES[0]
);
```

The exact check varies per sport — for running it's `form.fields.duration !== '' || form.fields.distance !== ''`, etc. Keep it simple per page.

- [ ] **Step 3: Type check + visual test**

Run: `cd frontend && npx tsc --noEmit`
Visually test: open `/workout/cycling` (new, empty) — card should show. Fill any field — card should disappear. Dismiss with × — card stays hidden for the session.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/InspirationCard.tsx frontend/src/app/workout/cycling/page.tsx frontend/src/app/workout/running/page.tsx frontend/src/app/workout/swimming/page.tsx frontend/src/app/workout/walking/page.tsx
git commit -m "feat: add inspiration card to cardio workout forms"
```

---

### Task 7: Library List Page

**Files:**
- Create: `frontend/src/components/LibraryListPage.tsx` (shared list component)
- Create: `frontend/src/lib/library-content.ts` (article data types + stub data)
- Create: `frontend/src/app/workout/cycling/library/page.tsx` (thin wrapper)
- Create: `frontend/src/app/workout/running/library/page.tsx`
- Create: `frontend/src/app/workout/swimming/library/page.tsx`
- Create: `frontend/src/app/workout/walking/library/page.tsx`

**Context:** Each library page is a static route (matching existing codebase — no dynamic `[sport]` segment). They import a shared `LibraryListPage` component. Article data is in `library-content.ts` with typed blocks. For this task, create the types and stub hero blocks only — full article content comes in Task 9.

- [ ] **Step 1: Create library-content.ts with types and stubs**

```typescript
export type ArticleBlock =
  | { type: 'hero'; tag: string; title: string; subtitle: string }
  | { type: 'big-numbers'; items: { value: string; label: string }[] }
  | { type: 'intro'; title: string; text: string }
  | { type: 'benefits-grid'; title: string; items: { emoji: string; title: string; text: string }[] }
  | { type: 'caution'; items: string[] }
  | { type: 'examples'; title: string; items: ExampleSession[] }
  | { type: 'tip'; text: string };

export interface ExampleSession {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  metrics: { label: string; value: string }[];
  description: string;
}

export interface LibraryArticle {
  sport: string;
  sessionType: string;
  title: string;
  subtitle: string;
  blocks: ArticleBlock[];
}

// FR content — each article has at minimum a hero block
// Full content will be added per article
export const LIBRARY_ARTICLES_FR: LibraryArticle[] = [
  // CYCLING
  { sport: 'velo', sessionType: 'endurance', title: 'La sortie longue, pilier de votre progression', subtitle: "Comprendre l'endurance fondamentale et pourquoi elle devrait représenter la majorité de votre entraînement.", blocks: [{ type: 'hero', tag: 'Endurance', title: 'La sortie longue, pilier de votre progression', subtitle: "Comprendre l'endurance fondamentale et pourquoi elle devrait représenter la majorité de votre entraînement." }] },
  { sport: 'velo', sessionType: 'intervals', title: 'Le fractionné, accélérateur de performance', subtitle: 'Alterner efforts intenses et récupération pour progresser plus vite.', blocks: [{ type: 'hero', tag: 'Intervalles', title: 'Le fractionné, accélérateur de performance', subtitle: 'Alterner efforts intenses et récupération pour progresser plus vite.' }] },
  { sport: 'velo', sessionType: 'tempo', title: 'Le tempo, repousser votre seuil', subtitle: 'Rouler au seuil pour habituer votre corps à maintenir un effort soutenu.', blocks: [{ type: 'hero', tag: 'Tempo', title: 'Le tempo, repousser votre seuil', subtitle: 'Rouler au seuil pour habituer votre corps à maintenir un effort soutenu.' }] },
  { sport: 'velo', sessionType: 'recovery', title: 'La sortie récup, indispensable et sous-estimée', subtitle: 'Pourquoi rouler doucement est aussi important que rouler fort.', blocks: [{ type: 'hero', tag: 'Récupération', title: 'La sortie récup, indispensable et sous-estimée', subtitle: 'Pourquoi rouler doucement est aussi important que rouler fort.' }] },
  { sport: 'velo', sessionType: 'climbing', title: 'Grimper plus fort, grimper mieux', subtitle: 'Techniques et entraînements pour progresser en montée.', blocks: [{ type: 'hero', tag: 'Côtes', title: 'Grimper plus fort, grimper mieux', subtitle: 'Techniques et entraînements pour progresser en montée.' }] },
  // RUNNING
  { sport: 'course', sessionType: 'endurance', title: 'Le footing long, la base de tout', subtitle: 'Courir lentement pour courir longtemps — et progresser.', blocks: [{ type: 'hero', tag: 'Endurance', title: 'Le footing long, la base de tout', subtitle: 'Courir lentement pour courir longtemps — et progresser.' }] },
  { sport: 'course', sessionType: 'intervals', title: 'Le fractionné en course à pied', subtitle: 'Des séries courtes et intenses pour gagner en vitesse.', blocks: [{ type: 'hero', tag: 'Intervalles', title: 'Le fractionné en course à pied', subtitle: 'Des séries courtes et intenses pour gagner en vitesse.' }] },
  { sport: 'course', sessionType: 'tempo', title: "L'allure tempo, votre vitesse de croisière", subtitle: 'Courir au seuil pour repousser vos limites en compétition.', blocks: [{ type: 'hero', tag: 'Tempo', title: "L'allure tempo, votre vitesse de croisière", subtitle: 'Courir au seuil pour repousser vos limites en compétition.' }] },
  { sport: 'course', sessionType: 'recovery', title: 'Le footing de récupération', subtitle: 'Courir sans forcer pour mieux assimiler les entraînements durs.', blocks: [{ type: 'hero', tag: 'Récupération', title: 'Le footing de récupération', subtitle: 'Courir sans forcer pour mieux assimiler les entraînements durs.' }] },
  { sport: 'course', sessionType: 'fartlek', title: 'Le fartlek, le jeu de vitesse', subtitle: 'Varier les allures au feeling pour le plaisir et la progression.', blocks: [{ type: 'hero', tag: 'Fartlek', title: 'Le fartlek, le jeu de vitesse', subtitle: 'Varier les allures au feeling pour le plaisir et la progression.' }] },
  // SWIMMING
  { sport: 'natation', sessionType: 'endurance', title: 'La nage longue, construire son aérobie', subtitle: 'Nager longtemps à allure régulière pour bâtir votre fond.', blocks: [{ type: 'hero', tag: 'Endurance', title: 'La nage longue, construire son aérobie', subtitle: 'Nager longtemps à allure régulière pour bâtir votre fond.' }] },
  { sport: 'natation', sessionType: 'intervals', title: 'Les séries fractionnées en piscine', subtitle: 'Des répétitions chronométrées pour gagner en vitesse.', blocks: [{ type: 'hero', tag: 'Intervalles', title: 'Les séries fractionnées en piscine', subtitle: 'Des répétitions chronométrées pour gagner en vitesse.' }] },
  { sport: 'natation', sessionType: 'technique', title: 'Les éducatifs, nager mieux avant de nager plus', subtitle: "Travailler sa technique pour être plus efficace dans l'eau.", blocks: [{ type: 'hero', tag: 'Technique', title: 'Les éducatifs, nager mieux avant de nager plus', subtitle: "Travailler sa technique pour être plus efficace dans l'eau." }] },
  { sport: 'natation', sessionType: 'recovery', title: 'La séance récup en natation', subtitle: "Nager doucement pour récupérer et détendre le corps dans l'eau.", blocks: [{ type: 'hero', tag: 'Récupération', title: 'La séance récup en natation', subtitle: "Nager doucement pour récupérer et détendre le corps dans l'eau." }] },
  { sport: 'natation', sessionType: 'mixed', title: 'La séance mixte, varier les plaisirs', subtitle: 'Combiner les nages et les objectifs dans une même séance.', blocks: [{ type: 'hero', tag: 'Mixte', title: 'La séance mixte, varier les plaisirs', subtitle: 'Combiner les nages et les objectifs dans une même séance.' }] },
  // WALKING
  { sport: 'marche', sessionType: 'walk', title: 'La balade, le sport le plus sous-estimé', subtitle: 'Marcher régulièrement transforme votre santé — sans forcer.', blocks: [{ type: 'hero', tag: 'Balade', title: 'La balade, le sport le plus sous-estimé', subtitle: 'Marcher régulièrement transforme votre santé — sans forcer.' }] },
  { sport: 'marche', sessionType: 'brisk', title: 'La marche rapide, du cardio sans courir', subtitle: 'Accélérer le pas pour un vrai travail cardiovasculaire.', blocks: [{ type: 'hero', tag: 'Marche rapide', title: 'La marche rapide, du cardio sans courir', subtitle: 'Accélérer le pas pour un vrai travail cardiovasculaire.' }] },
  { sport: 'marche', sessionType: 'hike', title: 'La randonnée, effort et évasion', subtitle: 'Longues distances et dénivelé pour un entraînement complet.', blocks: [{ type: 'hero', tag: 'Randonnée', title: 'La randonnée, effort et évasion', subtitle: 'Longues distances et dénivelé pour un entraînement complet.' }] },
  { sport: 'marche', sessionType: 'recovery', title: 'La marche de récupération', subtitle: 'Bouger doucement pour aider le corps à récupérer.', blocks: [{ type: 'hero', tag: 'Récupération', title: 'La marche de récupération', subtitle: 'Bouger doucement pour aider le corps à récupérer.' }] },
];

// EN content — mirrors FR structure
export const LIBRARY_ARTICLES_EN: LibraryArticle[] = [
  // CYCLING
  { sport: 'velo', sessionType: 'endurance', title: 'The long ride, foundation of your progress', subtitle: 'Understanding base endurance and why it should make up most of your training.', blocks: [{ type: 'hero', tag: 'Endurance', title: 'The long ride, foundation of your progress', subtitle: 'Understanding base endurance and why it should make up most of your training.' }] },
  { sport: 'velo', sessionType: 'intervals', title: 'Intervals, your performance accelerator', subtitle: 'Alternating hard efforts and recovery to progress faster.', blocks: [{ type: 'hero', tag: 'Intervals', title: 'Intervals, your performance accelerator', subtitle: 'Alternating hard efforts and recovery to progress faster.' }] },
  { sport: 'velo', sessionType: 'tempo', title: 'Tempo rides, pushing your threshold', subtitle: 'Riding at threshold to build sustained power.', blocks: [{ type: 'hero', tag: 'Tempo', title: 'Tempo rides, pushing your threshold', subtitle: 'Riding at threshold to build sustained power.' }] },
  { sport: 'velo', sessionType: 'recovery', title: 'Recovery rides, essential and underrated', subtitle: 'Why riding easy is just as important as riding hard.', blocks: [{ type: 'hero', tag: 'Recovery', title: 'Recovery rides, essential and underrated', subtitle: 'Why riding easy is just as important as riding hard.' }] },
  { sport: 'velo', sessionType: 'climbing', title: 'Climb stronger, climb smarter', subtitle: 'Techniques and workouts to improve on hills.', blocks: [{ type: 'hero', tag: 'Climbing', title: 'Climb stronger, climb smarter', subtitle: 'Techniques and workouts to improve on hills.' }] },
  // RUNNING
  { sport: 'course', sessionType: 'endurance', title: 'The long run, foundation of everything', subtitle: 'Run slow to run long — and get faster.', blocks: [{ type: 'hero', tag: 'Endurance', title: 'The long run, foundation of everything', subtitle: 'Run slow to run long — and get faster.' }] },
  { sport: 'course', sessionType: 'intervals', title: 'Running intervals', subtitle: 'Short, intense reps to build speed.', blocks: [{ type: 'hero', tag: 'Intervals', title: 'Running intervals', subtitle: 'Short, intense reps to build speed.' }] },
  { sport: 'course', sessionType: 'tempo', title: 'Tempo runs, your race pace builder', subtitle: 'Running at threshold to push your race limits.', blocks: [{ type: 'hero', tag: 'Tempo', title: 'Tempo runs, your race pace builder', subtitle: 'Running at threshold to push your race limits.' }] },
  { sport: 'course', sessionType: 'recovery', title: 'Recovery jogs', subtitle: 'Easy running to absorb hard workouts.', blocks: [{ type: 'hero', tag: 'Recovery', title: 'Recovery jogs', subtitle: 'Easy running to absorb hard workouts.' }] },
  { sport: 'course', sessionType: 'fartlek', title: 'Fartlek, the speed play', subtitle: 'Vary your pace by feel for fun and fitness.', blocks: [{ type: 'hero', tag: 'Fartlek', title: 'Fartlek, the speed play', subtitle: 'Vary your pace by feel for fun and fitness.' }] },
  // SWIMMING
  { sport: 'natation', sessionType: 'endurance', title: 'Endurance swimming, building your aerobic base', subtitle: 'Swim long at a steady pace to build your foundation.', blocks: [{ type: 'hero', tag: 'Endurance', title: 'Endurance swimming, building your aerobic base', subtitle: 'Swim long at a steady pace to build your foundation.' }] },
  { sport: 'natation', sessionType: 'intervals', title: 'Pool interval sets', subtitle: 'Timed reps to build speed in the water.', blocks: [{ type: 'hero', tag: 'Intervals', title: 'Pool interval sets', subtitle: 'Timed reps to build speed in the water.' }] },
  { sport: 'natation', sessionType: 'technique', title: 'Drills first, speed second', subtitle: 'Work on form to become more efficient in the water.', blocks: [{ type: 'hero', tag: 'Technique', title: 'Drills first, speed second', subtitle: 'Work on form to become more efficient in the water.' }] },
  { sport: 'natation', sessionType: 'recovery', title: 'Recovery swim sessions', subtitle: 'Easy laps to recover and loosen up in the water.', blocks: [{ type: 'hero', tag: 'Recovery', title: 'Recovery swim sessions', subtitle: 'Easy laps to recover and loosen up in the water.' }] },
  { sport: 'natation', sessionType: 'mixed', title: 'Mixed sessions, variety in the pool', subtitle: 'Combine strokes and goals in one workout.', blocks: [{ type: 'hero', tag: 'Mixed', title: 'Mixed sessions, variety in the pool', subtitle: 'Combine strokes and goals in one workout.' }] },
  // WALKING
  { sport: 'marche', sessionType: 'walk', title: 'Walking, the most underrated exercise', subtitle: 'Regular walking transforms your health — no strain needed.', blocks: [{ type: 'hero', tag: 'Walk', title: 'Walking, the most underrated exercise', subtitle: 'Regular walking transforms your health — no strain needed.' }] },
  { sport: 'marche', sessionType: 'brisk', title: 'Brisk walking, cardio without running', subtitle: 'Pick up the pace for a real cardiovascular workout.', blocks: [{ type: 'hero', tag: 'Brisk walk', title: 'Brisk walking, cardio without running', subtitle: 'Pick up the pace for a real cardiovascular workout.' }] },
  { sport: 'marche', sessionType: 'hike', title: 'Hiking, effort meets adventure', subtitle: 'Long distances and elevation for a complete workout.', blocks: [{ type: 'hero', tag: 'Hike', title: 'Hiking, effort meets adventure', subtitle: 'Long distances and elevation for a complete workout.' }] },
  { sport: 'marche', sessionType: 'recovery', title: 'Recovery walks', subtitle: 'Move gently to help your body recover.', blocks: [{ type: 'hero', tag: 'Recovery', title: 'Recovery walks', subtitle: 'Move gently to help your body recover.' }] },
];

export function getArticlesForSport(sport: string, locale: string): LibraryArticle[] {
  const articles = locale === 'en' ? LIBRARY_ARTICLES_EN : LIBRARY_ARTICLES_FR;
  return articles.filter((a) => a.sport === sport);
}

export function getArticle(sport: string, sessionType: string, locale: string): LibraryArticle | undefined {
  const articles = locale === 'en' ? LIBRARY_ARTICLES_EN : LIBRARY_ARTICLES_FR;
  return articles.find((a) => a.sport === sport && a.sessionType === sessionType);
}
```

- [ ] **Step 2: Create LibraryListPage component**

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getArticlesForSport } from '@/lib/library-content';
import { SESSION_TYPE_COLORS, WORKOUT_CONFIG } from '@/lib/data';
import type { WorkoutType } from '@/lib/data';

interface Props {
  sportType: WorkoutType;
}

export default function LibraryListPage({ sportType }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const articles = getArticlesForSport(sportType, locale);
  const sportRoute = WORKOUT_CONFIG[sportType].route;
  const sportName = t.librarySportNames[sportType] || sportType;

  return (
    <div className="page-container px-5 pb-36 lg:pb-20">
      <div className="pt-14 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <button
            type="button"
            onClick={() => router.push(sportRoute)}
            className="w-9 h-9 rounded-full bg-bg-card border border-border flex items-center justify-center text-text-muted text-sm"
          >
            ‹
          </button>
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-serif text-text">{t.libraryMenuLabel}</h1>
            <p className="text-[12px] text-text-muted capitalize">{sportName} — {t.librarySubtitle(articles.length)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {articles.map((article) => {
          const colors = SESSION_TYPE_COLORS[article.sessionType] || { text: '#8b8a94', bg: '#1a1b22' };
          return (
            <button
              key={article.sessionType}
              type="button"
              onClick={() => router.push(`${sportRoute}/library/${article.sessionType}`)}
              className="bg-bg-card border border-border rounded-2xl p-4 text-left transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md mb-2"
                    style={{ color: colors.text, backgroundColor: colors.bg }}
                  >
                    {t.sessionTypes[article.sessionType] || article.sessionType}
                  </span>
                  <div className="text-[15px] font-semibold text-text mb-1">{article.title}</div>
                  <div className="text-[12px] text-text-muted line-clamp-2">{article.subtitle}</div>
                </div>
                <span className="text-text-muted text-lg ml-3">›</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create thin wrapper pages**

`frontend/src/app/workout/cycling/library/page.tsx`:
```typescript
import LibraryListPage from '@/components/LibraryListPage';
export default function CyclingLibrary() {
  return <LibraryListPage sportType="velo" />;
}
```

`frontend/src/app/workout/running/library/page.tsx`:
```typescript
import LibraryListPage from '@/components/LibraryListPage';
export default function RunningLibrary() {
  return <LibraryListPage sportType="course" />;
}
```

`frontend/src/app/workout/swimming/library/page.tsx`:
```typescript
import LibraryListPage from '@/components/LibraryListPage';
export default function SwimmingLibrary() {
  return <LibraryListPage sportType="natation" />;
}
```

`frontend/src/app/workout/walking/library/page.tsx`:
```typescript
import LibraryListPage from '@/components/LibraryListPage';
export default function WalkingLibrary() {
  return <LibraryListPage sportType="marche" />;
}
```

- [ ] **Step 4: Type check + visual test**

Run: `cd frontend && npx tsc --noEmit`
Then navigate to `/workout/cycling/library` — should show 5 cards with colored tags.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/library-content.ts frontend/src/components/LibraryListPage.tsx frontend/src/app/workout/cycling/library/page.tsx frontend/src/app/workout/running/library/page.tsx frontend/src/app/workout/swimming/library/page.tsx frontend/src/app/workout/walking/library/page.tsx
git commit -m "feat: add library list pages for all cardio sports"
```

---

### Task 8: Article Renderer Component + Article Pages

**Files:**
- Create: `frontend/src/components/LibraryArticle.tsx` (block renderer with scroll animations)
- Create: `frontend/src/app/workout/cycling/library/[sessionType]/page.tsx`
- Create: `frontend/src/app/workout/running/library/[sessionType]/page.tsx`
- Create: `frontend/src/app/workout/swimming/library/[sessionType]/page.tsx`
- Create: `frontend/src/app/workout/walking/library/[sessionType]/page.tsx`

**Context:** This component uses the `frontend-design` skill for rich visual implementation. Each block type maps to a styled sub-component with scroll-triggered fade-in + slide-up animation via Intersection Observer. The article data comes from `library-content.ts`. The `[sessionType]` param is a dynamic segment within each sport's static folder.

- [ ] **Step 1: Create LibraryArticle.tsx**

This is the most design-intensive component. Use the `frontend-design` skill for implementation. The component takes `article: LibraryArticle`, `sportType: WorkoutType`, and renders each block with:

- **Scroll animation:** Each block wrapped in a div that uses Intersection Observer to add `opacity-100 translate-y-0` when visible (starts as `opacity-0 translate-y-4`). Use `useRef` + `useEffect` with `IntersectionObserver` (threshold 0.1).
- **Hero block:** Gradient background tinted with sport color, tag pill, serif title (28px), subtitle.
- **Big-numbers block:** Row of stat cards, large serif numbers in session type accent color.
- **Intro block:** Section title (16px bold) + body text (13px, `#c0bfc8`, line-height 1.7).
- **Benefits-grid block:** 2×2 grid of cards with emoji + title + description.
- **Caution block:** Yellow-tinted card with ⚠️ + bullet list.
- **Examples block:** Stacked cards with level tag (color-coded: green=beginner, yellow=intermediate, red=advanced), metrics row, description.
- **Tip block:** Left-bordered card with 💡 + text (no quotes).

Back button at top navigates to `/{sportRoute}/library`.

- [ ] **Step 2: Create article wrapper pages**

`frontend/src/app/workout/cycling/library/[sessionType]/page.tsx`:
```typescript
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getArticle } from '@/lib/library-content';
import LibraryArticleComponent from '@/components/LibraryArticle';

export default function CyclingArticle() {
  const { sessionType } = useParams<{ sessionType: string }>();
  const { locale } = useI18n();
  const router = useRouter();
  const article = getArticle('velo', sessionType, locale);

  if (!article) {
    router.replace('/workout/cycling/library');
    return null;
  }

  return <LibraryArticleComponent article={article} sportType="velo" />;
}
```

Same pattern for running (`course`), swimming (`natation`), walking (`marche`).

- [ ] **Step 3: Type check + visual test**

Run: `cd frontend && npx tsc --noEmit`
Navigate to `/workout/cycling/library/endurance` — should show hero block (stub). Once full content is added (Task 9), all blocks render.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/LibraryArticle.tsx frontend/src/app/workout/cycling/library/\[sessionType\]/page.tsx frontend/src/app/workout/running/library/\[sessionType\]/page.tsx frontend/src/app/workout/swimming/library/\[sessionType\]/page.tsx frontend/src/app/workout/walking/library/\[sessionType\]/page.tsx
git commit -m "feat: add article renderer and article pages for all sports"
```

---

### Task 9: Full Article Content (Cycling/Endurance reference)

**Files:**
- Modify: `frontend/src/lib/library-content.ts` (replace endurance stub with full content)

**Context:** This task adds the full block content for the cycling/endurance article as a reference. It uses all block types. Editorial guidelines: beginner-friendly tone, technical terms always explained in parentheses, 💡 tip block (no quotes), examples at beginner/intermediate/advanced levels.

- [ ] **Step 1: Replace cycling/endurance stubs with full content**

Replace the FR cycling/endurance entry in `LIBRARY_ARTICLES_FR` with full blocks:

```typescript
{
  sport: 'velo',
  sessionType: 'endurance',
  title: 'La sortie longue, pilier de votre progression',
  subtitle: "Comprendre l'endurance fondamentale et pourquoi elle devrait représenter la majorité de votre entraînement.",
  blocks: [
    { type: 'hero', tag: 'Endurance', title: 'La sortie longue, pilier de votre progression', subtitle: "Comprendre l'endurance fondamentale et pourquoi elle devrait représenter la majorité de votre entraînement." },
    { type: 'big-numbers', items: [
      { value: '80%', label: 'du volume' },
      { value: 'Z2', label: 'zone cible' },
      { value: '1h30+', label: 'durée idéale' },
    ]},
    { type: 'intro', title: "C'est quoi une sortie endurance ?", text: "L'endurance fondamentale, c'est rouler à une intensité où vous pouvez tenir une conversation. Votre cœur travaille en zone 2 (entre 60 et 75% de votre fréquence cardiaque maximale, c'est-à-dire le rythme où vous respirez un peu plus fort sans être essoufflé). C'est le rythme qui ne paie pas de mine mais qui construit toute votre base aérobie (la capacité de votre corps à utiliser l'oxygène pour produire de l'énergie)." },
    { type: 'benefits-grid', title: 'Pourquoi la faire ?', items: [
      { emoji: '❤️', title: 'Cœur plus fort', text: "Augmente le volume de sang pompé à chaque battement — votre cœur devient plus efficace" },
      { emoji: '🔥', title: 'Brûle les graisses', text: "À cette intensité, votre corps puise principalement dans les réserves de graisse" },
      { emoji: '🧠', title: 'Mental solide', text: "Apprend à gérer l'effort sur la durée et à rester régulier" },
      { emoji: '🩸', title: 'Meilleure circulation', text: "Développe les petits vaisseaux sanguins dans vos muscles (capillaires)" },
    ]},
    { type: 'caution', items: [
      "Ne partez pas trop vite — l'erreur la plus fréquente est de rouler trop fort et de passer en zone 3 sans s'en rendre compte",
      "Hydratez-vous régulièrement au-delà d'1h d'effort",
      "Emportez de quoi manger pour les sorties de plus de 2h (barres, gels, fruits secs)",
    ]},
    { type: 'examples', title: 'Exemples de séances', items: [
      { name: 'Sortie café', level: 'beginner', metrics: [{ label: 'Durée', value: '1h–1h30' }, { label: 'Distance', value: '25–40 km' }, { label: 'Intensité', value: 'Zone 2' }], description: "Roulez à allure conversation. Si vous ne pouvez plus parler, ralentissez. L'objectif est de finir frais, pas épuisé." },
      { name: 'Sortie longue du weekend', level: 'intermediate', metrics: [{ label: 'Durée', value: '2h30–3h' }, { label: 'Distance', value: '60–90 km' }, { label: 'Intensité', value: 'Zone 2' }], description: "La sortie qui construit votre fond. Emportez des barres et de l'eau. Mangez avant d'avoir faim, buvez avant d'avoir soif." },
      { name: 'Ultra endurance', level: 'advanced', metrics: [{ label: 'Durée', value: '4h+' }, { label: 'Distance', value: '100+ km' }, { label: 'Intensité', value: 'Zone 1-2' }], description: "Préparez votre nutrition à l'avance. Visez des ravitaillements toutes les 45 minutes. Le mental prend le relais après 3h." },
    ]},
    { type: 'tip', text: "L'endurance est la base invisible sur laquelle tout le reste se construit. Sans elle, les intervalles et le tempo ne donnent que des résultats temporaires." },
  ],
},
```

Do the same for the EN version.

- [ ] **Step 2: Visual test**

Navigate to `/workout/cycling/library/endurance` — should display full article with all block types: hero, big numbers, intro, benefits grid, caution, examples, tip.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/library-content.ts
git commit -m "feat: add full cycling/endurance article content"
```
