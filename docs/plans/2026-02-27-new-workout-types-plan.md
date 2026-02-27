# New Workout Types Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add running, swimming, and custom workout types with customizable emoji and name for all workout types.

**Architecture:** Extend the existing per-type page pattern (each type gets its own route/form). Abstract all type-specific logic (colors, emojis, labels, routes) into a shared config lookup table. Add `workout_details` table for new types while keeping existing `cycling_details` and `exercise_logs` unchanged. Add `custom_emoji` and `custom_name` columns to `workouts`.

**Tech Stack:** PostgreSQL (Supabase), Express.js 5, Drizzle ORM + raw SQL, Next.js 14, Tailwind CSS, React

---

### Task 1: Database Migration — New columns + table

**Files:**
- Modify: `backend/src/schema.ts`
- Create migration via: `cd backend && npm run db:generate && npm run db:migrate`

**Step 1: Add columns and table to schema.ts**

Add to `workouts` table (after line 15 in `backend/src/schema.ts`):
```typescript
customEmoji: varchar('custom_emoji', { length: 10 }),
customName: varchar('custom_name', { length: 100 }),
```

Add new table after `cyclingDetails` (after line 26):
```typescript
export const workoutDetails = pgTable('workout_details', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  duration: integer('duration'),
  distance: decimal('distance', { precision: 10, scale: 2 }),
  elevation: integer('elevation'),
  laps: integer('laps'),
});
```

**Step 2: Generate and apply migration**

Run: `cd backend && npm run db:generate`
Run: `cd backend && npm run db:migrate`

**Step 3: Verify**

Run: `cd backend && npx tsc --noEmit`

**Step 4: Commit**

```
feat: add workout_details table and custom_emoji/custom_name columns
```

---

### Task 2: Backend — Update workout routes for new types

**Files:**
- Modify: `backend/src/routes/workouts.ts`

**Step 1: Update GET /api/workouts (list)**

Replace the query at lines 13-23 to also LEFT JOIN `workout_details` and return `custom_emoji`, `custom_name`:

```sql
SELECT w.*,
  cd.duration, cd.distance, cd.elevation, cd.ride_type,
  wd.duration as wd_duration, wd.distance as wd_distance, wd.elevation as wd_elevation, wd.laps as wd_laps,
  (SELECT COUNT(DISTINCT el.exercise_id) FROM exercise_logs el WHERE el.workout_id = w.id) as exercise_count
FROM workouts w
LEFT JOIN cycling_details cd ON cd.workout_id = w.id
LEFT JOIN workout_details wd ON wd.workout_id = w.id
WHERE to_char(w.date, 'YYYY-MM') = $1
  AND w.user_id = $2
ORDER BY w.date, w.created_at
```

**Step 2: Update GET /api/workouts/:id**

At line 44, change the `if/else` to handle new types. After the `velo` branch and the `musculation` branch, add:

```typescript
} else if (['course', 'natation', 'custom'].includes(workout.type)) {
  const detailsResult = await pool.query(
    'SELECT * FROM workout_details WHERE workout_id = $1',
    [id]
  );
  workout.workout_details = detailsResult.rows[0] || null;
}
```

**Step 3: Update POST /api/workouts**

At line 74, also destructure `workout_details, custom_emoji, custom_name` from req.body.

Update the INSERT (line 77) to include custom_emoji and custom_name:
```sql
INSERT INTO workouts (date, type, notes, user_id, custom_emoji, custom_name)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
```

After the `musculation` block (line 99), add:
```typescript
if (['course', 'natation', 'custom'].includes(type) && workout_details) {
  const { duration, distance, elevation, laps } = workout_details;
  await client.query(
    `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
     VALUES ($1, $2, $3, $4, $5)`,
    [workout.id, duration || null, distance || null, elevation || null, laps || null]
  );
}
```

**Step 4: Update PUT /api/workouts/:id**

Same pattern: destructure `workout_details, custom_emoji, custom_name`. Update the UPDATE query to set custom_emoji and custom_name. After the existing cleanup/insert blocks, add:

