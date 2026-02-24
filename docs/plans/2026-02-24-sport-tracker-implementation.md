# Sport Tracker — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first workout tracker (cycling + weight training) with calendar view, session logging, and exercise library.

**Architecture:** Monorepo with separate frontend (Next.js) and backend (Express.js) apps. PostgreSQL database. Frontend calls backend REST API on port 3001. Backend handles all DB operations via raw SQL (pg driver, no ORM for simplicity).

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, TypeScript, Express.js, PostgreSQL, pg (node-postgres)

---

## Task 1: Project scaffolding & repo init

**Files:**
- Create: `package.json` (root)
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `frontend/` (via create-next-app)
- Create: `database/init.sql`
- Create: `.gitignore`

**Step 1: Initialize root repo**

```bash
cd /Users/sylvainmerle/Documents/Sport
git init
```

**Step 2: Create root package.json**

```json
{
  "name": "sport-tracker",
  "private": true,
  "scripts": {
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

**Step 3: Scaffold backend**

```bash
mkdir -p backend/src
cd backend
npm init -y
npm install express cors pg dotenv
npm install -D typescript @types/express @types/cors @types/pg @types/node ts-node-dev
```

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

Create `backend/src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

Add to `backend/package.json` scripts:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**Step 4: Scaffold frontend**

