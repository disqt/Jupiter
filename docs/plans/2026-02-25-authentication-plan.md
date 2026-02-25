# Authentication System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add user authentication with private data per user, invite-code registration, and a profile page.

**Architecture:** JWT-based auth with bcrypt password hashing. Auth middleware on Express protects all API routes. Frontend uses an AuthProvider context that stores the token in localStorage and wraps the app. All existing queries are scoped by `user_id`.

**Tech Stack:** Express.js, bcrypt, jsonwebtoken, express-rate-limit, Next.js 14, React Context, Tailwind CSS

---

### Task 1: Install backend dependencies

**Files:**
- Modify: `backend/package.json`

**Step 1: Install npm packages**

Run:
```bash
cd backend && npm install bcrypt jsonwebtoken express-rate-limit && npm install -D @types/bcrypt @types/jsonwebtoken
```

**Step 2: Add env vars to `backend/.env`**

Add these two lines (keep existing vars):
```
JWT_SECRET=<generate-a-random-64-char-hex-string>
INVITE_CODE=jupiter2026
```

Generate the secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Step 3: Commit**

```bash
git add backend/package.json backend/package-lock.json
git commit -m "feat(auth): install bcrypt, jsonwebtoken, express-rate-limit"
```

---

### Task 2: Database migration — users table + user_id columns

**Files:**
- Modify: `backend/src/schema.ts`

Apply via Supabase MCP (`mcp__supabase__apply_migration`) since the DB is hosted on Supabase.

**Step 1: Wipe existing data**

Use `mcp__supabase__execute_sql`:
```sql
TRUNCATE exercise_logs, cycling_details, workouts, exercises CASCADE;
```

**Step 2: Apply migration — create users table and add user_id columns**

Use `mcp__supabase__apply_migration` with name `add_users_and_user_id`:
```sql
-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add user_id to workouts
ALTER TABLE workouts ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);

-- Add user_id to exercises
ALTER TABLE exercises ADD COLUMN user_id INTEGER NOT NULL REFERENCES users(id);
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
```

**Step 3: Update Drizzle schema**

Update `backend/src/schema.ts` to match:

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

**Step 4: Commit**

```bash
git add backend/src/schema.ts
git commit -m "feat(auth): add users table and user_id columns to schema"
```

---

### Task 3: Auth middleware

**Files:**
- Create: `backend/src/middleware/auth.ts`

**Step 1: Create the middleware**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

const PUBLIC_PATHS = ['/api/auth/login', '/api/auth/register', '/api/health'];

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (PUBLIC_PATHS.includes(req.path)) {
    next();
    return;
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
```

**Step 2: Commit**

```bash
git add backend/src/middleware/auth.ts
git commit -m "feat(auth): add JWT auth middleware"
```

---

### Task 4: Auth routes

**Files:**
- Create: `backend/src/routes/auth.ts`

**Step 1: Create auth routes**

```typescript
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import pool from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || '';
const INVITE_CODE = process.env.INVITE_CODE || '';
const SALT_ROUNDS = 12;

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many attempts, try again later' },
});