```typescript
await client.query('DELETE FROM workout_details WHERE workout_id = $1', [id]);
if (['course', 'natation', 'custom'].includes(type) && workout_details) {
  const { duration, distance, elevation, laps } = workout_details;
  await client.query(
    `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, duration || null, distance || null, elevation || null, laps || null]
  );
}
```

**Step 5: Verify**

Run: `cd backend && npx tsc --noEmit`

**Step 6: Commit**

```
feat: backend support for new workout types + custom emoji/name
```

---

### Task 3: Backend — Restructure stats API

**Files:**
- Modify: `backend/src/routes/stats.ts` (lines 14-26)

**Step 1: Update monthly stats query**

Replace the query to return `total_count` and `counts_by_type` as JSON:

```sql
SELECT
  COUNT(*) AS total_count,
  json_object_agg(COALESCE(w.type, 'unknown'), type_count) AS counts_by_type,
  COALESCE(SUM(CASE WHEN cd.distance IS NOT NULL THEN cd.distance ELSE wd.distance END), 0) AS total_distance_km,
  COALESCE(SUM(CASE WHEN cd.elevation IS NOT NULL THEN cd.elevation ELSE wd.elevation END), 0) AS total_elevation_m,
  COUNT(DISTINCT w.date) AS active_days
FROM workouts w
LEFT JOIN cycling_details cd ON cd.workout_id = w.id
LEFT JOIN workout_details wd ON wd.workout_id = w.id
LEFT JOIN LATERAL (
  SELECT w2.type, COUNT(*) as type_count
  FROM workouts w2
  WHERE to_char(w2.date, 'YYYY-MM') = $1 AND w2.user_id = $2
  GROUP BY w2.type
) tc ON tc.type = w.type
WHERE to_char(w.date, 'YYYY-MM') = $1
  AND w.user_id = $2
```

Actually, simpler approach — use two queries:

```typescript
// Counts by type
const countsResult = await pool.query(
  `SELECT type, COUNT(*)::text as count
   FROM workouts
   WHERE to_char(date, 'YYYY-MM') = $1 AND user_id = $2
   GROUP BY type`,
  [month, req.userId]
);
const counts_by_type: Record<string, string> = {};
for (const row of countsResult.rows) {
  counts_by_type[row.type] = row.count;
}

// Aggregates (distance + elevation from both cycling_details and workout_details)
const aggResult = await pool.query(
  `SELECT
    COUNT(*) AS total_count,
    COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0) AS total_distance_km,
    COALESCE(SUM(COALESCE(cd.elevation, wd.elevation)), 0) AS total_elevation_m,
    COUNT(DISTINCT w.date) AS active_days
   FROM workouts w
   LEFT JOIN cycling_details cd ON cd.workout_id = w.id
   LEFT JOIN workout_details wd ON wd.workout_id = w.id
   WHERE to_char(w.date, 'YYYY-MM') = $1
     AND w.user_id = $2`,
  [month, req.userId]
);

res.json({ ...aggResult.rows[0], counts_by_type });
```

**Step 2: Verify**

Run: `cd backend && npx tsc --noEmit`

**Step 3: Commit**

```
feat: restructure monthly stats to support N workout types
```

---

### Task 4: Frontend — Workout type config + update TypeScript types

**Files:**
- Modify: `frontend/src/lib/data.ts`
- Modify: `frontend/src/lib/api.ts`

**Step 1: Add workout type config to data.ts**

Add to `frontend/src/lib/data.ts`:

```typescript
export type WorkoutType = 'velo' | 'musculation' | 'course' | 'natation' | 'custom';

export const WORKOUT_TYPES: WorkoutType[] = ['velo', 'musculation', 'course', 'natation', 'custom'];

export const WORKOUT_CONFIG: Record<WorkoutType, {
  defaultEmoji: string;
  color: string;
  colorSoft: string;
  route: string;
}> = {
  velo: { defaultEmoji: '🚴', color: 'cycling', colorSoft: 'cycling-soft', route: '/workout/cycling' },
  musculation: { defaultEmoji: '🏋️', color: 'strength', colorSoft: 'strength-soft', route: '/workout/strength' },
  course: { defaultEmoji: '🏃', color: 'running', colorSoft: 'running-soft', route: '/workout/running' },
  natation: { defaultEmoji: '🏊', color: 'swimming', colorSoft: 'swimming-soft', route: '/workout/swimming' },
  custom: { defaultEmoji: '🎯', color: 'custom-workout', colorSoft: 'custom-workout-soft', route: '/workout/custom' },
};

