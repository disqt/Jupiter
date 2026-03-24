# Muscle Volume Bar Chart — Design Spec

## Goal

Add a bar chart to the Stats page showing sets (or reps, via toggle) per muscle group for the selected period. Only visible when strength workouts exist in that period.

## Architecture

New API endpoint returns aggregated sets/reps per muscle group. A new `MuscleVolumeChart` React component renders a Recharts `<BarChart>` with a Séries/Reps toggle. The component slots into `StatsPage.tsx` after the existing strength volume cards.

## API

### `GET /api/stats/muscle-volume`

**Query params:** `month=YYYY-MM` OR `year=YYYY` (same pattern as other stats endpoints)

**Auth:** JWT required (same middleware as other stats endpoints)

**Response:**
```json
[
  { "muscle_group": "Pectoraux", "sets": 24, "reps": 192 },
  { "muscle_group": "Dos", "sets": 28, "reps": 224 },
  ...
]
```

**SQL logic:**
- Join `workouts` → `exercise_logs` → `exercises` (on `exercise_id`)
- Filter by `workouts.type = 'musculation'` AND user_id AND date within period
- Group by `exercises.muscle_group`
- `sets` = `COUNT(*)` of exercise_log rows (each row = one set)
- `reps` = `SUM(exercise_logs.reps)`
- Only return groups with `sets > 0`

**Guest mode:** Not supported — chart hidden behind `BlurredOverlay` like other charts.

## Component: `MuscleVolumeChart`

**File:** `frontend/src/components/MuscleVolumeChart.tsx`

**Props:**
```typescript
interface MuscleVolumeChartProps {
  data: { muscle_group: string; sets: number; reps: number }[];
  sessionCount: number; // number of muscu sessions in period
  periodLabel: string;  // e.g. "Janvier 2026" or "2026"
}
```

**Behavior:**
- Local state: `mode: 'sets' | 'reps'` (default `'sets'`)
- Toggle styled like the existing month/year toggle (pill buttons, active = `#ff8a3b` orange muscu — intentionally sport-colored, not gold accent)
- Recharts `<BarChart>` with `<ResponsiveContainer>` (100% width, 220px height)
- `<Bar dataKey={mode}` with fill `#ff8a3b`, radius `[4,4,0,0]`
- `<XAxis dataKey="muscle_group">` with abbreviated labels (same short names as body selector: Pecs, Dos, Épaules, Biceps, Triceps, Abdos, Quads, Ischios, Fessiers, Mollets, Av-bras)
- `<YAxis>` with gray tick labels
- `<Tooltip>` with dark background, showing full muscle name + value (e.g. "Dos — 28 séries")
- `<CartesianGrid strokeDasharray="3 3" stroke="#2a2b32">`
- Subtitle below chart: `"{periodLabel} — {sessionCount} séances de musculation"` (i18n)
- X-axis labels: `angle={-45}` or vertical if needed to fit 11 groups on mobile

**i18n keys:**
- `statsMuscleVolume`: "Volume par muscle" / "Volume per muscle"
- `statsSets`: "Séries" / "Sets"
- `statsReps`: "Reps" / "Reps"
- `statsMuscleSessions(n, period)`: "{n} séances de musculation" / "{n} strength sessions"
- Tooltip uses `t.muscleGroups[dbValue]` for full names, short labels are a local mapping

**Abbreviation mapping** (i18n, for X-axis only — added to `t.muscleGroupsShort`):

| DB value | FR short | EN short |
|----------|----------|----------|
| Pectoraux | Pecs | Chest |
| Dos | Dos | Back |
| Épaules | Épaules | Shoulders |
| Biceps | Biceps | Biceps |
| Triceps | Triceps | Triceps |
| Abdominaux | Abdos | Abs |
| Quadriceps | Quads | Quads |
| Ischios | Ischios | Hams |
| Fessiers | Fessiers | Glutes |
| Mollets | Mollets | Calves |
| Avant-bras | Av-bras | Forearms |

**Bar sort order:** Fixed canonical order matching the table above (upper body → lower body → extremities). Same order regardless of values, so the chart is consistent across periods.

## Integration in StatsPage.tsx

1. Add `muscleVolumeData` state (`{ muscle_group, sets, reps }[]`, default `[]`)
2. Fetch from `/api/stats/muscle-volume?month=...` or `?year=...` alongside existing fetches
3. Count muscu sessions from existing `stats.countsByType['musculation']` (already available)
4. Render `<MuscleVolumeChart>` after the strength volume cards section, only if `muscleVolumeData.length > 0`
5. Guest mode: show behind `BlurredOverlay` with placeholder div (same pattern as other charts)

## API client (api.ts)

```typescript
interface MuscleVolume {
  muscle_group: string;
  sets: number;
  reps: number;
}

async function fetchMuscleVolume(params: { month: string } | { year: string }): Promise<MuscleVolume[]>
```

Same pattern as existing `fetchMonthlyStats` / `fetchDistanceByType` — caller passes `{ month: '2026-01' }` or `{ year: '2026' }`.

**Zod validation:** Reuse the existing month/year query param validation pattern from other stats endpoints (check `validations.ts`).

## Styling

- Bar color: `#ff8a3b` (orange muscu) with gradient to `#cc6e2f`
- Grid: `#2a2b32` dashed (matches existing charts)
- Axis text: `#8b8a94`
- Tooltip: dark bg `#1a1a1f`, border `#2a2b32`, white text
- Card wrapper: same `bg-bg-card rounded-2xl p-4` as other chart sections
- Section title: same `text-[15px] font-semibold text-text` as other section titles

## Out of scope

- Guest mode muscle volume (no API, blurred overlay only)
- Filtering by specific muscles
- Comparison between periods
- Tonnage per muscle (only sets and reps)
