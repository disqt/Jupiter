# Authentication System Design

## Goal

Add user authentication so each person has private workouts. Simple account creation (nickname + password) with an invite code to restrict signups to friends.

## Database

New `users` table:
- `id` (serial PK)
- `nickname` (varchar 50, unique, not null)
- `password_hash` (varchar 255, not null)
- `created_at` (timestamp, default now)

Schema changes to existing tables:
- `workouts`: add `user_id` (integer FK → users.id, not null)
- `exercises`: add `user_id` (integer FK → users.id, not null)
- Wipe existing data (fresh start agreed upon)

## Backend

### New dependencies
- `bcrypt` — password hashing
- `jsonwebtoken` — JWT token creation/verification
- `express-rate-limit` — rate limiting auth endpoints

### Auth routes (`/api/auth`)
- `POST /register` — nickname, password, invite_code. Validates invite code against `INVITE_CODE` env var. Hashes password with bcrypt (salt rounds: 12). Returns JWT + user info.
- `POST /login` — nickname, password. Verifies with bcrypt. Returns JWT + user info.
- `GET /me` — returns current user (id, nickname) from JWT.
- `PUT /me` — update nickname and/or password.

### Auth middleware
- Verifies JWT on all `/api/*` routes except `/auth/login`, `/auth/register`, `/api/health`.
- Extracts `userId` from token and sets `req.userId`.
- Returns 401 if token missing/invalid/expired.

### Existing route changes
- All workout queries filter by `WHERE user_id = req.userId`.
- All exercise queries filter by `WHERE user_id = req.userId`.
- Stats queries scoped to user.

### Rate limiting
- 5 requests/min per IP on `/api/auth/register` and `/api/auth/login`.

### JWT
- Secret from env var `JWT_SECRET`.
- Token expiry: 30 days.
- Payload: `{ userId: number }`.

## Frontend

### New pages
- `/login` — nickname + password form, link to register.
- `/register` — nickname + password + invite code form, link to login.
- `/profile` — change nickname, change password, logout button.

### Auth context (`AuthProvider`)
- Wraps app in providers.
- Stores JWT in `localStorage` (key: `token`).
- Provides: `user`, `token`, `login()`, `register()`, `logout()`, `loading`.
- On mount: reads token from localStorage, calls `GET /api/auth/me` to validate.
- `logout()`: clears token + redirects to `/login`.

### Route protection
- If no valid token, redirect to `/login`.
- `/login` and `/register` redirect to `/` if already authenticated.

### API client changes
- All `fetch()` calls include `Authorization: Bearer <token>` header.
- On 401 response: clear token, redirect to login.

### UI changes
- Header: show user nickname below "Jupiter Tracker".
- Desktop sidebar: logout button at bottom.
- Profile page: accessible from tapping the nickname.

### i18n
All new strings added to both FR and EN in `i18n.tsx`:
- Login/register form labels, buttons, errors
- Profile page labels
- Invite code label
- Logout button
- Error messages (wrong password, nickname taken, invalid invite code)