export const SPORT_EMOJIS = [
  '🚴', '🏃', '🏊', '🏋️', '🧘', '🤸', '🎯',
  '⚽', '🏀', '🎾', '🏓', '🥊', '🏈', '🏐',
  '⛷️', '🏄', '🧗', '🤾', '🏌️', '🚣', '⛸️',
  '💪', '🔥', '⚡', '🏆', '❤️', '🌟', '🎯',
  '🥋', '🤺', '🏇', '🛹',
];
```

**Step 2: Update TypeScript types in api.ts**

In `frontend/src/lib/api.ts`, update the type unions:

Replace `type: 'velo' | 'musculation'` with `type: WorkoutType` (import from data.ts). This appears in:
- `ApiWorkout` interface (line 36)
- `Workout` interface (line 51)
- `createWorkout` param (line 116)
- `updateWorkout` param (line 129)

Add to `ApiWorkout` interface:
```typescript
custom_emoji: string | null;
custom_name: string | null;
// workout_details fields (for course/natation/custom)
wd_duration: number | null;
wd_distance: string | null;
wd_elevation: number | null;
wd_laps: number | null;
```

Add to `Workout` interface:
```typescript
customEmoji?: string;
customName?: string;
laps?: number;
```

Update `toWorkout()` function to handle new types:
```typescript
function toWorkout(raw: ApiWorkout): Workout {
  const distance = raw.distance ? parseFloat(raw.distance) : (raw.wd_distance ? parseFloat(raw.wd_distance) : undefined);
  const elevation = raw.elevation ?? raw.wd_elevation ?? undefined;
  const rideType = raw.ride_type ?? undefined;
  const duration = raw.duration ?? raw.wd_duration ?? undefined;
  const exerciseCount = parseInt(raw.exercise_count) || 0;
  const laps = raw.wd_laps ?? undefined;

  let detail = '';
  if (raw.type === 'velo') {
    const parts: string[] = [];
    if (distance) parts.push(`${distance} km`);
    if (rideType) parts.push(rideType);
    if (elevation) parts.push(`${elevation}m D+`);
    detail = parts.join(' — ') || 'Vélo';
  } else if (raw.type === 'musculation') {
    detail = exerciseCount > 0
      ? `${exerciseCount} exercice${exerciseCount > 1 ? 's' : ''}`
      : 'Musculation';
  } else if (raw.type === 'course') {
    const parts: string[] = [];
    if (duration) parts.push(`${duration} min`);
    if (distance) parts.push(`${distance} km`);
    detail = parts.join(' — ') || 'Course';
  } else if (raw.type === 'natation') {
    const parts: string[] = [];
    if (duration) parts.push(`${duration} min`);
    if (laps) parts.push(`${laps} longueurs`);
    detail = parts.join(' — ') || 'Natation';
  } else {
    const parts: string[] = [];
    if (duration) parts.push(`${duration} min`);
    if (distance) parts.push(`${distance} km`);
    if (elevation) parts.push(`${elevation}m D+`);
    detail = parts.join(' — ') || raw.custom_name || 'Custom';
  }

  return {
    id: raw.id,
    date: parseDate(raw.date),
    type: raw.type,
    detail,
    notes: raw.notes ?? undefined,
    duration,
    distance,
    elevation,
    rideType,
    exerciseCount,
    laps,
    customEmoji: raw.custom_emoji ?? undefined,
    customName: raw.custom_name ?? undefined,
  };
}
```

Update `MonthlyStats` interface:
```typescript
export interface MonthlyStats {
  total_count: string;
  counts_by_type: Record<string, string>;
  total_distance_km: string;
  total_elevation_m: string;
  active_days: string;
}
```

Update `createWorkout` and `updateWorkout` params to accept:
```typescript
workout_details?: { duration?: number; distance?: number; elevation?: number; laps?: number };
custom_emoji?: string;
custom_name?: string;
```

**Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit`

**Step 4: Commit**

```
feat: frontend type config and API types for new workout types
```

