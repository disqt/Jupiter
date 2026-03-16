---
paths:
  - "frontend/src/lib/schema.ts"
  - "frontend/src/lib/db-server.ts"
  - "frontend/src/app/api/**"
  - "database/**"
---

# Database (Supabase PostgreSQL)

## Tables (schema `public`)

- `users` — id, nickname (unique), password_hash, email (nullable), created_at
- `workouts` — id, user_id (FK → users), date, type (CHECK: `velo`|`musculation`|`course`|`natation`|`marche`|`custom`), notes, custom_emoji, custom_name, created_at
- `cycling_details` — id, workout_id (FK CASCADE), duration, distance, elevation, ride_type
- `workout_details` — id, workout_id (FK CASCADE), duration, distance, elevation, laps. Used by course/natation/marche/custom.
- `exercises` — id, user_id (FK → users), name, muscle_group, default_mode (TEXT, default 'reps-weight'). 58 defaults seeded per user on registration.
- `exercise_logs` — id, workout_id (FK CASCADE), exercise_id (FK CASCADE), set_number, reps, weight, mode (TEXT, default 'reps-weight'), duration (nullable)
- `exercise_workout_notes` — id, workout_id (FK CASCADE), exercise_id (FK CASCADE), note, pinned (boolean). Unique on (workout_id, exercise_id).

## Indexes

`workouts(user_id, date)`, `workouts(user_id, type)`, `cycling_details(workout_id)`, `workout_details(workout_id)`, `exercise_logs(workout_id)`, `exercise_logs(exercise_id)`, `exercises(user_id, muscle_group)`

## Supabase MCP tools

- `mcp__supabase__execute_sql` — queries (SELECT, INSERT, UPDATE, DELETE)
- `mcp__supabase__apply_migration` — DDL (CREATE TABLE, ALTER TABLE, etc.)
- `mcp__supabase__list_tables` — list tables
- `mcp__supabase__get_advisors` — security/performance checks

## Connection

- Uses `DATABASE_URL` from env (session pooler)
- `frontend/src/lib/db-server.ts` — pg Pool, server-side only
- `frontend/src/lib/schema.ts` — Drizzle ORM schema definitions
- RLS disabled — browser → Next.js API Routes → Supabase

## Migrations

- `001_add_indexes.sql`, `003_exercise_log_mode.sql` (mode + duration on exercise_logs), `004_exercise_default_mode.sql` (default_mode on exercises), `add_email_to_users` (email on users, via Supabase MCP)
