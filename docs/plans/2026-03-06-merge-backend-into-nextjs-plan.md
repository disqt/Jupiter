# Merge Backend into Next.js — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge all Express backend routes into Next.js API Route Handlers so the app runs as a single Next.js process.

**Architecture:** Replace Express backend (5 route files, auth middleware, db, schema, seed) with Next.js `app/api/` route handlers. Shared libs (`db.ts`, `schema.ts`, `auth-api.ts`, `rate-limit.ts`, `seed-exercises.ts`) go into `frontend/src/lib/`. Frontend API client switches from `NEXT_PUBLIC_API_URL` to same-origin relative URLs.

**Tech Stack:** Next.js 14 App Router, pg, jsonwebtoken, bcryptjs, drizzle-orm (schema only)

---

### Task 1: Create new branch and install dependencies

**Files:**
- Modify: `frontend/package.json`

**Step 1: Create branch from current state**

```bash
git checkout -b feat/merge-backend
```

**Step 2: Install backend dependencies into frontend**

```bash
cd frontend && npm install pg jsonwebtoken bcryptjs drizzle-orm && npm install -D @types/pg @types/jsonwebtoken @types/bcryptjs drizzle-kit
```

Note: Backend uses `bcrypt` (native), but `bcryptjs` is a pure JS drop-in replacement that works better with Next.js (no native compilation issues on Vercel). The API is identical.

**Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "feat: add backend dependencies to frontend for API route migration"
```

---

### Task 2: Create shared lib files (db, schema, auth-api, rate-limit, seed-exercises)

**Files:**
- Create: `frontend/src/lib/db-server.ts`
- Create: `frontend/src/lib/schema.ts`
- Create: `frontend/src/lib/auth-api.ts`
- Create: `frontend/src/lib/rate-limit.ts`
- Create: `frontend/src/lib/seed-exercises.ts`

**Step 1: Create `frontend/src/lib/db-server.ts`**

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
```

Note: Named `db-server.ts` to avoid confusion with any client-side imports. No `dotenv` needed — Next.js loads `.env.local` automatically.

**Step 2: Create `frontend/src/lib/schema.ts`**

Copy `backend/src/schema.ts` exactly as-is:

```typescript
import { pgTable, serial, varchar, date, text, integer, decimal, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nickname: varchar('nickname', { length: 50 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  date: date('date').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  notes: text('notes'),
  customEmoji: varchar('custom_emoji', { length: 10 }),
  customName: varchar('custom_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cyclingDetails = pgTable('cycling_details', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  duration: integer('duration'),
  distance: decimal('distance', { precision: 6, scale: 2 }),
  elevation: integer('elevation'),
  rideType: varchar('ride_type', { length: 50 }),
});

export const workoutDetails = pgTable('workout_details', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  duration: integer('duration'),
  distance: decimal('distance', { precision: 10, scale: 2 }),
  elevation: integer('elevation'),
  laps: integer('laps'),
});

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  muscleGroup: varchar('muscle_group', { length: 50 }).notNull(),
});

export const exerciseLogs = pgTable('exercise_logs', {
  id: serial('id').primaryKey(),
  workoutId: integer('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps').notNull(),
  weight: decimal('weight', { precision: 6, scale: 2 }).notNull(),
});
```

**Step 3: Create `frontend/src/lib/auth-api.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
  }
}

export function authenticate(request: NextRequest): number {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) {
    throw new AuthError('Authentication required');
  }
  const token = header.slice(7);
  const payload = jwt.verify(token, process.env.JWT_SECRET || '') as { userId: number };
  return payload.userId;
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

**Step 4: Create `frontend/src/lib/rate-limit.ts`**

```typescript
const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, windowMs = 60000, max = 5): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  // Cleanup old entries periodically
  if (rateMap.size > 10000) {
    rateMap.forEach((val, key) => {
      if (val.resetAt < now) rateMap.delete(key);
    });
  }

  if (!entry || entry.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > max;
}
```

**Step 5: Create `frontend/src/lib/seed-exercises.ts`**

Copy from `backend/src/seedExercises.ts`, change import:

```typescript
import pool from './db-server';