---

### Task 5: Tailwind — Add new type colors

**Files:**
- Modify: `frontend/tailwind.config.ts` (after line 33)

**Step 1: Add color definitions**

Add after `strength` colors:
```typescript
running: {
  DEFAULT: '#34d399',
  glow: 'rgba(52, 211, 153, 0.15)',
  soft: '#142a22',
},
swimming: {
  DEFAULT: '#06b6d4',
  glow: 'rgba(6, 182, 212, 0.15)',
  soft: '#0c2a30',
},
'custom-workout': {
  DEFAULT: '#a78bfa',
  glow: 'rgba(167, 139, 250, 0.15)',
  soft: '#1f1a2e',
},
```

**Step 2: Commit**

```
feat: add Tailwind colors for running, swimming, custom workout types
```

---

### Task 6: i18n — Add translations for new types

**Files:**
- Modify: `frontend/src/lib/i18n.tsx`

**Step 1: Add FR translations**

Add after `strengthTag` (line 37):
```typescript
running: 'Course à pied',
swimming: 'Natation',
customWorkout: 'Personnalisé',
runningTag: '🏃 Course',
swimmingTag: '🏊 Natation',
customTag: '🎯 Perso',
// New form labels
laps: 'Longueurs',
lapsPlaceholder: 'ex: 40',
addField: '+ Ajouter un champ',
removeField: 'Retirer',
chooseEmoji: 'Choisir un emoji',
editName: 'Modifier le nom',
workoutName: 'Nom de la séance',
runningWorkout: 'Course à pied',
swimmingWorkout: 'Natation',
customWorkoutTitle: 'Séance personnalisée',
// Stats
totalSessions: 'Séances totales',
// Workout type labels (for config lookup)
workoutTypeLabels: {
  velo: 'Vélo',
  musculation: 'Musculation',
  course: 'Course à pied',
  natation: 'Natation',
  custom: 'Personnalisé',
} as Record<string, string>,
workoutTypeTags: {
  velo: '🚴 Vélo',
  musculation: '🏋️ Muscu',
  course: '🏃 Course',
  natation: '🏊 Natation',
  custom: '🎯 Perso',
} as Record<string, string>,
```

**Step 2: Add EN translations**

Same keys with English values:
```typescript
running: 'Running',
swimming: 'Swimming',
customWorkout: 'Custom',
runningTag: '🏃 Running',
swimmingTag: '🏊 Swimming',
customTag: '🎯 Custom',
laps: 'Laps',
lapsPlaceholder: 'e.g. 40',
addField: '+ Add a field',
removeField: 'Remove',
chooseEmoji: 'Choose an emoji',
editName: 'Edit name',
workoutName: 'Workout name',
runningWorkout: 'Running workout',
swimmingWorkout: 'Swimming workout',
customWorkoutTitle: 'Custom workout',
totalSessions: 'Total sessions',
workoutTypeLabels: {
  velo: 'Cycling',
  musculation: 'Strength',
  course: 'Running',
  natation: 'Swimming',
  custom: 'Custom',
} as Record<string, string>,
workoutTypeTags: {
  velo: '🚴 Cycling',
  musculation: '🏋️ Strength',
  course: '🏃 Running',
  natation: '🏊 Swimming',
  custom: '🎯 Custom',
} as Record<string, string>,
```

**Step 3: Commit**

```
feat: add i18n translations for new workout types
```

---

### Task 7: Emoji Picker + Name Editor components

**Files:**
- Create: `frontend/src/components/EmojiPicker.tsx`
- Create: `frontend/src/components/NameEditor.tsx`

**Step 1: Create EmojiPicker component**

A bottom-sheet/modal with curated emoji grid. Props: `isOpen`, `onClose`, `onSelect(emoji: string)`, `currentEmoji`.

Pattern: Same as existing modals in the codebase (overlay + centered card + animate-fadeIn).

Uses `SPORT_EMOJIS` from `data.ts`.

**Step 2: Create NameEditor component**

A modal with a text input. Props: `isOpen`, `onClose`, `onSave(name: string)`, `currentName`, `defaultName`.

Pre-fills the input with `currentName || defaultName`. Save button confirms.

