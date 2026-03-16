---
paths:
  - "frontend/src/app/api/**"
  - "frontend/src/lib/api.ts"
  - "frontend/src/lib/validations.ts"
---

# API Endpoints (Next.js API Route Handlers)

**Auth (public — no Bearer token):**
- `POST /api/auth/register` — email, nickname, password. Returns JWT + user. Seeds 58 default exercises.
- `POST /api/auth/login` — nickname, password. Returns JWT + user.
- `GET /api/auth/me` — current user info from JWT.
- `PUT /api/auth/me` — update nickname/password (requires current_password for password change).
- `DELETE /api/auth/account` — cascade delete all user data (transaction).

**Protected (require `Authorization: Bearer <token>`):**
- `GET/POST /api/workouts`, `GET/PUT/PATCH/DELETE /api/workouts/:id` — month filter: `?month=YYYY-MM`. PATCH updates only `custom_emoji`/`custom_name`.
- `GET/POST /api/exercises`, `PUT/DELETE /api/exercises/:id`
- `GET /api/exercises/:id/last-performance` — sets from most recent session (includes mode/duration).
- `GET /api/exercises/:id/history` — sets from last 3 sessions.
- `GET /api/home` — today, week, medals, insights, streak in one call.
- `GET /api/stats/monthly?month=YYYY-MM` or `?year=YYYY` — totals, counts by type, distance, elevation, active days.
- `GET /api/stats/weekly-progress` — week_count and total_medals.
- `GET /api/stats/weekly-medals?month=YYYY-MM` — medals per week for calendar highlights.
- `GET /api/stats/medals-history` — all weekly medal data with cumulative count.
- `GET /api/stats/distance-by-type?month=YYYY-MM` or `?year=YYYY` — distance per sport per period.
- `GET /api/stats/strength-volume?month=YYYY-MM` or `?year=YYYY` — musculation tonnage.

## Validation

All POST/PUT routes validate with Zod schemas (`frontend/src/lib/validations.ts`). Returns 400 with field errors on invalid input.

## Frontend API Client (`frontend/src/lib/api.ts`)

Typed fetch functions. All requests include `Authorization: Bearer <token>`. On 401, token cleared + redirect to `/`.
