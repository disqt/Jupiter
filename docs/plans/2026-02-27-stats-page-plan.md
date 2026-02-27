# Stats Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full Stats page with Recharts graphs (medal progression, type distribution, distance breakdown) and summary cards, accessible from the Stats tab in BottomNav.

**Architecture:** New backend endpoints in `backend/src/routes/stats.ts` for medals history, distance by type, yearly stats, and strength volume. New frontend page at `frontend/src/app/stats/page.tsx` delegating to a `StatsPage` component. Recharts for all charts. Period selector (month/year toggle) filters all sections except medal progression (always full history).

**Tech Stack:** Recharts (new dependency), existing Express + pg backend, Next.js 14 App Router, Tailwind CSS, custom i18n system.

---

### Task 1: Install Recharts

**Files:**
- Modify: `frontend/package.json`

**Step 1: Install recharts**

Run: `cd frontend && npm install recharts`

**Step 2: Verify installation**

Run: `cd frontend && node -e "require('recharts'); console.log('OK')"`
Expected: `OK`

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add recharts dependency"
```

---

### Task 2: Backend — Medals History Endpoint

**Files:**
- Modify: `backend/src/routes/stats.ts` (add endpoint after line 113, before `export default router`)

**Step 1: Add medals-history endpoint**

Add this endpoint to `backend/src/routes/stats.ts` before the final `export default router`:

```typescript
// GET /api/stats/medals-history
router.get('/medals-history', async (req, res) => {
  try {
    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*)::int as workout_count,
          GREATEST(COUNT(*) - 2, 0)::int as medals
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
        ORDER BY week_start
      )
      SELECT
        to_char(week_start, 'YYYY-MM-DD') as week_start,
        workout_count,
        medals,
        SUM(medals) OVER (ORDER BY week_start)::int as cumulative
      FROM weekly_counts
    `, [req.userId]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Step 2: Test manually**

Run: `curl -H "Authorization: Bearer <token>" http://localhost:3001/api/stats/medals-history`
Expected: Array of `{ week_start, workout_count, medals, cumulative }` objects.

**Step 3: Commit**

```bash
git add backend/src/routes/stats.ts
git commit -m "feat(api): add medals-history endpoint with cumulative count"
```

---

### Task 3: Backend — Distance by Type Endpoint

**Files:**
- Modify: `backend/src/routes/stats.ts`

**Step 1: Add distance-by-type endpoint**

```typescript
// GET /api/stats/distance-by-type?month=YYYY-MM or ?year=YYYY
router.get('/distance-by-type', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month && !year) {
      return res.status(400).json({ error: 'month (YYYY-MM) or year (YYYY) query param required' });
    }

    let dateFilter: string;
    let groupBy: string;
    let groupLabel: string;
    let params: (string | number)[];

    if (month && typeof month === 'string') {
      dateFilter = `to_char(w.date, 'YYYY-MM') = $2`;
      // Group by week number within the month
      groupBy = `EXTRACT(WEEK FROM w.date::timestamp)`;
      groupLabel = `'W' || (ROW_NUMBER() OVER (ORDER BY MIN(w.date)))::text`;
      params = [req.userId!, month];
    } else if (year && typeof year === 'string') {
      dateFilter = `to_char(w.date, 'YYYY') = $2`;
      groupBy = `to_char(w.date, 'MM')`;
      groupLabel = `to_char(MIN(w.date), 'MM')`;
      params = [req.userId!, year];
    } else {
      return res.status(400).json({ error: 'Invalid params' });
    }

    const result = await pool.query(`
      WITH distances AS (
        SELECT
          w.type,
          w.date,
          COALESCE(cd.distance, wd.distance, 0) as distance
        FROM workouts w
        LEFT JOIN cycling_details cd ON cd.workout_id = w.id
        LEFT JOIN workout_details wd ON wd.workout_id = w.id
        WHERE w.user_id = $1 AND ${dateFilter}
      )
      SELECT
        ${month ? `EXTRACT(WEEK FROM date::timestamp)::int as period_num,` : `to_char(date, 'MM') as period_num,`}
        type,
        ROUND(SUM(distance)::numeric, 1)::float as distance
      FROM distances
      WHERE distance > 0
      GROUP BY period_num, type
      ORDER BY period_num, type
    `, params);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Step 2: Test manually**

Run: `curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/stats/distance-by-type?month=2026-02"`
Expected: Array of `{ period_num, type, distance }` objects.

**Step 3: Commit**

```bash
git add backend/src/routes/stats.ts
git commit -m "feat(api): add distance-by-type endpoint with month/year grouping"
```

---

### Task 4: Backend — Extend Monthly Stats for Year + Strength Volume

**Files:**
- Modify: `backend/src/routes/stats.ts`

**Step 1: Extend the existing `/monthly` endpoint to accept `?year=YYYY` as alternative**

Modify the existing `/monthly` handler to also accept a `year` query param. When `year` is provided instead of `month`, use `to_char(date, 'YYYY') = $1` filter instead. Keep backward compatibility with existing `month` param.

Replace the existing monthly handler with:

```typescript
// GET /api/stats/monthly?month=YYYY-MM or ?year=YYYY
router.get('/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month && !year) {
      return res.status(400).json({ error: 'month (YYYY-MM) or year (YYYY) query param required' });
    }

    const dateFormat = month ? 'YYYY-MM' : 'YYYY';
    const dateValue = (month || year) as string;

    // Counts by type
    const countsResult = await pool.query(
      `SELECT type, COUNT(*)::text as count
       FROM workouts
       WHERE to_char(date, $3) = $1 AND user_id = $2
       GROUP BY type`,
      [dateValue, req.userId, dateFormat]
    );
    const counts_by_type: Record<string, string> = {};
    for (const row of countsResult.rows) {
      counts_by_type[row.type] = row.count;
    }

    // Aggregates
    const aggResult = await pool.query(
      `SELECT
        COUNT(*)::text AS total_count,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::text AS total_distance_km,
        COALESCE(SUM(COALESCE(cd.elevation, wd.elevation)), 0)::text AS total_elevation_m,
        COUNT(DISTINCT w.date)::text AS active_days
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, $3) = $1
         AND w.user_id = $2`,
      [dateValue, req.userId, dateFormat]
    );

    res.json({ ...aggResult.rows[0], counts_by_type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Step 2: Add strength-volume endpoint**

```typescript
// GET /api/stats/strength-volume?month=YYYY-MM or ?year=YYYY
router.get('/strength-volume', async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month && !year) {
      return res.status(400).json({ error: 'month (YYYY-MM) or year (YYYY) query param required' });
    }

    const dateFormat = month ? 'YYYY-MM' : 'YYYY';
    const dateValue = (month || year) as string;

    const result = await pool.query(`
      SELECT
        COALESCE(SUM(el.reps * el.weight), 0)::float AS total_tonnage,
        COUNT(DISTINCT el.exercise_id)::int AS exercise_count,
        COUNT(*)::int AS total_sets
      FROM exercise_logs el
      JOIN workouts w ON w.id = el.workout_id
      WHERE w.user_id = $1
        AND to_char(w.date, $3) = $2
        AND w.type = 'musculation'
    `, [req.userId, dateValue, dateFormat]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Step 3: Commit**

```bash
git add backend/src/routes/stats.ts
git commit -m "feat(api): extend monthly stats for year filter, add strength-volume endpoint"
```

---

### Task 5: Frontend — API Client Functions

**Files:**
- Modify: `frontend/src/lib/api.ts` (add interfaces + fetch functions at end of Stats section, after line 266)

**Step 1: Add new interfaces and fetch functions**

Append after the existing `fetchWeeklyMedals` function:

```typescript
export interface MedalHistory {
  week_start: string;
  workout_count: number;
  medals: number;
  cumulative: number;
}

export async function fetchMedalsHistory(): Promise<MedalHistory[]> {
  return request<MedalHistory[]>('/api/stats/medals-history');
}

export interface DistanceByType {
  period_num: number | string;
  type: string;
  distance: number;
}

export async function fetchDistanceByType(params: { month?: string; year?: string }): Promise<DistanceByType[]> {
  const query = params.month ? `month=${params.month}` : `year=${params.year}`;
  return request<DistanceByType[]>(`/api/stats/distance-by-type?${query}`);
}

export interface StrengthVolume {
  total_tonnage: number;
  exercise_count: number;
  total_sets: number;
}

export async function fetchStrengthVolume(params: { month?: string; year?: string }): Promise<StrengthVolume> {
  const query = params.month ? `month=${params.month}` : `year=${params.year}`;
  return request<StrengthVolume>(`/api/stats/strength-volume?${query}`);
}

// Extended: fetchMonthlyStats can also accept year
export async function fetchYearlyStats(year: string): Promise<MonthlyStats> {
  return request<MonthlyStats>(`/api/stats/monthly?year=${year}`);
}
```

**Step 2: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: add API client functions for stats endpoints"
```

---

### Task 6: Frontend — i18n Strings

**Files:**
- Modify: `frontend/src/lib/i18n.tsx`

**Step 1: Add new i18n keys for Stats page**

Add these keys to the FR translations (after the existing `monthlyMedals` key around line 92):

```typescript
    // Stats page
    statsTitle: 'Statistiques',
    month: 'Mois',
    year: 'Année',
    activeDays: 'Jours actifs',
    medalProgression: 'Progression des médailles',
    medalProgressionTooltip: (week: string, medals: number, total: number) =>
      `Sem. du ${week} : ${medals} médaille${medals > 1 ? 's' : ''} (total : ${total})`,
    typeDistribution: 'Répartition par sport',
    distanceBySport: 'Distance par sport',
    allSports: 'Tous',
    week: 'Sem.',
    strengthVolume: 'Volume musculation',
    totalTonnage: 'Tonnage total',
    totalExercises: 'Exercices',
    totalSets: 'Séries',
    noData: 'Aucune donnée',
    kg: 'kg',
    km: 'km',
    m: 'm',
```

Add corresponding EN translations:

```typescript
    statsTitle: 'Statistics',
    month: 'Month',
    year: 'Year',
    activeDays: 'Active days',
    medalProgression: 'Medal progression',
    medalProgressionTooltip: (week: string, medals: number, total: number) =>
      `Week of ${week}: ${medals} medal${medals > 1 ? 's' : ''} (total: ${total})`,
    typeDistribution: 'Workout distribution',
    distanceBySport: 'Distance by sport',
    allSports: 'All',
    week: 'Wk.',
    strengthVolume: 'Strength volume',
    totalTonnage: 'Total tonnage',
    totalExercises: 'Exercises',
    totalSets: 'Sets',
    noData: 'No data',
    kg: 'kg',
    km: 'km',
    m: 'm',
```

**Step 2: Commit**

```bash
git add frontend/src/lib/i18n.tsx
git commit -m "feat(i18n): add Stats page translation keys FR/EN"
```

---

### Task 7: Frontend — Enable Stats Tab in BottomNav

**Files:**
- Modify: `frontend/src/components/BottomNav.tsx` (line 19)

**Step 1: Remove disabled flag**

Change line 19 from:
```typescript
    { href: '/stats', label: t.stats, icon: '📊', disabled: true },
```
to:
```typescript
    { href: '/stats', label: t.stats, icon: '📊' },
```

**Step 2: Commit**

```bash
git add frontend/src/components/BottomNav.tsx
git commit -m "feat: enable Stats tab in navigation"
```

---

### Task 8: Frontend — Stats Page + StatsPage Component

This is the main task. Create the Stats page wrapper and the full StatsPage component.

**Files:**
- Create: `frontend/src/app/stats/page.tsx`
- Create: `frontend/src/components/StatsPage.tsx`

**Step 1: Create the page wrapper**

`frontend/src/app/stats/page.tsx`:

```typescript
'use client';

import StatsPage from '@/components/StatsPage';

export default function Stats() {
  return <StatsPage />;
}
```

**Step 2: Create the StatsPage component**

`frontend/src/components/StatsPage.tsx`:

This component contains:
1. **Period selector** — `mode` state ('month' | 'year'), `currentMonth` (Date), navigation arrows
2. **Summary cards** — horizontal scroll row with 4 stat cards (sessions, distance, elevation, active days)
3. **Medal progression** — Recharts AreaChart, always full history, accent purple gradient
4. **Type distribution** — Recharts PieChart donut, filtered by period
5. **Distance by sport** — Recharts BarChart, stacked, filter chips, filtered by period
6. **Strength volume** — Conditional card with tonnage/exercises/sets

Data fetching:
- On period change: fetch `monthlyStats` (or `yearlyStats`), `distanceByType`, `strengthVolume`
- On mount (once): fetch `medalsHistory`
- Parse all string numbers from API

State:
```typescript
const [mode, setMode] = useState<'month' | 'year'>('month');
const [currentMonth, setCurrentMonth] = useState(new Date());
const [stats, setStats] = useState<{ totalCount: number; countsByType: Record<string, number>; totalDistanceKm: number; totalElevationM: number; activeDays: number } | null>(null);
const [medalsHistory, setMedalsHistory] = useState<MedalHistory[]>([]);
const [distanceData, setDistanceData] = useState<DistanceByType[]>([]);
const [strengthData, setStrengthData] = useState<StrengthVolume | null>(null);
const [sportFilter, setSportFilter] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
```

Key implementation details:
- **Period selector**: Same month navigation as Calendar (`< Month Year >` with arrow buttons). Year mode shows `< 2026 >`. Toggle between month/year with pill buttons styled `bg-bg-elevated` active, `bg-bg-card` inactive.
- **Summary cards**: `flex overflow-x-auto gap-3` container, each card `min-w-[140px] bg-bg-card rounded-card p-4`.
- **Medal chart**: `AreaChart` with `ResponsiveContainer` (width 100%, height 200). `<defs><linearGradient>` for fill gradient from `#a78bfa` opacity 0.3 → 0. `<Area>` with `stroke="#a78bfa"` strokeWidth 2.
- **Pie chart**: `PieChart` with `<Pie>` innerRadius={50} outerRadius={80} for donut. Each `<Cell>` uses sport color from WORKOUT_CONFIG mapping. Center label via custom `<text>` element.
- **Bar chart**: Transform `distanceByType` data into format `{ period: 'W1', velo: 5.2, course: 3.1, ... }`. `<Bar>` per sport type, stacked. Filter chips use sport colors.
- **Sport color mapping**: Import WORKOUT_CONFIG from data.ts. Map: `{ velo: '#3b9eff', musculation: '#ff8a3b', course: '#34d399', natation: '#06b6d4', marche: '#f59e0b', custom: '#a78bfa' }`.
- **Recharts theming**: Set `tick={{ fill: '#8b8a94', fontSize: 11 }}` on axes. `cartesianGrid={{ stroke: '#2a2b32' }}`. Dark-compatible tooltips with `contentStyle={{ backgroundColor: '#1a1b1f', border: '1px solid #2a2b32', borderRadius: 10 }}`.

**Step 3: Verify page loads**

Run: Navigate to `http://localhost:3000/stats` in browser.
Expected: Stats page renders with all sections.

**Step 4: Commit**

```bash
git add frontend/src/app/stats/page.tsx frontend/src/components/StatsPage.tsx
git commit -m "feat: add Stats page with charts and summary cards"
```

---

### Task 9: Update CLAUDE.md and rules

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.claude/rules/api.md`

**Step 1: Update CLAUDE.md**

- Add `/stats` to Pages list
- Update API Endpoints if needed
- Mention Recharts dependency

**Step 2: Update api.md**

Add new endpoints to the protected endpoints list:
- `GET /api/stats/medals-history` — cumulative medal progression
- `GET /api/stats/distance-by-type?month=YYYY-MM` or `?year=YYYY` — distance by sport
- `GET /api/stats/strength-volume?month=YYYY-MM` or `?year=YYYY` — tonnage, exercises, sets
- Note: `GET /api/stats/monthly` now also accepts `?year=YYYY`

Add new API client functions to the functions list:
- `fetchMedalsHistory()`, `fetchDistanceByType(params)`, `fetchStrengthVolume(params)`, `fetchYearlyStats(year)`

**Step 3: Commit**

```bash
git add CLAUDE.md .claude/rules/api.md
git commit -m "docs: update CLAUDE.md and api rules for stats page"
```