router.use(authLimiter);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nickname, password, invite_code } = req.body;

    if (!nickname || !password || !invite_code) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (invite_code !== INVITE_CODE) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }

    if (nickname.length < 2 || nickname.length > 50) {
      return res.status(400).json({ error: 'Nickname must be 2-50 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if nickname already taken
    const existing = await pool.query('SELECT id FROM users WHERE nickname = $1', [nickname]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Nickname already taken' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      'INSERT INTO users (nickname, password_hash) VALUES ($1, $2) RETURNING id, nickname, created_at',
      [nickname, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;

    if (!nickname || !password) {
      return res.status(400).json({ error: 'Nickname and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE nickname = $1', [nickname]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid nickname or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid nickname or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/me
router.put('/me', async (req, res) => {
  try {
    const { nickname, password, current_password } = req.body;

    // Verify current password
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (current_password) {
      const valid = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    if (nickname) {
      if (nickname.length < 2 || nickname.length > 50) {
        return res.status(400).json({ error: 'Nickname must be 2-50 characters' });
      }
      const existing = await pool.query('SELECT id FROM users WHERE nickname = $1 AND id != $2', [nickname, req.userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Nickname already taken' });
      }
      await pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [nickname, req.userId]);
    }

    if (password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password required to change password' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.userId]);
    }

    const updated = await pool.query('SELECT id, nickname, created_at FROM users WHERE id = $1', [req.userId]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

**Step 2: Commit**

```bash
git add backend/src/routes/auth.ts
git commit -m "feat(auth): add register, login, me, update profile routes"
```

---

### Task 5: Wire middleware + auth routes into Express app, scope existing routes by user_id

**Files:**
- Modify: `backend/src/index.ts`
- Modify: `backend/src/routes/workouts.ts`
- Modify: `backend/src/routes/exercises.ts`
- Modify: `backend/src/routes/stats.ts`

**Step 1: Update `backend/src/index.ts`**

Add auth middleware and auth routes:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import workoutRoutes from './routes/workouts';
import exerciseRoutes from './routes/exercises';
import statsRoutes from './routes/stats';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

**Step 2: Update `backend/src/routes/workouts.ts`**

Add `req.userId!` to all queries:

- **GET /**: Add `AND w.user_id = $2` to the WHERE clause, pass `[month, req.userId]`
- **GET /:id**: Add `AND user_id = $2` to SELECT, pass `[id, req.userId]`
- **POST /**: Add `user_id` to INSERT: `INSERT INTO workouts (date, type, notes, user_id) VALUES ($1, $2, $3, $4)`, pass `[date, type, notes || null, req.userId]`
- **PUT /:id**: Add `AND user_id = $2` to UPDATE WHERE clause
- **DELETE /:id**: Add `AND user_id = $2` to DELETE WHERE clause

**Step 3: Update `backend/src/routes/exercises.ts`**

- **GET /**: Add `WHERE user_id = $1`, pass `[req.userId]`
- **POST /**: Add `user_id` to INSERT: `INSERT INTO exercises (name, muscle_group, user_id) VALUES ($1, $2, $3)`, pass `[name, muscle_group, req.userId]`
- **PUT /:id**: Add `AND user_id = $2` to WHERE
- **DELETE /:id**: Add `AND user_id = $2` to WHERE
- **GET /:id/last-performance**: Add `AND w.user_id = $2` to the subquery and outer query, pass `[id, req.userId]`

**Step 4: Update `backend/src/routes/stats.ts`**

- **GET /monthly**: Add `AND w.user_id = $2` to WHERE, pass `[month, req.userId]`
- **GET /weekly-progress**: Add `WHERE user_id = $1` to both CTEs, pass `[req.userId]`

**Step 5: Verify backend compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add backend/src/index.ts backend/src/routes/workouts.ts backend/src/routes/exercises.ts backend/src/routes/stats.ts
git commit -m "feat(auth): wire auth middleware, scope all routes by user_id"
```

---

### Task 6: Frontend — i18n strings for auth

**Files:**
- Modify: `frontend/src/lib/i18n.tsx`

**Step 1: Add all auth-related translations**

Add to the `fr` object (after the existing keys, before the closing `}`):

```typescript
// Auth
login: 'Connexion',
register: 'Créer un compte',
nickname: 'Pseudo',
password: 'Mot de passe',
confirmPassword: 'Confirmer le mot de passe',
inviteCode: 'Code d\'invitation',
loginButton: 'Se connecter',
registerButton: 'Créer mon compte',
noAccount: 'Pas encore de compte ?',
hasAccount: 'Déjà un compte ?',
logout: 'Déconnexion',

// Profile
profile: 'Profil',
currentPassword: 'Mot de passe actuel',
newPassword: 'Nouveau mot de passe',
saveChanges: 'Enregistrer',
profileUpdated: 'Profil mis à jour',

// Auth errors
errorInvalidCredentials: 'Pseudo ou mot de passe incorrect',
errorNicknameTaken: 'Ce pseudo est déjà pris',
errorInvalidInviteCode: 'Code d\'invitation invalide',
errorPasswordTooShort: 'Le mot de passe doit faire au moins 6 caractères',
errorCurrentPasswordRequired: 'Le mot de passe actuel est requis',
errorCurrentPasswordWrong: 'Le mot de passe actuel est incorrect',
errorAllFieldsRequired: 'Tous les champs sont requis',
```

Add matching keys to the `en` object:

```typescript
// Auth
login: 'Log in',
register: 'Create account',
nickname: 'Nickname',
password: 'Password',
confirmPassword: 'Confirm password',
inviteCode: 'Invite code',
loginButton: 'Log in',
registerButton: 'Create account',
noAccount: 'Don\'t have an account?',
hasAccount: 'Already have an account?',
logout: 'Log out',

// Profile
profile: 'Profile',
currentPassword: 'Current password',
newPassword: 'New password',
saveChanges: 'Save changes',
profileUpdated: 'Profile updated',

// Auth errors
errorInvalidCredentials: 'Invalid nickname or password',
errorNicknameTaken: 'This nickname is already taken',
errorInvalidInviteCode: 'Invalid invite code',
errorPasswordTooShort: 'Password must be at least 6 characters',
errorCurrentPasswordRequired: 'Current password is required',
errorCurrentPasswordWrong: 'Current password is incorrect',
errorAllFieldsRequired: 'All fields are required',
```

**Step 2: Commit**

```bash
git add frontend/src/lib/i18n.tsx
git commit -m "feat(auth): add i18n strings for auth pages and profile"
```

---

### Task 7: Frontend — AuthProvider context + API client changes

**Files:**
- Create: `frontend/src/lib/auth.tsx`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/components/Providers.tsx`

**Step 1: Create `frontend/src/lib/auth.tsx`**

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: number;
  nickname: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (nickname: string, password: string) => Promise<void>;
  register: (nickname: string, password: string, inviteCode: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: () => {},
});

const PUBLIC_PATHS = ['/login', '/register'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Validate token on mount
  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (!saved) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${saved}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setToken(saved);
        setUser({ id: data.id, nickname: data.nickname });
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  // Redirect logic
  useEffect(() => {
    if (loading) return;
    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace('/login');
    }
    if (user && PUBLIC_PATHS.includes(pathname)) {
      router.replace('/');
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async (nickname: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (nickname: string, password: string, inviteCode: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password, invite_code: inviteCode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  const updateUser = useCallback((u: User) => setUser(u), []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Step 2: Update `frontend/src/lib/api.ts` — add auth header + 401 handling**

Replace the `request` function:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}
```

**Step 3: Update `frontend/src/components/Providers.tsx`**

```typescript
'use client';

import { I18nProvider } from '@/lib/i18n';
import { AuthProvider } from '@/lib/auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>{children}</AuthProvider>
    </I18nProvider>
  );
}
```

**Step 4: Commit**

```bash
git add frontend/src/lib/auth.tsx frontend/src/lib/api.ts frontend/src/components/Providers.tsx
git commit -m "feat(auth): add AuthProvider, update API client with auth headers"
```

---

### Task 8: Frontend — Login page

**Files:**
- Create: `frontend/src/app/login/page.tsx`

**Step 1: Create login page**

A centered card with nickname + password fields, login button, link to register. Uses `useAuth().login()`. Shows error message on failure. Styled consistently with the app's existing design (dark theme, `bg-bg-card`, `border-border`, `rounded-card`, accent colors).

The page should NOT render `BottomNav` — this requires updating `layout.tsx` to conditionally hide the nav on auth pages (or the login/register pages handle it with their own full-screen layout).

**Step 2: Commit**

```bash
git add frontend/src/app/login/page.tsx
git commit -m "feat(auth): add login page"
```

---

### Task 9: Frontend — Register page

**Files:**
- Create: `frontend/src/app/register/page.tsx`

**Step 1: Create register page**

Same layout as login but with nickname + password + invite code fields. Uses `useAuth().register()`. Shows translated error messages. Link to login page.

**Step 2: Commit**

```bash
git add frontend/src/app/register/page.tsx
git commit -m "feat(auth): add register page"
```

---

### Task 10: Frontend — Profile page

**Files:**
- Create: `frontend/src/app/profile/page.tsx`

**Step 1: Create profile page**

Sections:
1. Nickname display + edit field
2. Change password (current password + new password fields)
3. Save button (calls `PUT /api/auth/me`)
4. Logout button (calls `useAuth().logout()`)

Uses the same card styling as the rest of the app. Back button to go to `/`.

**Step 2: Commit**

```bash
git add frontend/src/app/profile/page.tsx
git commit -m "feat(auth): add profile page"
```

---

### Task 11: Frontend — Update layout to hide nav on auth pages + show nickname in header

**Files:**
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/components/BottomNav.tsx`
- Modify: `frontend/src/components/Calendar.tsx`

**Step 1: Update `layout.tsx`**

The layout currently always shows `BottomNav`. We need to conditionally hide it on `/login` and `/register`. Since `layout.tsx` is a server component, move the conditional logic into `BottomNav` itself (it already has access to `usePathname`).

In `BottomNav.tsx`, add at the top of the component:
```typescript
const pathname = usePathname(); // already exists
if (pathname === '/login' || pathname === '/register') return null;
```

**Step 2: Update Calendar.tsx header — show nickname**

In the mobile header section (the `<h1>` area), add below "Jupiter Tracker":
```tsx
<div className="text-xs text-text-muted">{user?.nickname}</div>
```

Make the nickname tappable to go to `/profile`:
```tsx
<Link href="/profile" className="text-xs text-text-muted no-underline">{user?.nickname}</Link>
```

Import `useAuth` at the top:
```typescript
import { useAuth } from '@/lib/auth';
```

And in the component: `const { user } = useAuth();`

**Step 3: Update BottomNav.tsx sidebar — add logout button + nickname**

In the desktop sidebar, add the nickname below the title, and a logout button at the bottom:
```tsx
// After the title
<Link href="/profile" className="text-xs text-text-muted no-underline mb-2">{user?.nickname}</Link>

// At the bottom of the sidebar (use flex + mt-auto)
<button onClick={logout} className="mt-auto text-sm text-text-muted ...">
  {t.logout}
</button>
```

**Step 4: Commit**

```bash
git add frontend/src/app/layout.tsx frontend/src/components/BottomNav.tsx frontend/src/components/Calendar.tsx
git commit -m "feat(auth): hide nav on auth pages, show nickname in header, add logout to sidebar"
```

---

### Task 12: Verify full flow end-to-end

**Step 1: Start both servers**

Run: `cd /Users/sylvainmerle/Documents/Sport && npm run dev`

**Step 2: Test registration**

Open browser → should redirect to `/login` → click "Create account" → fill nickname, password, invite code → submit → should redirect to `/`.

**Step 3: Test login**

Logout → login with the created credentials → should see the calendar.

**Step 4: Test data isolation**

Create a workout → logout → register a second user → verify the second user sees no workouts.

**Step 5: Test profile**

Navigate to profile → change nickname → verify header updates → change password → logout → login with new password.

**Step 6: Run type checks**

```bash
cd backend && npx tsc --noEmit
cd ../frontend && npx tsc --noEmit
```

**Step 7: Final commit if any fixes needed**

```bash
git add -A
git commit -m "feat(auth): fix issues from e2e verification"
```
