---
paths:
  - "backend/src/middleware/**"
  - "backend/src/routes/auth.ts"
  - "frontend/src/lib/auth.tsx"
  - "frontend/src/app/login/**"
  - "frontend/src/app/register/**"
---

# Authentication

- **JWT-based** — token in `localStorage` (key: `token`), 30-day expiry, payload: `{ userId }`
- **AuthProvider** (`frontend/src/lib/auth.tsx`) — React Context. Provides `user`, `token`, `login()`, `register()`, `logout()`, `updateUser()`. Validates token on mount via `GET /api/auth/me`. Redirects to `/login` if unauthenticated.
- **Auth middleware** (`backend/src/middleware/auth.ts`) — verifies JWT on all routes except `/api/auth/login`, `/api/auth/register`, `/api/health`. Sets `req.userId`.
- **Invite code** — registration requires `invite_code` matching `INVITE_CODE` env var
- **Rate limiting** — 5 req/min on auth endpoints via `express-rate-limit`
- **Password hashing** — bcrypt, 12 salt rounds
- **Exercise seeding** — `seedDefaultExercises(userId)` in `backend/src/seedExercises.ts` inserts 58 exercises on registration