const DEFAULT_EXERCISES: { name: string; muscle_group: string }[] = [
  // Pectoraux
  { name: 'Développé couché', muscle_group: 'Pectoraux' },
  { name: 'Développé incliné', muscle_group: 'Pectoraux' },
  { name: 'Développé décliné', muscle_group: 'Pectoraux' },
  { name: 'Écarté couché haltères', muscle_group: 'Pectoraux' },
  { name: 'Écarté à la poulie vis-à-vis', muscle_group: 'Pectoraux' },
  { name: 'Pompes', muscle_group: 'Pectoraux' },
  { name: 'Dips (pectoraux)', muscle_group: 'Pectoraux' },
  // Dos
  { name: 'Tractions', muscle_group: 'Dos' },
  { name: 'Rowing barre', muscle_group: 'Dos' },
  { name: 'Rowing haltère', muscle_group: 'Dos' },
  { name: 'Tirage vertical', muscle_group: 'Dos' },
  { name: 'Tirage horizontal', muscle_group: 'Dos' },
  { name: 'Soulevé de terre', muscle_group: 'Dos' },
  { name: 'Pull-over', muscle_group: 'Dos' },
  // Épaules
  { name: 'Développé militaire', muscle_group: 'Épaules' },
  { name: 'Développé haltères assis', muscle_group: 'Épaules' },
  { name: 'Élévations latérales', muscle_group: 'Épaules' },
  { name: 'Élévations frontales', muscle_group: 'Épaules' },
  { name: 'Oiseau (élévations postérieures)', muscle_group: 'Épaules' },
  { name: 'Face pull', muscle_group: 'Épaules' },
  { name: 'Shrugs', muscle_group: 'Épaules' },
  // Biceps
  { name: 'Curl barre', muscle_group: 'Biceps' },
  { name: 'Curl haltères', muscle_group: 'Biceps' },
  { name: 'Curl marteau', muscle_group: 'Biceps' },
  { name: 'Curl incliné', muscle_group: 'Biceps' },
  { name: 'Curl pupitre', muscle_group: 'Biceps' },
  { name: 'Curl poulie basse', muscle_group: 'Biceps' },
  // Triceps
  { name: 'Dips (triceps)', muscle_group: 'Triceps' },
  { name: 'Extension triceps poulie haute', muscle_group: 'Triceps' },
  { name: 'Barre au front', muscle_group: 'Triceps' },
  { name: 'Extension triceps haltère', muscle_group: 'Triceps' },
  { name: 'Kickback', muscle_group: 'Triceps' },
  { name: 'Développé couché prise serrée', muscle_group: 'Triceps' },
  // Abdominaux
  { name: 'Crunch', muscle_group: 'Abdominaux' },
  { name: 'Crunch câble', muscle_group: 'Abdominaux' },
  { name: 'Relevé de jambes', muscle_group: 'Abdominaux' },
  { name: 'Planche', muscle_group: 'Abdominaux' },
  { name: 'Russian twist', muscle_group: 'Abdominaux' },
  { name: 'Ab wheel', muscle_group: 'Abdominaux' },
  // Quadriceps
  { name: 'Squat', muscle_group: 'Quadriceps' },
  { name: 'Squat bulgare', muscle_group: 'Quadriceps' },
  { name: 'Presse à cuisses', muscle_group: 'Quadriceps' },
  { name: 'Leg extension', muscle_group: 'Quadriceps' },
  { name: 'Fentes', muscle_group: 'Quadriceps' },
  { name: 'Hack squat', muscle_group: 'Quadriceps' },
  // Ischios
  { name: 'Leg curl couché', muscle_group: 'Ischios' },
  { name: 'Leg curl assis', muscle_group: 'Ischios' },
  { name: 'Soulevé de terre jambes tendues', muscle_group: 'Ischios' },
  { name: 'Good morning', muscle_group: 'Ischios' },
  { name: 'Nordic curl', muscle_group: 'Ischios' },
  // Fessiers
  { name: 'Hip thrust', muscle_group: 'Fessiers' },
  { name: 'Pont fessier', muscle_group: 'Fessiers' },
  { name: 'Abduction hanche', muscle_group: 'Fessiers' },
  { name: 'Kickback câble', muscle_group: 'Fessiers' },
  { name: 'Fentes arrière', muscle_group: 'Fessiers' },
  // Mollets
  { name: 'Mollets debout', muscle_group: 'Mollets' },
  { name: 'Mollets assis', muscle_group: 'Mollets' },
  { name: 'Mollets presse', muscle_group: 'Mollets' },
];