```bash
cd /Users/sylvainmerle/Documents/Sport
npx create-next-app@14 frontend --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

**Step 5: Create database init script**

Create `database/init.sql`:
```sql
CREATE TABLE IF NOT EXISTS workouts (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('musculation', 'velo')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cycling_details (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    duration INTEGER,
    distance DECIMAL(6,2),
    elevation INTEGER,
    ride_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS exercise_logs (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL(6,2) NOT NULL
);

-- Seed: default exercises
INSERT INTO exercises (name, muscle_group) VALUES
    ('Développé couché', 'Pectoraux'),
    ('Squat', 'Jambes'),
    ('Soulevé de terre', 'Dos'),
    ('Développé militaire', 'Épaules'),
    ('Curl biceps', 'Biceps'),
    ('Extension triceps', 'Triceps'),
    ('Rowing barre', 'Dos'),
    ('Leg press', 'Jambes'),
    ('Crunch', 'Abdominaux'),
    ('Tractions', 'Dos')
ON CONFLICT DO NOTHING;
```

**Step 6: Create .gitignore**

```
node_modules/
dist/
.next/
.env
*.local
```

**Step 7: Create backend .env file**

Create `backend/.env`:
```
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sport_tracker
```

**Step 8: Install root deps and verify**

```bash
cd /Users/sylvainmerle/Documents/Sport
npm install
```

**Step 9: Create PostgreSQL database and run init script**

```bash
createdb sport_tracker
psql sport_tracker < database/init.sql
```

**Step 10: Verify backend starts**

```bash
cd backend && npm run dev
# Expected: "Backend running on http://localhost:3001"
# Test: curl http://localhost:3001/api/health → {"status":"ok"}
```

**Step 11: Verify frontend starts**

```bash
cd frontend && npm run dev
# Expected: Next.js dev server on http://localhost:3000
```

**Step 12: Commit**

```bash
git add -A
git commit -m "feat: initial project scaffolding with Next.js, Express, and PostgreSQL schema"
```

---

## Task 2: Backend — Database connection & Workouts CRUD

**Files:**
- Create: `backend/src/db.ts`
- Create: `backend/src/routes/workouts.ts`
- Modify: `backend/src/index.ts`

**Step 1: Create DB connection module**

Create `backend/src/db.ts`:
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
```

**Step 2: Create workouts routes**

Create `backend/src/routes/workouts.ts`:
```typescript
import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/workouts?month=YYYY-MM
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    }
    const result = await pool.query(
      `SELECT w.*,
        cd.duration, cd.distance, cd.elevation, cd.ride_type
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       WHERE to_char(w.date, 'YYYY-MM') = $1
       ORDER BY w.date, w.created_at`,
      [month]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/workouts/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workoutResult = await pool.query('SELECT * FROM workouts WHERE id = $1', [id]);
    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    const workout = workoutResult.rows[0];

    if (workout.type === 'velo') {
      const cyclingResult = await pool.query(
        'SELECT * FROM cycling_details WHERE workout_id = $1',
        [id]
      );
      workout.cycling_details = cyclingResult.rows[0] || null;
    } else {
      const logsResult = await pool.query(
        `SELECT el.*, e.name as exercise_name, e.muscle_group
         FROM exercise_logs el
         JOIN exercises e ON e.id = el.exercise_id
         WHERE el.workout_id = $1
         ORDER BY el.exercise_id, el.set_number`,
        [id]
      );
      workout.exercise_logs = logsResult.rows;
    }

    res.json(workout);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/workouts
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { date, type, notes, cycling_details, exercise_logs } = req.body;

    const workoutResult = await client.query(
      'INSERT INTO workouts (date, type, notes) VALUES ($1, $2, $3) RETURNING *',
      [date, type, notes || null]
    );
    const workout = workoutResult.rows[0];

    if (type === 'velo' && cycling_details) {
      const { duration, distance, elevation, ride_type } = cycling_details;
      await client.query(
        `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [workout.id, duration, distance, elevation, ride_type]
      );
    }

    if (type === 'musculation' && exercise_logs) {
      for (const log of exercise_logs) {
        await client.query(
          `INSERT INTO exercise_logs (workout_id, exercise_id, set_number, reps, weight)
           VALUES ($1, $2, $3, $4, $5)`,
          [workout.id, log.exercise_id, log.set_number, log.reps, log.weight]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(workout);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/workouts/:id
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { date, type, notes, cycling_details, exercise_logs } = req.body;

    const workoutResult = await client.query(
      'UPDATE workouts SET date = $1, type = $2, notes = $3 WHERE id = $4 RETURNING *',
      [date, type, notes || null, id]
    );
    if (workoutResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Replace cycling details
    await client.query('DELETE FROM cycling_details WHERE workout_id = $1', [id]);
    if (type === 'velo' && cycling_details) {
      const { duration, distance, elevation, ride_type } = cycling_details;
      await client.query(
        `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, duration, distance, elevation, ride_type]
      );
    }

    // Replace exercise logs
    await client.query('DELETE FROM exercise_logs WHERE workout_id = $1', [id]);
    if (type === 'musculation' && exercise_logs) {
      for (const log of exercise_logs) {
        await client.query(
          `INSERT INTO exercise_logs (workout_id, exercise_id, set_number, reps, weight)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, log.exercise_id, log.set_number, log.reps, log.weight]
        );
      }
    }

    await client.query('COMMIT');
    res.json(workoutResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM workouts WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 3: Register routes in index.ts**

Modify `backend/src/index.ts` to add:
```typescript
import workoutRoutes from './routes/workouts';
// ... after app.use(express.json());
app.use('/api/workouts', workoutRoutes);
```

**Step 4: Test manually**

```bash
# Create a cycling workout
curl -X POST http://localhost:3001/api/workouts \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-02-24","type":"velo","cycling_details":{"duration":60,"distance":30,"elevation":500,"ride_type":"route"}}'

# Get workouts for Feb 2026
curl "http://localhost:3001/api/workouts?month=2026-02"
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add database connection and workouts CRUD routes"
```

---

## Task 3: Backend — Exercises CRUD & Last Performance

**Files:**
- Create: `backend/src/routes/exercises.ts`
- Modify: `backend/src/index.ts`

**Step 1: Create exercises routes**

Create `backend/src/routes/exercises.ts`:
```typescript
import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/exercises
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exercises ORDER BY muscle_group, name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/exercises
router.post('/', async (req, res) => {
  try {
    const { name, muscle_group } = req.body;
    const result = await pool.query(
      'INSERT INTO exercises (name, muscle_group) VALUES ($1, $2) RETURNING *',
      [name, muscle_group]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/exercises/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, muscle_group } = req.body;
    const result = await pool.query(
      'UPDATE exercises SET name = $1, muscle_group = $2 WHERE id = $3 RETURNING *',
      [name, muscle_group, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/exercises/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM exercises WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json({ message: 'Exercise deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exercises/:id/last-performance
router.get('/:id/last-performance', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT el.set_number, el.reps, el.weight, w.date
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE el.exercise_id = $1
       AND w.date = (
         SELECT MAX(w2.date) FROM workouts w2
         JOIN exercise_logs el2 ON el2.workout_id = w2.id
         WHERE el2.exercise_id = $1
       )
       ORDER BY el.set_number`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 2: Register in index.ts**

Add to `backend/src/index.ts`:
```typescript
import exerciseRoutes from './routes/exercises';
app.use('/api/exercises', exerciseRoutes);
```

**Step 3: Test manually**

```bash
# List exercises (should show seeded data)
curl http://localhost:3001/api/exercises

# Create a new exercise
curl -X POST http://localhost:3001/api/exercises \
  -H "Content-Type: application/json" \
  -d '{"name":"Hip Thrust","muscle_group":"Fessiers"}'
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add exercises CRUD and last-performance endpoint"
```

---

## Task 4: Backend — Monthly stats endpoint

**Files:**
- Create: `backend/src/routes/stats.ts`
- Modify: `backend/src/index.ts`

**Step 1: Create stats route**

Create `backend/src/routes/stats.ts`:
```typescript
import { Router } from 'express';
import pool from '../db';

const router = Router();

// GET /api/stats/monthly?month=YYYY-MM
router.get('/monthly', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month || typeof month !== 'string') {
      return res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    }

    const result = await pool.query(
      `SELECT
        COUNT(*) FILTER (WHERE w.type = 'velo') AS cycling_count,
        COUNT(*) FILTER (WHERE w.type = 'musculation') AS strength_count,
        COALESCE(SUM(cd.distance), 0) AS total_distance_km,
        COALESCE(SUM(cd.elevation), 0) AS total_elevation_m,
        COUNT(DISTINCT w.date) AS active_days
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       WHERE to_char(w.date, 'YYYY-MM') = $1`,
      [month]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 2: Register in index.ts**

Add to `backend/src/index.ts`:
```typescript
import statsRoutes from './routes/stats';
app.use('/api/stats', statsRoutes);
```

**Step 3: Test manually**

```bash
curl "http://localhost:3001/api/stats/monthly?month=2026-02"
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add monthly stats endpoint"
```

---

## Task 5: Frontend — Layout, navigation bar & API client

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/globals.css`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/components/BottomNav.tsx`
- Modify: `frontend/src/app/page.tsx`

**Step 1: Set up API client**

Create `frontend/src/lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Workouts
  getWorkouts: (month: string) => fetchApi<any[]>(`/api/workouts?month=${month}`),
  getWorkout: (id: number) => fetchApi<any>(`/api/workouts/${id}`),
  createWorkout: (data: any) => fetchApi<any>('/api/workouts', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkout: (id: number, data: any) => fetchApi<any>(`/api/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkout: (id: number) => fetchApi<any>(`/api/workouts/${id}`, { method: 'DELETE' }),

  // Exercises
  getExercises: () => fetchApi<any[]>('/api/exercises'),
  createExercise: (data: any) => fetchApi<any>('/api/exercises', { method: 'POST', body: JSON.stringify(data) }),
  getLastPerformance: (exerciseId: number) => fetchApi<any[]>(`/api/exercises/${exerciseId}/last-performance`),

  // Stats
  getMonthlyStats: (month: string) => fetchApi<any>(`/api/stats/monthly?month=${month}`),
};
```

**Step 2: Create BottomNav component**

Create `frontend/src/components/BottomNav.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
      <Link
        href="/"
        className={`flex-1 py-3 text-center text-sm font-medium ${
          pathname === '/' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        Calendrier
      </Link>
      <div className="flex-1 py-3 text-center text-sm font-medium text-gray-300 cursor-not-allowed">
        Stats
      </div>
    </nav>
  );
}
```

**Step 3: Update layout.tsx**

Replace `frontend/src/app/layout.tsx`:
```tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sport Tracker',
  description: 'Track your workouts',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 pb-16`}>
        <main className="max-w-md mx-auto">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
```

**Step 4: Clean up page.tsx**

Replace `frontend/src/app/page.tsx` with a placeholder:
```tsx
export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Sport Tracker</h1>
      <p className="text-gray-500 mt-2">Calendrier à venir...</p>
    </div>
  );
}
```

**Step 5: Create frontend .env.local**

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Step 6: Verify frontend runs**

```bash
cd frontend && npm run dev
# Open http://localhost:3000 — should see "Sport Tracker" and bottom nav
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add frontend layout, bottom nav, and API client"
```

---

## Task 6: Frontend — Calendar view

**Files:**
- Create: `frontend/src/components/Calendar.tsx`
- Modify: `frontend/src/app/page.tsx`

**Step 1: Build Calendar component**

Create `frontend/src/components/Calendar.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Workout {
  id: number;
  date: string;
  type: 'musculation' | 'velo';
}

interface MonthlyStats {
  cycling_count: string;
  strength_count: string;
  total_distance_km: string;
  total_elevation_m: string;
  active_days: string;
}

interface CalendarProps {
  onDayClick: (date: string, workouts: Workout[]) => void;
}

export default function Calendar({ onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<MonthlyStats | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  useEffect(() => {
    api.getWorkouts(monthStr).then(setWorkouts).catch(console.error);
    api.getMonthlyStats(monthStr).then(setStats).catch(console.error);
  }, [monthStr]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getWorkoutsForDay = (day: number): Workout[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return workouts.filter((w) => w.date === dateStr);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 text-gray-600 text-lg">&larr;</button>
        <h2 className="text-lg font-semibold">{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 text-gray-600 text-lg">&rarr;</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayWorkouts = getWorkoutsForDay(day);
          const hasVelo = dayWorkouts.some((w) => w.type === 'velo');
          const hasMuscu = dayWorkouts.some((w) => w.type === 'musculation');
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

          return (
            <button
              key={day}
              onClick={() => onDayClick(dateStr, dayWorkouts)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${dayWorkouts.length > 0 ? 'bg-gray-100' : 'hover:bg-gray-50'}
              `}
            >
              <span className={isToday ? 'font-bold' : ''}>{day}</span>
              {(hasVelo || hasMuscu) && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasVelo && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  {hasMuscu && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly summary */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">{stats.strength_count}</div>
            <div className="text-xs text-orange-400">Séances muscu</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.cycling_count}</div>
            <div className="text-xs text-blue-400">Séances vélo</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.total_distance_km}</div>
            <div className="text-xs text-blue-400">km parcourus</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.total_elevation_m}</div>
            <div className="text-xs text-blue-400">m de dénivelé</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update page.tsx to use Calendar**

Replace `frontend/src/app/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';

interface Workout {
  id: number;
  date: string;
  type: 'musculation' | 'velo';
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  const [showTypeChoice, setShowTypeChoice] = useState(false);

  const handleDayClick = (date: string, workouts: Workout[]) => {
    setSelectedDate(date);
    setSelectedWorkouts(workouts);
    setShowTypeChoice(false);
  };

  return (
    <div>
      <Calendar onDayClick={handleDayClick} />

      {/* Selected day panel */}
      {selectedDate && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-2">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </h3>
            {selectedWorkouts.length === 0 && !showTypeChoice && (
              <p className="text-gray-400 text-sm">Aucune séance</p>
            )}
            {selectedWorkouts.map((w) => (
              <div key={w.id} className="flex items-center gap-2 py-1">
                <div className={`w-2 h-2 rounded-full ${w.type === 'velo' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                <span className="text-sm">{w.type === 'velo' ? 'Vélo' : 'Musculation'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating + button */}
      {selectedDate && !showTypeChoice && (
        <button
          onClick={() => setShowTypeChoice(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-2xl flex items-center justify-center"
        >
          +
        </button>
      )}

      {/* Type choice modal */}
      {showTypeChoice && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8">
            <h3 className="text-lg font-semibold mb-4">Nouvelle séance</h3>
            <div className="flex gap-3">
              <a
                href={`/workout/cycling?date=${selectedDate}`}
                className="flex-1 bg-blue-50 text-blue-700 rounded-xl p-4 text-center font-medium"
              >
                Vélo
              </a>
              <a
                href={`/workout/strength?date=${selectedDate}`}
                className="flex-1 bg-orange-50 text-orange-700 rounded-xl p-4 text-center font-medium"
              >
                Musculation
              </a>
            </div>
            <button
              onClick={() => setShowTypeChoice(false)}
              className="w-full mt-3 py-2 text-gray-400 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Verify**

```bash
cd frontend && npm run dev
# Open http://localhost:3000 — calendar should render, click a day, see the + button
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add calendar view with monthly stats and day selection"
```

---

## Task 7: Frontend — Cycling workout form

**Files:**
- Create: `frontend/src/app/workout/cycling/page.tsx`

**Step 1: Create cycling workout page**

Create `frontend/src/app/workout/cycling/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const RIDE_TYPES = ['Route', 'Gravel', 'Home trainer', 'VTT', 'Vélotaf'];

export default function CyclingWorkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [elevation, setElevation] = useState('');
  const [rideType, setRideType] = useState(RIDE_TYPES[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.createWorkout({
        date,
        type: 'velo',
        cycling_details: {
          duration: duration ? parseInt(duration) : null,
          distance: distance ? parseFloat(distance) : null,
          elevation: elevation ? parseInt(elevation) : null,
          ride_type: rideType,
        },
      });
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-gray-500">&larr;</button>
        <h1 className="text-lg font-semibold">Séance vélo</h1>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {date && new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de sortie</label>
          <select
            value={rideType}
            onChange={(e) => setRideType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
          >
            {RIDE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
          <input
            type="number"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder="30"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dénivelé (m)</label>
          <input
            type="number"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            placeholder="500"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 bg-blue-600 text-white font-medium py-3 rounded-lg disabled:opacity-50"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
}
```

**Step 2: Verify**

```bash
# With both backend and frontend running:
# Navigate to http://localhost:3000, click a day, click +, click Vélo
# Fill in the form, save — should redirect to calendar with blue dot
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add cycling workout form"
```

---

## Task 8: Frontend — Strength workout form with last performance

**Files:**
- Create: `frontend/src/app/workout/strength/page.tsx`

**Step 1: Create strength workout page**

Create `frontend/src/app/workout/strength/page.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

interface SetLog {
  set_number: number;
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetLog[];
  lastPerformance: { set_number: number; reps: number; weight: string; date: string }[];
}

export default function StrengthWorkout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || '';

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getExercises().then(setExercises).catch(console.error);
  }, []);

  const addExercise = async (exercise: Exercise) => {
    const lastPerf = await api.getLastPerformance(exercise.id);
    const initialSets: SetLog[] = lastPerf.length > 0
      ? lastPerf.map((p) => ({ set_number: p.set_number, reps: '', weight: '' }))
      : [{ set_number: 1, reps: '', weight: '' }];

    setEntries([...entries, { exercise, sets: initialSets, lastPerformance: lastPerf }]);
    setShowExercisePicker(false);
  };

  const createAndAddExercise = async () => {
    if (!newExerciseName || !newExerciseMuscle) return;
    const created = await api.createExercise({ name: newExerciseName, muscle_group: newExerciseMuscle });
    setExercises([...exercises, created]);
    setNewExerciseName('');
    setNewExerciseMuscle('');
    setShowNewExercise(false);
    await addExercise(created);
  };

  const updateSet = (entryIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...entries];
    updated[entryIdx].sets[setIdx][field] = value;
    setEntries(updated);
  };

  const addSet = (entryIdx: number) => {
    const updated = [...entries];
    const nextNum = updated[entryIdx].sets.length + 1;
    updated[entryIdx].sets.push({ set_number: nextNum, reps: '', weight: '' });
    setEntries(updated);
  };

  const removeExercise = (entryIdx: number) => {
    setEntries(entries.filter((_, i) => i !== entryIdx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const exercise_logs = entries.flatMap((entry) =>
        entry.sets
          .filter((s) => s.reps && s.weight)
          .map((s) => ({
            exercise_id: entry.exercise.id,
            set_number: s.set_number,
            reps: parseInt(s.reps),
            weight: parseFloat(s.weight),
          }))
      );
      await api.createWorkout({ date, type: 'musculation', exercise_logs });
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers', 'Autre'];

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/')} className="text-gray-500">&larr;</button>
        <h1 className="text-lg font-semibold">Séance musculation</h1>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {date && new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </p>

      {/* Exercise entries */}
      {entries.map((entry, entryIdx) => (
        <div key={entryIdx} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium">{entry.exercise.name}</h3>
              <span className="text-xs text-gray-400">{entry.exercise.muscle_group}</span>
            </div>
            <button onClick={() => removeExercise(entryIdx)} className="text-red-400 text-sm">
              Retirer
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-1 px-1">
            <span>Série</span>
            <span>Précédent</span>
            <span>Reps</span>
            <span>Poids (kg)</span>
          </div>

          {/* Sets */}
          {entry.sets.map((set, setIdx) => {
            const lastPerf = entry.lastPerformance.find((p) => p.set_number === set.set_number);
            return (
              <div key={setIdx} className="grid grid-cols-4 gap-2 items-center mb-2">
                <span className="text-sm text-center font-medium text-gray-500">{set.set_number}</span>
                <span className="text-xs text-gray-300 text-center">
                  {lastPerf ? `${lastPerf.reps}x${lastPerf.weight}kg` : '-'}
                </span>
                <input
                  type="number"
                  value={set.reps}
                  onChange={(e) => updateSet(entryIdx, setIdx, 'reps', e.target.value)}
                  placeholder={lastPerf ? String(lastPerf.reps) : '0'}
                  className="border border-gray-200 rounded p-2 text-sm text-center"
                />
                <input
                  type="number"
                  step="0.5"
                  value={set.weight}
                  onChange={(e) => updateSet(entryIdx, setIdx, 'weight', e.target.value)}
                  placeholder={lastPerf ? String(lastPerf.weight) : '0'}
                  className="border border-gray-200 rounded p-2 text-sm text-center"
                />
              </div>
            );
          })}

          <button
            onClick={() => addSet(entryIdx)}
            className="w-full text-sm text-blue-600 py-2 mt-1"
          >
            + Ajouter une série
          </button>
        </div>
      ))}

      {/* Add exercise button */}
      <button
        onClick={() => setShowExercisePicker(true)}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-400 font-medium mb-4"
      >
        + Ajouter un exercice
      </button>

      {/* Save button */}
      {entries.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 text-white font-medium py-3 rounded-lg disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder la séance'}
        </button>
      )}

      {/* Exercise picker modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Choisir un exercice</h3>
              <button onClick={() => setShowExercisePicker(false)} className="text-gray-400">X</button>
            </div>

            {/* Grouped by muscle */}
            {MUSCLE_GROUPS.map((group) => {
              const groupExercises = exercises.filter((e) => e.muscle_group === group);
              if (groupExercises.length === 0) return null;
              return (
                <div key={group} className="mb-3">
                  <h4 className="text-xs text-gray-400 font-medium mb-1">{group}</h4>
                  {groupExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => addExercise(ex)}
                      className="w-full text-left py-2 px-3 hover:bg-gray-50 rounded text-sm"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              );
            })}

            <button
              onClick={() => { setShowExercisePicker(false); setShowNewExercise(true); }}
              className="w-full mt-2 py-3 text-blue-600 font-medium text-sm border-t"
            >
              + Créer un nouvel exercice
            </button>
          </div>
        </div>
      )}

      {/* New exercise modal */}
      {showNewExercise && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6 pb-8">
            <h3 className="text-lg font-semibold mb-4">Nouvel exercice</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="Nom de l'exercice"
                className="w-full border border-gray-300 rounded-lg p-3"
              />
              <select
                value={newExerciseMuscle}
                onChange={(e) => setNewExerciseMuscle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3"
              >
                <option value="">Groupe musculaire</option>
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <button
              onClick={createAndAddExercise}
              className="w-full mt-4 bg-blue-600 text-white font-medium py-3 rounded-lg"
            >
              Créer et ajouter
            </button>
            <button
              onClick={() => setShowNewExercise(false)}
              className="w-full mt-2 py-2 text-gray-400 text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify**

```bash
# Navigate to http://localhost:3000, click a day, click +, click Musculation
# Should see exercise picker, add exercises, see last performance, add sets
# Save → redirect to calendar with orange dot
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add strength workout form with exercise picker and last performance"
```

---

## Task 9: Polish & final integration

**Files:**
- Modify: `frontend/src/app/page.tsx` — add click-to-view existing workout
- Verify full flow end-to-end

**Step 1: Add workout detail navigation**

Update `page.tsx` — in the selected day panel, make existing workouts clickable to view/edit:
```tsx
// In the selectedWorkouts.map, wrap each workout with a link:
<a href={`/workout/${w.type === 'velo' ? 'cycling' : 'strength'}?date=${selectedDate}&edit=${w.id}`}>
```

Note: Full edit functionality can be a V1.1 follow-up. For V1, clicking shows the detail but creating new workouts is the priority.

**Step 2: Full end-to-end test**

```
1. Start backend: cd backend && npm run dev
2. Start frontend: cd frontend && npm run dev
3. Open http://localhost:3000 on phone (use local IP)
4. Click a day → click + → Vélo → fill form → save
5. Verify blue dot appears on calendar
6. Click another day → click + → Musculation → pick exercises → fill sets → save
7. Verify orange dot appears
8. Click day with muscu → + → Musculation → verify "last performance" shows previous data
9. Navigate months → verify data loads correctly
10. Check monthly stats update
```

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete V1 sport tracker with calendar, cycling, and strength tracking"
```

---

Plan complete and saved to `docs/plans/2026-02-24-sport-tracker-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open a new session with executing-plans, batch execution with checkpoints

**Which approach?**