**Step 3: Commit**

```
feat: add EmojiPicker and NameEditor components
```

---

### Task 8: Shared WorkoutFormHeader component

**Files:**
- Create: `frontend/src/components/WorkoutFormHeader.tsx`

**Step 1: Create shared header**

Extracts the common header pattern from cycling/strength pages. Props:
- `emoji: string` — current emoji (custom or default)
- `name: string` — current name (custom or default)
- `defaultName: string` — translated default name
- `onEmojiChange: (emoji: string) => void`
- `onNameChange: (name: string) => void`
- `onBack: () => void`
- `dateDisplay: string`
- `hasDraft?: boolean`

Renders:
- Back button
- Emoji button (clickable, opens EmojiPicker)
- Title with pen icon (clickable, opens NameEditor)
- Date display
- Draft indicator

**Step 2: Commit**

```
feat: add shared WorkoutFormHeader component
```

---

### Task 9: Create Running workout page

**Files:**
- Create: `frontend/src/app/workout/running/page.tsx`

**Step 1: Create the page**

Follow the same pattern as cycling page but simpler:
- Fields: duration (smart text input with parseDuration/formatDuration), distance (km)
- Uses `WorkoutFormHeader` with emoji/name customization
- Payload: `{ date, type: 'course', workout_details: { duration, distance }, custom_emoji, custom_name }`
- Same localStorage draft pattern: `running-draft-${date}` / `running-edit-${workoutId}`
- Same SaveAnimation redirect pattern

**Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
feat: add running workout page
```

---

### Task 10: Create Swimming workout page

**Files:**
- Create: `frontend/src/app/workout/swimming/page.tsx`

**Step 1: Create the page**

Same pattern as running:
- Fields: duration (smart text input), laps (optional, number input)
- Payload: `{ date, type: 'natation', workout_details: { duration, laps }, custom_emoji, custom_name }`
- Draft keys: `swimming-draft-${date}` / `swimming-edit-${workoutId}`

**Step 2: Verify + Commit**

```
feat: add swimming workout page
```

---

### Task 11: Create Custom workout page

**Files:**
- Create: `frontend/src/app/workout/custom/page.tsx`

**Step 1: Create the page**

Duration is required. "Add field" button at bottom opens a small picker to toggle optional fields:
- distance (km)
- elevation (m)

State: `activeFields: Set<'distance' | 'elevation'>`. Toggle adds/removes from set and shows/hides the input.

Payload: `{ date, type: 'custom', workout_details: { duration, distance?, elevation? }, custom_emoji, custom_name }`

Draft keys: `custom-draft-${date}` / `custom-edit-${workoutId}`

**Step 2: Verify + Commit**

```
feat: add custom workout page
```

---

### Task 12: Update existing Cycling + Strength pages with WorkoutFormHeader

**Files:**
- Modify: `frontend/src/app/workout/cycling/page.tsx`
- Modify: `frontend/src/app/workout/strength/page.tsx`

**Step 1: Add emoji/name state and WorkoutFormHeader**

Both pages need:
- `const [customEmoji, setCustomEmoji] = useState<string>('')`
- `const [customName, setCustomName] = useState<string>('')`
- Replace existing header with `<WorkoutFormHeader>`
- Include `custom_emoji` and `custom_name` in create/update payloads
- Load custom_emoji/custom_name from API when editing existing workout

**Step 2: Verify + Commit**

```
feat: add emoji/name customization to cycling and strength pages
```

---

### Task 13: Update Calendar component

**Files:**
- Modify: `frontend/src/components/Calendar.tsx`

**Step 1: Replace hardcoded type logic with config lookup**

Import `WORKOUT_CONFIG, WorkoutType` from `data.ts`.

Replace lines 224-233 (hasVelo/hasMuscu/hasBoth logic):
```typescript
const typeSet = new Set(dayWorkouts.map(w => w.type));
const bgClass = dayWorkouts.length > 0
  ? (typeSet.size > 1
    ? 'bg-gradient-to-br from-cycling-soft to-strength-soft'
    : `bg-${WORKOUT_CONFIG[dayWorkouts[0].type as WorkoutType]?.colorSoft || 'bg-card'}`)
  : '';
