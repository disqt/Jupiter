---
paths:
  - "backend/src/routes/**"
  - "frontend/src/lib/api.ts"
---

# API Endpoints

**Auth (public):**
- `POST /api/auth/register` — nickname, password, invite_code. Returns JWT + user. Seeds 58 default exercises.
- `POST /api/auth/login` — nickname, password. Returns JWT + user.
- `GET /api/auth/me` — current user info from JWT.
- `PUT /api/auth/me` — update nickname/password (requires current_password for password change).

**Protected (require `Authorization: Bearer <token>`):**
- `GET/POST /api/workouts`, `GET/PUT/PATCH/DELETE /api/workouts/:id` — month filter: `?month=YYYY-MM`. Scoped by `user_id`. PATCH updates only `custom_emoji`/`custom_name`.
- `GET/POST /api/exercises`, `PUT/DELETE /api/exercises/:id` — scoped by `user_id`.
- `GET /api/exercises/:id/last-performance` — sets/reps/weight from most recent session.
- `GET /api/exercises/:id/history` — sets from last 3 sessions.
- `GET /api/stats/monthly?month=YYYY-MM` or `?year=YYYY` — returns `{ total_count, counts_by_type: Record<type, count>, total_distance_km, total_elevation_m, active_days }`.
- `GET /api/stats/weekly-progress` — `week_count` and `total_medals`.
- `GET /api/stats/weekly-medals?month=YYYY-MM` — medals per week overlapping the month (for calendar highlights).
- `GET /api/stats/medals-history` — all weekly medal data with cumulative count: `[{ week_start, workout_count, medals, cumulative }]`.
- `GET /api/stats/distance-by-type?month=YYYY-MM` or `?year=YYYY` — distance per sport per period: `[{ period_num, type, distance }]`.
- `GET /api/stats/strength-volume?month=YYYY-MM` or `?year=YYYY` — musculation tonnage: `{ total_tonnage, exercise_count, total_sets }`.

## Frontend API Client (`frontend/src/lib/api.ts`)

All backend communication goes through typed functions. All requests include `Authorization: Bearer <token>` via `getToken()`. On 401, token cleared + redirect to `/login`.

Functions: `fetchWorkouts(month)`, `fetchWorkout(id)`, `createWorkout(data)`, `updateWorkout(id, data)`, `patchWorkoutMeta(id, data)`, `deleteWorkout(id)`, `fetchExercises()`, `createExercise(name, muscleGroup)`, `fetchLastPerformance(id)`, `fetchExerciseHistory(id)`, `fetchMonthlyStats(month)`, `fetchYearlyStats(year)`, `fetchWeeklyProgress()`, `fetchWeeklyMedals(month)`, `fetchMedalsHistory()`, `fetchDistanceByType(params)`, `fetchStrengthVolume(params)`.

`createWorkout`/`updateWorkout` accept: `cycling_details` (velo), `exercise_logs` (musculation), or `workout_details` (course/natation/marche/custom), plus optional `custom_emoji`/`custom_name`.
`patchWorkoutMeta(id, { custom_emoji, custom_name })` — lightweight update for emoji/name only, used by WorkoutFormHeader on existing workouts.
