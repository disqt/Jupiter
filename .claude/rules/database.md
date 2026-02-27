---
paths:
  - "backend/src/schema.ts"
  - "backend/src/db.ts"
  - "backend/src/routes/**"
  - "backend/drizzle/**"
---

# Database (Supabase)

Dev database hosted on Supabase (EU West — Ireland). MCP server `mcp__supabase` configured for direct access.

## Tables (schema `public`)

- `users` — id, nickname (unique), password_hash, created_at
- `workouts` — id, user_id (FK → users), date, type (CHECK: `velo`|`musculation`|`course`|`natation`|`custom`), notes, custom_emoji, custom_name, created_at
- `cycling_details` — id, workout_id (FK CASCADE), duration, distance, elevation, ride_type
- `workout_details` — id, workout_id (FK CASCADE), duration, distance, elevation, laps. Used by course/natation/custom types.
- `exercises` — id, user_id (FK → users), name, muscle_group (58 defaults seeded per user on registration)
- `exercise_logs` — id, workout_id (FK CASCADE), exercise_id (FK CASCADE), set_number, reps, weight

## Supabase MCP tools

- `mcp__supabase__list_tables` — list tables
- `mcp__supabase__execute_sql` — queries (SELECT, INSERT, UPDATE, DELETE)
- `mcp__supabase__apply_migration` — DDL (CREATE TABLE, ALTER TABLE, etc.)
- `mcp__supabase__get_advisors` — security/performance checks

## Connection

- Backend uses session pooler URL (`aws-1-eu-west-1.pooler.supabase.com:5432`)
- Direct connection (`db.xxx.supabase.co`) doesn't resolve (IPv6 issue)
- RLS disabled — frontend goes through Express API, no direct browser→Supabase

## Schema changes workflow

1. Modify `backend/src/schema.ts`
2. `npm run db:generate` → review generated SQL
3. Apply via `mcp__supabase__apply_migration` (Supabase) or `npm run db:migrate` (local)