export async function seedDefaultExercises(userId: number): Promise<void> {
  const values = DEFAULT_EXERCISES.map(
    (_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
  ).join(', ');

  const params = DEFAULT_EXERCISES.flatMap((e) => [e.name, e.muscle_group, userId]);

  await pool.query(
    `INSERT INTO exercises (name, muscle_group, user_id) VALUES ${values}`,
    params
  );
}
```

**Step 6: Commit**

```bash
git add frontend/src/lib/db-server.ts frontend/src/lib/schema.ts frontend/src/lib/auth-api.ts frontend/src/lib/rate-limit.ts frontend/src/lib/seed-exercises.ts
git commit -m "feat: add shared server libs for API route migration"
```

---

### Task 3: Create auth API routes

**Files:**
- Create: `frontend/src/app/api/auth/register/route.ts`
- Create: `frontend/src/app/api/auth/login/route.ts`
- Create: `frontend/src/app/api/auth/me/route.ts`

**Step 1: Create `frontend/src/app/api/auth/register/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db-server';
import { seedDefaultExercises } from '@/lib/seed-exercises';
import { rateLimit } from '@/lib/rate-limit';

const SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
    }

    const { nickname, password, invite_code } = await request.json();

    if (!nickname || !password || !invite_code) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (invite_code !== (process.env.INVITE_CODE || '')) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
    }

    if (nickname.length < 2 || nickname.length > 50) {
      return NextResponse.json({ error: 'Nickname must be 2-50 characters' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await pool.query('SELECT id FROM users WHERE nickname = $1', [nickname]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Nickname already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (nickname, password_hash) VALUES ($1, $2) RETURNING id, nickname, created_at',
      [nickname, passwordHash]
    );

    const user = result.rows[0];
    await seedDefaultExercises(user.id);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '30d' });

    return NextResponse.json({ token, user: { id: user.id, nickname: user.nickname } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Create `frontend/src/app/api/auth/login/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db-server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimit(ip)) {
      return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
    }

    const { nickname, password } = await request.json();

    if (!nickname || !password) {
      return NextResponse.json({ error: 'Nickname and password are required' }, { status: 400 });
    }

    const result = await pool.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid nickname or password' }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid nickname or password' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || '', { expiresIn: '30d' });

    return NextResponse.json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 3: Create `frontend/src/app/api/auth/me/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

const SALT_ROUNDS = 12;

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const { nickname, password, current_password } = await request.json();

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (current_password) {
      const valid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }
    }

    if (nickname) {
      if (nickname.length < 2 || nickname.length > 50) {
        return NextResponse.json({ error: 'Nickname must be 2-50 characters' }, { status: 400 });
      }
      const existing = await pool.query('SELECT id FROM users WHERE nickname = $1 AND id != $2', [nickname, userId]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Nickname already taken' }, { status: 409 });
      }
      await pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [nickname, userId]);
    }

    if (password) {
      if (!current_password) {
        return NextResponse.json({ error: 'Current password required to change password' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, userId]);
    }

    const updated = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [userId]);
    return NextResponse.json(updated.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 4: Commit**

```bash
git add frontend/src/app/api/auth/
git commit -m "feat: add auth API route handlers (register, login, me)"
```

---

### Task 4: Create workouts API routes

**Files:**
- Create: `frontend/src/app/api/workouts/route.ts`
- Create: `frontend/src/app/api/workouts/[id]/route.ts`

**Step 1: Create `frontend/src/app/api/workouts/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    if (!month) {
      return NextResponse.json({ error: 'month query param required (YYYY-MM)' }, { status: 400 });
    }
    const result = await pool.query(
      `SELECT w.*,
        cd.duration, cd.distance, cd.elevation, cd.ride_type,
        wd.duration as wd_duration, wd.distance as wd_distance, wd.elevation as wd_elevation, wd.laps as wd_laps,
        (SELECT COUNT(DISTINCT el.exercise_id) FROM exercise_logs el WHERE el.workout_id = w.id) as exercise_count
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, 'YYYY-MM') = $1
         AND w.user_id = $2
       ORDER BY w.date, w.created_at`,
      [month, userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const userId = authenticate(request);
    await client.query('BEGIN');
    const { date, type, notes, cycling_details, exercise_logs, workout_details, custom_emoji, custom_name } = await request.json();

    const workoutResult = await client.query(
      'INSERT INTO workouts (date, type, notes, user_id, custom_emoji, custom_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [date, type, notes || null, userId, custom_emoji || null, custom_name || null]
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

    if (['course', 'natation', 'marche', 'custom'].includes(type) && workout_details) {
      const { duration, distance, elevation, laps } = workout_details;
      await client.query(
        `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
         VALUES ($1, $2, $3, $4, $5)`,
        [workout.id, duration || null, distance || null, elevation || null, laps || null]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json(workout, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    return handleApiError(err);
  } finally {
    client.release();
  }
}
```

**Step 2: Create `frontend/src/app/api/workouts/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const workoutResult = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (workoutResult.rows.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    const workout = workoutResult.rows[0];

    if (workout.type === 'velo') {
      const cyclingResult = await pool.query(
        'SELECT * FROM cycling_details WHERE workout_id = $1', [id]
      );
      workout.cycling_details = cyclingResult.rows[0] || null;
    } else if (workout.type === 'musculation') {
      const logsResult = await pool.query(
        `SELECT el.*, e.name as exercise_name, e.muscle_group
         FROM exercise_logs el
         JOIN exercises e ON e.id = el.exercise_id
         WHERE el.workout_id = $1
         ORDER BY el.exercise_id, el.set_number`, [id]
      );
      workout.exercise_logs = logsResult.rows;
    } else {
      const detailsResult = await pool.query(
        'SELECT * FROM workout_details WHERE workout_id = $1', [id]
      );
      workout.workout_details = detailsResult.rows[0] || null;
    }

    return NextResponse.json(workout);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await pool.connect();
  try {
    const userId = authenticate(request);
    await client.query('BEGIN');
    const { id } = params;
    const { date, type, notes, cycling_details, exercise_logs, workout_details, custom_emoji, custom_name } = await request.json();

    const workoutResult = await client.query(
      'UPDATE workouts SET date = $1, type = $2, notes = $3, custom_emoji = $5, custom_name = $6 WHERE id = $4 AND user_id = $7 RETURNING *',
      [date, type, notes || null, id, custom_emoji || null, custom_name || null, userId]
    );
    if (workoutResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    await client.query('DELETE FROM cycling_details WHERE workout_id = $1', [id]);
    if (type === 'velo' && cycling_details) {
      const { duration, distance, elevation, ride_type } = cycling_details;
      await client.query(
        `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, duration, distance, elevation, ride_type]
      );
    }

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

    await client.query('DELETE FROM workout_details WHERE workout_id = $1', [id]);
    if (['course', 'natation', 'marche', 'custom'].includes(type) && workout_details) {
      const { duration, distance, elevation, laps } = workout_details;
      await client.query(
        `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, duration || null, distance || null, elevation || null, laps || null]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json(workoutResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    return handleApiError(err);
  } finally {
    client.release();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const { custom_emoji, custom_name } = await request.json();
    const result = await pool.query(
      'UPDATE workouts SET custom_emoji = $1, custom_name = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [custom_emoji || null, custom_name || null, id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      'DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Workout deleted' });
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 3: Commit**

```bash
git add frontend/src/app/api/workouts/
git commit -m "feat: add workouts API route handlers (CRUD)"
```

---

### Task 5: Create exercises API routes

**Files:**
- Create: `frontend/src/app/api/exercises/route.ts`
- Create: `frontend/src/app/api/exercises/[id]/route.ts`
- Create: `frontend/src/app/api/exercises/last-performance/route.ts`
- Create: `frontend/src/app/api/exercises/history/route.ts`

**Step 1: Create `frontend/src/app/api/exercises/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query(
      'SELECT * FROM exercises WHERE user_id = $1 ORDER BY muscle_group, id',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const { name, muscle_group } = await request.json();
    const result = await pool.query(
      'INSERT INTO exercises (name, muscle_group, user_id) VALUES ($1, $2, $3) RETURNING *',
      [name, muscle_group, userId]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 2: Create `frontend/src/app/api/exercises/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const { name, muscle_group } = await request.json();
    const result = await pool.query(
      'UPDATE exercises SET name = $1, muscle_group = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, muscle_group, id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      'DELETE FROM exercises WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Exercise deleted' });
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 3: Create `frontend/src/app/api/exercises/last-performance/route.ts`**

Note: The original Express routes use `/:id/last-performance` and `/:id/history` with `req.params.id`. In Next.js, we can't have a route like `[id]/last-performance/route.ts` alongside `[id]/route.ts` easily. Instead, use query params: `/api/exercises/last-performance?id=123`.

Update: Actually we CAN nest — `exercises/[id]/last-performance/route.ts` works fine. But the frontend `api.ts` currently calls `/api/exercises/${exerciseId}/last-performance`. Let's keep the same URL structure.

- Create: `frontend/src/app/api/exercises/[id]/last-performance/route.ts`
- Create: `frontend/src/app/api/exercises/[id]/history/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      `SELECT el.set_number, el.reps, el.weight, w.date
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE el.exercise_id = $1
         AND w.user_id = $2
         AND w.date = (
           SELECT MAX(w2.date) FROM workouts w2
           JOIN exercise_logs el2 ON el2.workout_id = w2.id
           WHERE el2.exercise_id = $1
             AND w2.user_id = $2
         )
       ORDER BY el.set_number`,
      [id, userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 4: Create `frontend/src/app/api/exercises/[id]/history/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      `SELECT el.set_number, el.reps, el.weight, w.date
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE el.exercise_id = $1
         AND w.user_id = $2
       AND w.date IN (
         SELECT DISTINCT w2.date FROM workouts w2
         JOIN exercise_logs el2 ON el2.workout_id = w2.id
         WHERE el2.exercise_id = $1 AND w2.user_id = $2
         ORDER BY w2.date DESC
         LIMIT 3
       )
       ORDER BY w.date DESC, el.set_number`,
      [id, userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 5: Commit**

```bash
git add frontend/src/app/api/exercises/
git commit -m "feat: add exercises API route handlers (CRUD + last-performance + history)"
```

---

### Task 6: Create stats API routes

**Files:**
- Create: `frontend/src/app/api/stats/monthly/route.ts`
- Create: `frontend/src/app/api/stats/weekly-progress/route.ts`
- Create: `frontend/src/app/api/stats/weekly-medals/route.ts`
- Create: `frontend/src/app/api/stats/medals-history/route.ts`
- Create: `frontend/src/app/api/stats/distance-by-type/route.ts`
- Create: `frontend/src/app/api/stats/strength-volume/route.ts`

**Step 1: Create `frontend/src/app/api/stats/monthly/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    let dateFormat: string;
    let dateValue: string;

    if (month) {
      dateFormat = 'YYYY-MM';
      dateValue = month;
    } else if (year) {
      dateFormat = 'YYYY';
      dateValue = year;
    } else {
      return NextResponse.json({ error: 'month (YYYY-MM) or year (YYYY) query param required' }, { status: 400 });
    }

    const countsResult = await pool.query(
      `SELECT type, COUNT(*)::text as count
       FROM workouts
       WHERE to_char(date, $1) = $2 AND user_id = $3
       GROUP BY type`,
      [dateFormat, dateValue, userId]
    );
    const counts_by_type: Record<string, string> = {};
    for (const row of countsResult.rows) {
      counts_by_type[row.type] = row.count;
    }

    const aggResult = await pool.query(
      `SELECT
        COUNT(*)::text AS total_count,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::text AS total_distance_km,
        COALESCE(SUM(COALESCE(cd.elevation, wd.elevation)), 0)::text AS total_elevation_m,
        COUNT(DISTINCT w.date)::text AS active_days
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, $1) = $2
         AND w.user_id = $3`,
      [dateFormat, dateValue, userId]
    );

    return NextResponse.json({ ...aggResult.rows[0], counts_by_type });
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 2: Create `frontend/src/app/api/stats/weekly-progress/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      ),
      current_week AS (
        SELECT COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
          AND date >= date_trunc('week', CURRENT_DATE)
          AND date < date_trunc('week', CURRENT_DATE) + interval '7 days'
      )
      SELECT
        (SELECT count FROM current_week) as week_count,
        COALESCE((SELECT SUM(GREATEST(count - 2, 0)) FROM weekly_counts), 0) as total_medals
    `, [userId]);

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 3: Create `frontend/src/app/api/stats/weekly-medals/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    if (!month) {
      return NextResponse.json({ error: 'month query param required (YYYY-MM)' }, { status: 400 });
    }

    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*)::int as workout_count,
          GREATEST(COUNT(*) - 2, 0)::int as medals
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      )
      SELECT
        to_char(week_start, 'YYYY-MM-DD') as week_start,
        workout_count,
        medals
      FROM weekly_counts
      WHERE week_start + interval '6 days' >= ($2 || '-01')::date
        AND week_start < (($2 || '-01')::date + interval '1 month')
      ORDER BY week_start
    `, [userId, month]);

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 4: Create `frontend/src/app/api/stats/medals-history/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*)::int as workout_count,
          GREATEST(COUNT(*) - 2, 0)::int as medals
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      )
      SELECT
        to_char(week_start, 'YYYY-MM-DD') as week_start,
        workout_count,
        medals,
        SUM(medals) OVER (ORDER BY week_start)::int as cumulative
      FROM weekly_counts
      ORDER BY week_start
    `, [userId]);

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 5: Create `frontend/src/app/api/stats/distance-by-type/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    let dateFormat: string;
    let dateValue: string;
    let periodExpr: string;

    if (month) {
      dateFormat = 'YYYY-MM';
      dateValue = month;
      periodExpr = `EXTRACT(ISOYEAR FROM w.date)::int * 100 + EXTRACT(WEEK FROM w.date)::int`;
    } else if (year) {
      dateFormat = 'YYYY';
      dateValue = year;
      periodExpr = `to_char(w.date, 'MM')`;
    } else {
      return NextResponse.json({ error: 'month (YYYY-MM) or year (YYYY) query param required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT
        ${periodExpr} as period_num,
        w.type,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance, 0)), 0)::float as distance
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, $1) = $2
         AND w.user_id = $3
       GROUP BY period_num, w.type
       ORDER BY period_num, w.type`,
      [dateFormat, dateValue, userId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 6: Create `frontend/src/app/api/stats/strength-volume/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    let dateFormat: string;
    let dateValue: string;

    if (month) {
      dateFormat = 'YYYY-MM';
      dateValue = month;
    } else if (year) {
      dateFormat = 'YYYY';
      dateValue = year;
    } else {
      return NextResponse.json({ error: 'month (YYYY-MM) or year (YYYY) query param required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(el.reps * el.weight), 0)::float as total_tonnage,
        COUNT(DISTINCT el.exercise_id)::int as exercise_count,
        COUNT(*)::int as total_sets
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE w.type = 'musculation'
         AND to_char(w.date, $1) = $2
         AND w.user_id = $3`,
      [dateFormat, dateValue, userId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 7: Commit**

```bash
git add frontend/src/app/api/stats/
git commit -m "feat: add stats API route handlers (monthly, weekly, medals, distance, strength)"
```

---

### Task 7: Create home and health API routes

**Files:**
- Create: `frontend/src/app/api/home/route.ts`
- Create: `frontend/src/app/api/health/route.ts`

**Step 1: Create `frontend/src/app/api/home/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const todayResult = await pool.query(
      `SELECT w.id, w.type, w.custom_emoji, w.custom_name,
              COALESCE(cd.duration, wd.duration) as duration,
              COALESCE(cd.distance, wd.distance)::float as distance,
              (SELECT COUNT(DISTINCT el.exercise_id) FROM exercise_logs el WHERE el.workout_id = w.id)::int as exercise_count
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE w.date = $1 AND w.user_id = $2
       ORDER BY w.created_at`,
      [todayStr, userId]
    );

    const weekResult = await pool.query(
      `SELECT w.date::text as date, w.type
       FROM workouts w
       WHERE w.date >= date_trunc('week', CURRENT_DATE)
         AND w.date < date_trunc('week', CURRENT_DATE) + interval '7 days'
         AND w.user_id = $1
       ORDER BY w.date, w.created_at`,
      [userId]
    );

    const medalsResult = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      )
      SELECT
        COALESCE(SUM(GREATEST(count - 2, 0)), 0)::int as total,
        COALESCE(SUM(CASE
          WHEN week_start >= date_trunc('month', CURRENT_DATE)
           AND week_start < date_trunc('month', CURRENT_DATE) + interval '1 month'
          THEN GREATEST(count - 2, 0) ELSE 0 END), 0)::int as month
      FROM weekly_counts
    `, [userId]);

    const insightsResult = await pool.query(`
      SELECT
        COUNT(*)::int as sessions,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::float as distance_km,
        COALESCE(SUM(COALESCE(cd.duration, wd.duration)), 0)::int as duration_min
      FROM workouts w
      LEFT JOIN cycling_details cd ON cd.workout_id = w.id
      LEFT JOIN workout_details wd ON wd.workout_id = w.id
      WHERE w.date >= date_trunc('week', CURRENT_DATE)
        AND w.date < date_trunc('week', CURRENT_DATE) + interval '7 days'
        AND w.user_id = $1
    `, [userId]);

    const prevInsightsResult = await pool.query(`
      SELECT
        COUNT(*)::int as sessions,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::float as distance_km,
        COALESCE(SUM(COALESCE(cd.duration, wd.duration)), 0)::int as duration_min
      FROM workouts w
      LEFT JOIN cycling_details cd ON cd.workout_id = w.id
      LEFT JOIN workout_details wd ON wd.workout_id = w.id
      WHERE w.date >= date_trunc('week', CURRENT_DATE) - interval '7 days'
        AND w.date < date_trunc('week', CURRENT_DATE)
        AND w.user_id = $1
    `, [userId]);

    const volumeResult = await pool.query(`
      SELECT COALESCE(SUM(el.reps * el.weight), 0)::float as volume_kg
      FROM exercise_logs el
      JOIN workouts w ON w.id = el.workout_id
      WHERE w.type = 'musculation'
        AND w.date >= date_trunc('week', CURRENT_DATE)
        AND w.date < date_trunc('week', CURRENT_DATE) + interval '7 days'
        AND w.user_id = $1
    `, [userId]);

    const prevVolumeResult = await pool.query(`
      SELECT COALESCE(SUM(el.reps * el.weight), 0)::float as volume_kg
      FROM exercise_logs el
      JOIN workouts w ON w.id = el.workout_id
      WHERE w.type = 'musculation'
        AND w.date >= date_trunc('week', CURRENT_DATE) - interval '7 days'
        AND w.date < date_trunc('week', CURRENT_DATE)
        AND w.user_id = $1
    `, [userId]);

    const datesResult = await pool.query(
      `SELECT DISTINCT date::date as d
       FROM workouts
       WHERE user_id = $1 AND date <= CURRENT_DATE
       ORDER BY d DESC
       LIMIT 90`,
      [userId]
    );

    let streak = 0;
    let bestStreak = 0;

    if (datesResult.rows.length > 0) {
      const todayMs = new Date(todayStr + 'T00:00:00').getTime();
      const dayMs = 86400000;
      const dates = datesResult.rows.map((r: { d: string }) => {
        const d = new Date(r.d);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

      let checkDate = todayMs;
      if (dates[0] !== checkDate) {
        checkDate -= dayMs;
      }

      for (const d of dates) {
        if (d === checkDate) {
          streak++;
          checkDate -= dayMs;
        } else if (d < checkDate) {
          break;
        }
      }

      let tempStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        if (dates[i - 1] - dates[i] === dayMs) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak, streak);
    }

    const curr = insightsResult.rows[0];
    const prev = prevInsightsResult.rows[0];

    return NextResponse.json({
      today: todayResult.rows,
      week: weekResult.rows.map((r: { date: string; type: string }) => ({
        date: r.date.split('T')[0],
        type: r.type,
      })),
      medals: medalsResult.rows[0],
      insights: {
        sessions: curr.sessions,
        distance_km: curr.distance_km,
        duration_min: curr.duration_min,
        volume_kg: volumeResult.rows[0].volume_kg,
        prev_sessions: prev.sessions,
        prev_distance_km: prev.distance_km,
        prev_duration_min: prev.duration_min,
        prev_volume_kg: prevVolumeResult.rows[0].volume_kg,
      },
      streak,
      best_streak: bestStreak,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Step 2: Create `frontend/src/app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

**Step 3: Commit**

```bash
git add frontend/src/app/api/home/ frontend/src/app/api/health/
git commit -m "feat: add home and health API route handlers"
```

---

### Task 8: Switch frontend to same-origin API calls + update env

**Files:**
- Modify: `frontend/src/lib/api.ts:3` — change API_URL default
- Modify: `frontend/src/lib/auth.tsx:6` — change API_URL default
- Modify: `frontend/.env.local` — add DB credentials, remove NEXT_PUBLIC_API_URL

**Step 1: Update `frontend/src/lib/api.ts` line 3**

Change:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```
To:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
```

**Step 2: Update `frontend/src/lib/auth.tsx` line 6**

Change:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```
To:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
```

**Step 3: Update `frontend/.env.local`**

Replace contents with:
```
DATABASE_URL=postgresql://postgres.xzrfsfkeqzxxiigjbfbp:bx3vSu9dC5^3B*IS8XxK@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=1b6637273f5db7e949a20eddfe00267eb2d4d3b5d55550bca12b625893d3bb8b
INVITE_CODE=jupiter2026
```

No more `NEXT_PUBLIC_API_URL` needed — frontend calls same-origin `/api/...`.

**Step 4: Commit** (only the code changes, NOT .env.local)

```bash
git add frontend/src/lib/api.ts frontend/src/lib/auth.tsx
git commit -m "feat: switch frontend API client to same-origin calls"
```

---

### Task 9: Update root package.json scripts

**Files:**
- Modify: `package.json`

**Step 1: Update root `package.json`**

Change:
```json
{
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
To:
```json
{
  "scripts": {
    "dev": "cd frontend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd frontend && npm start"
  }
}
```

No more `concurrently` dependency needed.

**Step 2: Commit**

```bash
git add package.json
git commit -m "feat: simplify root scripts — single Next.js process"
```

---

### Task 10: Type-check and test locally

**Step 1: Run TypeScript type check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: No errors. If there are errors, fix them before proceeding.

**Step 2: Start dev server (frontend only)**

```bash
cd frontend && npm run dev
```

**Step 3: Test in browser**

Verify all of these work:
- Login at http://localhost:3000/login
- Home page loads with data
- Calendar loads workouts
- Create a new workout
- Edit a workout
- Delete a workout
- Stats page loads charts
- Profile page works (change nickname)
- Test on mobile (http://192.168.1.88:3000)

**Step 4: Test health endpoint**

```bash
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok"}`

---

### Task 11: Final commit and PR

**Step 1: Commit any remaining fixes**

```bash
git add -A && git status
```

Review staged files, commit if needed.

**Step 2: Push and create PR**

```bash
git push -u origin feat/merge-backend
gh pr create --title "feat: merge backend into Next.js API routes" --body "$(cat <<'EOF'
## Summary
- Migrated all Express backend routes to Next.js API Route Handlers
- Added shared server libs: db-server.ts, schema.ts, auth-api.ts, rate-limit.ts, seed-exercises.ts
- Switched frontend API client to same-origin calls (no more NEXT_PUBLIC_API_URL)
- Simplified root package.json (single Next.js process)
- Backend folder kept as reference — will be removed in follow-up

## API Routes Created
- `/api/auth/register` (POST), `/api/auth/login` (POST), `/api/auth/me` (GET, PUT)
- `/api/workouts` (GET, POST), `/api/workouts/[id]` (GET, PUT, PATCH, DELETE)
- `/api/exercises` (GET, POST), `/api/exercises/[id]` (PUT, DELETE)
- `/api/exercises/[id]/last-performance` (GET), `/api/exercises/[id]/history` (GET)
- `/api/stats/monthly` (GET), `/api/stats/weekly-progress` (GET), `/api/stats/weekly-medals` (GET)
- `/api/stats/medals-history` (GET), `/api/stats/distance-by-type` (GET), `/api/stats/strength-volume` (GET)
- `/api/home` (GET), `/api/health` (GET)

## Test plan
- [ ] Login/register works
- [ ] Home page loads with all data
- [ ] Calendar shows workouts
- [ ] Create/edit/delete workouts (all types)
- [ ] Stats page loads all charts
- [ ] Profile update works
- [ ] Mobile testing (same-origin, no CORS needed)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
