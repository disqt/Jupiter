---
paths:
  - "frontend/src/lib/auth.tsx"
  - "frontend/src/lib/auth-api.ts"
  - "frontend/src/app/api/auth/**"
  - "frontend/src/app/profile/**"
  - "frontend/src/middleware.ts"
---

# Authentication

- **JWT-based** — token in `localStorage` (key: `token`), 30-day expiry, payload: `{ userId }`
- **AuthProvider** (`frontend/src/lib/auth.tsx`) — React Context. Provides `user`, `token`, `login()`, `register()`, `logout()`, `updateUser()`, `isGuest`. Validates token on mount via `GET /api/auth/me`.
- **Guest mode** — app usable without account. `isGuest` flag in AuthContext. Workouts in localStorage (`guest-workouts`), exercises in `guest-exercises`.
- **Account creation** — bottom sheet on profile page (email + nickname + password, no invite code). Migrates guest data to DB on registration/login.
- **Account deletion** — `DELETE /api/auth/account` — cascade deletes all user data in a transaction. Confirmation modal on profile page.
- **Middleware** (`frontend/src/middleware.ts`) — blocks unauthenticated API calls at the edge (except `/api/auth/*` and `/api/health`)
- **Auth API helper** (`frontend/src/lib/auth-api.ts`) — `authenticate(request)` extracts userId from JWT, `getJwtSecret()` throws if env var missing, `handleApiError()` for consistent error responses
- **Rate limiting** — in-memory, 5 req/min on auth endpoints (`frontend/src/lib/rate-limit.ts`)
- **Password hashing** — bcrypt, 12 salt rounds
- **Exercise seeding** — `seedDefaultExercises(userId)` inserts 58 exercises on registration
- **API 401 guard** — `api.ts` `request()` redirects to `/` on 401. Components MUST check `isGuest` before calling API functions to avoid infinite reload loops.
