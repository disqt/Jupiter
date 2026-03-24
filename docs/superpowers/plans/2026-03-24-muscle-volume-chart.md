# Muscle Volume Bar Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bar chart to the Stats page showing sets or reps per muscle group, visible only when strength workouts exist in the selected period.

**Architecture:** New API endpoint (`/api/stats/muscle-volume`) aggregates exercise_logs by muscle group. New `MuscleVolumeChart` component renders a Recharts BarChart with a sets/reps toggle. Integrates into existing StatsPage fetch flow via `Promise.all`.

**Tech Stack:** Next.js API Route Handler, PostgreSQL (pg pool), Recharts, custom i18n

---

### Task 1: API Endpoint — `/api/stats/muscle-volume`

**Files:**
- Create: `frontend/src/app/api/stats/muscle-volume/route.ts`

**Context:** Follow the exact same pattern as `frontend/src/app/api/stats/strength-volume/route.ts` — same imports, same month/year param parsing with Zod, same auth. The SQL joins `workouts → exercise_logs → exercises` and groups by `exercises.muscle_group`.

- [ ] **Step 1: Create the route handler**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';
import { monthParamSchema, yearParamSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    let dateFormat: string;
    let dateValue: string;

    if (month) {
      const parsed = monthParamSchema.safeParse({ month });
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid month format (YYYY-MM)' }, { status: 400 });
      }
      dateFormat = 'YYYY-MM';
      dateValue = month;
    } else if (year) {
      const parsed = yearParamSchema.safeParse({ year });
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid year format (YYYY)' }, { status: 400 });
      }
      dateFormat = 'YYYY';
      dateValue = year;
    } else {
      return NextResponse.json({ error: 'month (YYYY-MM) or year (YYYY) query param required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT
        e.muscle_group,
        COUNT(*)::int as sets,
        COALESCE(SUM(el.reps), 0)::int as reps
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       JOIN exercises e ON e.id = el.exercise_id
       WHERE w.type = 'musculation'
         AND to_char(w.date, $1) = $2
         AND w.user_id = $3
       GROUP BY e.muscle_group
       HAVING COUNT(*) > 0
       ORDER BY e.muscle_group`,
      [dateFormat, dateValue, userId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
```

- [ ] **Step 2: Verify manually**

Run: `npm run dev` (if not running), then `curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/stats/muscle-volume?month=2026-03"`
Expected: JSON array of `{ muscle_group, sets, reps }` objects or empty array `[]`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/api/stats/muscle-volume/route.ts
git commit -m "feat: add /api/stats/muscle-volume endpoint"
```

---

### Task 2: API Client + i18n Keys

**Files:**
- Modify: `frontend/src/lib/api.ts` (add interface + fetch function, after `fetchStrengthVolume` ~line 335)
- Modify: `frontend/src/lib/i18n.tsx` (add new keys)

**Context:** Follow `fetchStrengthVolume` pattern exactly for the API client. For i18n, add keys in both FR and EN sections.

- [ ] **Step 1: Add MuscleVolume interface and fetch function to api.ts**

After the `fetchStrengthVolume` function (~line 335), add:

```typescript
export interface MuscleVolume {
  muscle_group: string;
  sets: number;
  reps: number;
}

export async function fetchMuscleVolume(params: { month?: string; year?: string }): Promise<MuscleVolume[]> {
  const query = params.month ? `month=${params.month}` : `year=${params.year}`;
  return request<MuscleVolume[]>(`/api/stats/muscle-volume?${query}`);
}
```

- [ ] **Step 2: Add i18n keys**

In the FR translations object, add:
```typescript
statsMuscleVolume: 'Volume par muscle',
statsSets: 'Séries',
statsReps: 'Reps',
statsMuscleSessions: (n: number) => `${n} séance${n > 1 ? 's' : ''} de musculation`,
muscleGroupsShort: {
  Pectoraux: 'Pecs', Dos: 'Dos', 'Épaules': 'Épaules', Biceps: 'Biceps',
  Triceps: 'Triceps', Abdominaux: 'Abdos', Quadriceps: 'Quads',
  Ischios: 'Ischios', Fessiers: 'Fessiers', Mollets: 'Mollets', 'Avant-bras': 'Av-bras',
} as Record<string, string>,
```

In the EN translations object, add:
```typescript
statsMuscleVolume: 'Volume per muscle',
statsSets: 'Sets',
statsReps: 'Reps',
statsMuscleSessions: (n: number) => `${n} strength session${n > 1 ? 's' : ''}`,
muscleGroupsShort: {
  Pectoraux: 'Chest', Dos: 'Back', 'Épaules': 'Shoulders', Biceps: 'Biceps',
  Triceps: 'Triceps', Abdominaux: 'Abs', Quadriceps: 'Quads',
  Ischios: 'Hams', Fessiers: 'Glutes', Mollets: 'Calves', 'Avant-bras': 'Forearms',
} as Record<string, string>,
```

Also add `muscleGroupsShort` to the TypeScript type for the translations (wherever the translation shape is defined).

- [ ] **Step 3: Type check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/lib/i18n.tsx
git commit -m "feat: add muscle volume API client and i18n keys"
```

---

### Task 3: MuscleVolumeChart Component

**Files:**
- Create: `frontend/src/components/MuscleVolumeChart.tsx`

**Context:** This is a standalone Recharts bar chart component. It receives data as props (no fetching). Uses Recharts `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer` — all already imported in the project. Uses i18n for labels. The toggle is a local state switching between `sets` and `reps` dataKey.

Reference for chart styling: `frontend/src/components/StatsPage.tsx` lines 36-54 (SPORT_COLORS, TOOLTIP_CONTENT_STYLE, AXIS_TICK_STYLE constants).

**Canonical muscle group order** (upper body → lower body → extremities):
`Pectoraux, Dos, Épaules, Biceps, Triceps, Abdominaux, Quadriceps, Ischios, Fessiers, Mollets, Avant-bras`

- [ ] **Step 1: Create the component**

```typescript
'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useI18n } from '@/lib/i18n';
import type { MuscleVolume } from '@/lib/api';

const MUSCLE_ORDER = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps',
  'Abdominaux', 'Quadriceps', 'Ischios', 'Fessiers', 'Mollets', 'Avant-bras',
];

const TOOLTIP_CONTENT_STYLE = {
  backgroundColor: '#1a1b1f',
  border: '1px solid #2a2b32',
  borderRadius: 10,
  color: '#f0eff4',
};

interface Props {
  data: MuscleVolume[];
  sessionCount: number;
  periodLabel: string;
}

export default function MuscleVolumeChart({ data, sessionCount, periodLabel }: Props) {
  const { t } = useI18n();
  const [mode, setMode] = useState<'sets' | 'reps'>('sets');

  // Sort data in canonical order, filling missing groups
  const sortedData = MUSCLE_ORDER
    .map((mg) => {
      const found = data.find((d) => d.muscle_group === mg);
      return { muscle_group: mg, sets: found?.sets ?? 0, reps: found?.reps ?? 0 };
    })
    .filter((d) => d.sets > 0 || data.length <= 4); // show all if few groups, otherwise only non-zero

  // Actually: only show groups that have data
  const chartData = MUSCLE_ORDER
    .map((mg) => {
      const found = data.find((d) => d.muscle_group === mg);
      return found ? { ...found } : null;
    })
    .filter(Boolean) as MuscleVolume[];

  const modeLabel = mode === 'sets' ? t.statsSets : t.statsReps;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-secondary">{t.statsMuscleVolume}</h2>
        <div className="flex bg-bg-elevated rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setMode('sets')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              mode === 'sets' ? 'bg-[#ff8a3b] text-white' : 'text-text-muted'
            }`}
          >
            {t.statsSets}
          </button>
          <button
            onClick={() => setMode('reps')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              mode === 'reps' ? 'bg-[#ff8a3b] text-white' : 'text-text-muted'
            }`}
          >
            {t.statsReps}
          </button>
        </div>
      </div>
      <div className="bg-bg-card rounded-card p-3 border border-border min-w-0">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2b32" vertical={false} />
            <XAxis
              dataKey="muscle_group"
              tick={{ fill: '#8b8a94', fontSize: 10 }}
              tickFormatter={(val: string) => t.muscleGroupsShort[val] || val}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: '#8b8a94', fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              labelStyle={{ color: '#8b8a94' }}
              labelFormatter={(val: string) => t.muscleGroups[val] || val}
              formatter={(value: number) => [value, modeLabel]}
              cursor={{ fill: 'rgba(255,138,59,0.1)' }}
            />
            <Bar dataKey={mode} fill="#ff8a3b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-text-muted text-center mt-1">
          {periodLabel} — {t.statsMuscleSessions(sessionCount)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type check**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/MuscleVolumeChart.tsx
git commit -m "feat: add MuscleVolumeChart component"
```

---

### Task 4: Integrate into StatsPage

**Files:**
- Modify: `frontend/src/components/StatsPage.tsx`

**Context:** Add `fetchMuscleVolume` to the existing `Promise.all` in `loadPeriodData` (~line 134). Add state for the data. Render `MuscleVolumeChart` right after the strength volume cards section (~line 732, after the closing `</div>` of Section 6). For guest mode, show behind `BlurredOverlay` with a placeholder div (same pattern as other chart sections ~line 430-460).

- [ ] **Step 1: Add import**

At the top of StatsPage.tsx, add to the api import line:
```typescript
import { ..., fetchMuscleVolume, type MuscleVolume } from '@/lib/api';
```

And add the component import:
```typescript
import MuscleVolumeChart from '@/components/MuscleVolumeChart';
```

- [ ] **Step 2: Add state**

After the `strengthData` state (~line 95), add:
```typescript
const [muscleVolumeData, setMuscleVolumeData] = useState<MuscleVolume[]>([]);
```

- [ ] **Step 3: Add to Promise.all fetch**

In `loadPeriodData` (~line 134), change:
```typescript
const [statsData, distData, strData] = await Promise.all([
```
to:
```typescript
const [statsData, distData, strData, muscVolData] = await Promise.all([
  mode === 'month' ? fetchMonthlyStats(monthStr) : fetchYearlyStats(yearStr),
  fetchDistanceByType(params),
  fetchStrengthVolume(params),
  fetchMuscleVolume(params),
]);
```

After `setStrengthData(strData);` add:
```typescript
setMuscleVolumeData(muscVolData);
```

- [ ] **Step 4: Compute period label**

Add a `periodLabel` memo or inline computation. The existing code already has `monthStr` and `yearStr`. Build the label:
```typescript
const periodLabel = useMemo(() => {
  if (mode === 'month') {
    const d = new Date(currentMonth);
    return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' });
  }
  return yearStr;
}, [mode, currentMonth, yearStr, locale]);
```

- [ ] **Step 5: Render chart after strength volume section**

After the Section 6 closing `</div>` (~line 732), add:
```tsx
{/* Section 7: Muscle Volume Chart */}
{muscleVolumeData.length > 0 && (
  <MuscleVolumeChart
    data={muscleVolumeData}
    sessionCount={stats.countsByType['musculation'] || 0}
    periodLabel={periodLabel}
  />
)}
```

- [ ] **Step 6: Add guest mode placeholder**

In the guest mode section (where other charts have `BlurredOverlay`), add a placeholder for this chart too — same pattern as the other blurred chart sections. Look for the existing `BlurredOverlay` blocks around lines 430-460 and add one more:
```tsx
<BlurredOverlay message={t.createAccountToSeeStats}>
  <div className="h-[280px]" />
</BlurredOverlay>
```

- [ ] **Step 7: Type check and test visually**

Run: `cd frontend && npx tsc --noEmit`
Then open `http://localhost:3000/stats` in the browser (logged in, with muscu data in current month).
Expected: Bar chart appears below strength volume cards showing muscle groups.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/StatsPage.tsx
git commit -m "feat: integrate muscle volume chart into stats page"
```