```

Note: Since Tailwind can't do dynamic class names, use a helper:
```typescript
function getTypeBgClass(type: string): string {
  const map: Record<string, string> = {
    velo: 'bg-cycling-soft',
    musculation: 'bg-strength-soft',
    course: 'bg-running-soft',
    natation: 'bg-swimming-soft',
    custom: 'bg-custom-workout-soft',
  };
  return map[type] || '';
}

function getTypeTagClass(type: string): string {
  const map: Record<string, string> = {
    velo: 'bg-cycling/20 text-cycling',
    musculation: 'bg-strength/20 text-strength',
    course: 'bg-running/20 text-running',
    natation: 'bg-swimming/20 text-swimming',
    custom: 'bg-custom-workout/20 text-custom-workout',
  };
  return map[type] || '';
}
```

**Step 2: Update emoji display (lines 257-258)**

Replace hardcoded emoji:
```typescript
<span className="lg:hidden">{w.customEmoji || WORKOUT_CONFIG[w.type as WorkoutType]?.defaultEmoji || '🎯'}</span>
<span className="hidden lg:inline">{t.workoutTypeTags[w.type] || w.type}</span>
```

**Step 3: Update day panel workout links (lines 302-317)**

Replace hardcoded routing:
```typescript
const config = WORKOUT_CONFIG[w.type as WorkoutType];
const href = config
  ? `${config.route}?date=${selectedDate}&id=${w.id}`
  : `/workout/custom?date=${selectedDate}&id=${w.id}`;
```

Replace hardcoded labels:
```typescript
<div className="text-sm font-medium">{w.customName || t.workoutTypeLabels[w.type] || w.type}</div>
```

Replace hardcoded emoji in day panel:
```typescript
{w.customEmoji || config?.defaultEmoji || '🎯'}
```

**Step 4: Update bottom sheet (lines 370-382)**

Replace 2 hardcoded links with a map over `WORKOUT_TYPES`:
```typescript
<div className="grid grid-cols-2 gap-3">
  {WORKOUT_TYPES.map((type) => {
    const config = WORKOUT_CONFIG[type];
    return (
      <Link key={type} href={`${config.route}?date=${selectedDate}`}
        onClick={() => setShowSheet(false)}
        className={`py-5 px-4 rounded-card border-[1.5px] border-${config.colorSoft} bg-bg text-center no-underline transition-all duration-200 active:scale-[0.96] hover:bg-${config.colorSoft} hover:border-${config.color} block`}>
        <div className="text-[28px] mb-2">{config.defaultEmoji}</div>
        <div className="text-sm font-semibold text-text">{t.workoutTypeLabels[type]}</div>
      </Link>
    );
  })}
</div>
```

Note: Dynamic Tailwind classes won't work. Use inline styles or a class map:
```typescript
const borderSoftMap: Record<string, string> = {
  velo: 'border-cycling-soft',
  musculation: 'border-strength-soft',
  course: 'border-running-soft',
  natation: 'border-swimming-soft',
  custom: 'border-custom-workout-soft',
};
// etc.
```

**Step 5: Update monthly stats display (lines 335-350)**

Replace the hardcoded 4-stat grid with the new structure:
- Total sessions card (using total_count)
- Row of type counts with emojis
- Distance + elevation cards

Update `loadData` to use the new `MonthlyStats` shape.

**Step 6: Verify + Commit**

```
feat: update calendar for N workout types with config lookup
```

---

### Task 14: Integration testing

**Step 1: Test new workout creation for each type**

Manually test:
1. Create a running workout → verify it saves and appears in calendar
2. Create a swimming workout → verify laps display
3. Create a custom workout → add distance field → verify save
4. Change emoji on a cycling workout → verify it persists
5. Change name on a strength workout → verify it shows in calendar

**Step 2: Test stats**

Verify monthly stats show correct counts per type.

**Step 3: Test edit flow**

Edit an existing running/swimming/custom workout → verify draft persistence + data loading.

**Step 4: Verify TypeScript**

Run: `cd frontend && npx tsc --noEmit`
Run: `cd backend && npx tsc --noEmit`

**Step 5: Final commit**

```
feat: new workout types — running, swimming, custom + emoji/name customization
```
