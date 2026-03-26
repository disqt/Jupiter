# Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen account creation flow and a 4-screen swipeable onboarding wizard shown to all users (new + existing).

**Architecture:** Two independent features. (1) A `/register` page replaces the bottom-sheet registration. (2) An `OnboardingFlow` overlay component is shown when `has_seen_onboarding` is false on the user record. The onboarding sets the user's weekly goal and marks completion via API.

**Tech Stack:** Next.js 14, React, Tailwind CSS, PostgreSQL (Supabase), touch events for swipe.

---

### Task 1: Database — add `has_seen_onboarding` column

**Files:**
- Modify: `frontend/src/lib/schema.ts:3-9`

- [ ] **Step 1: Add column via Supabase MCP**

Run SQL migration:
```sql
ALTER TABLE users ADD COLUMN has_seen_onboarding BOOLEAN NOT NULL DEFAULT FALSE;
```

This sets all existing users to `false` so they will also see the onboarding.

- [ ] **Step 2: Update Drizzle schema**

In `frontend/src/lib/schema.ts`, add the column to the users table:

```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nickname: varchar('nickname', { length: 50 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  hasSeenOnboarding: boolean('has_seen_onboarding').default(false).notNull(),
});
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/schema.ts
git commit -m "feat: add has_seen_onboarding column to users table"
```

---

### Task 2: API — expose `has_seen_onboarding` in auth endpoints

**Files:**
- Modify: `frontend/src/app/api/auth/me/route.ts`
- Modify: `frontend/src/app/api/auth/register/route.ts`
- Modify: `frontend/src/lib/auth.tsx`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Update GET /api/auth/me to return `has_seen_onboarding`**

In `frontend/src/app/api/auth/me/route.ts`, change the SELECT in the GET handler:

```typescript
const result = await pool.query('SELECT id, nickname, created_at, has_seen_onboarding FROM users WHERE id = $1', [userId]);
```

- [ ] **Step 2: Add PUT /api/auth/me support for `has_seen_onboarding`**

In the same file's PUT handler, add handling after the password update block (before the final SELECT):

```typescript
    // Update onboarding flag
    if (typeof body.has_seen_onboarding === 'boolean') {
      await pool.query('UPDATE users SET has_seen_onboarding = $1 WHERE id = $2', [body.has_seen_onboarding, userId]);
    }
```

Also update the final SELECT to include the column:

```typescript
    const updated = await pool.query('SELECT id, nickname, created_at, has_seen_onboarding FROM users WHERE id = $1', [userId]);
```

- [ ] **Step 3: Update User type in auth.tsx**

In `frontend/src/lib/auth.tsx`, add the field to the User interface:

```typescript
interface User {
  id: number;
  nickname: string;
  email?: string;
  has_seen_onboarding?: boolean;
}
```

- [ ] **Step 4: Update AuthProvider to store `has_seen_onboarding`**

In the useEffect that fetches `/api/auth/me`, include the new field when setting user:

```typescript
setUser({ id: data.id, nickname: data.nickname, has_seen_onboarding: data.has_seen_onboarding });
```

- [ ] **Step 5: Add `completeOnboarding` function to api.ts**

In `frontend/src/lib/api.ts`, add after the `setUserGoal` function:

```typescript
export async function completeOnboarding(): Promise<void> {
  await request('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify({ has_seen_onboarding: true }),
  });
}
```

- [ ] **Step 6: Verify the API works**

Start dev server, create a test request:
```bash
npm run dev
```
Manually verify via browser devtools or curl that `GET /api/auth/me` now returns `has_seen_onboarding`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/api/auth/me/route.ts frontend/src/lib/auth.tsx frontend/src/lib/api.ts
git commit -m "feat: expose has_seen_onboarding in auth API"
```

---

### Task 3: Register page — full-screen account creation

**Files:**
- Create: `frontend/src/app/register/page.tsx`
- Modify: `frontend/src/app/profile/page.tsx` (update RegisterSheet trigger to navigate to `/register`)

- [ ] **Step 1: Create the register page**

Create `frontend/src/app/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import TextInput from '@/components/TextInput';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function migrateGuestData() {
  const guestWorkoutsRaw = localStorage.getItem('guest-workouts');
  const guestExercisesRaw = localStorage.getItem('guest-exercises');
  const guestTemplatesRaw = localStorage.getItem('guest-templates');

  localStorage.removeItem('guest-workouts');
  localStorage.removeItem('guest-exercises');
  localStorage.removeItem('guest-templates');

  if (!guestWorkoutsRaw && !guestExercisesRaw && !guestTemplatesRaw) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Migrate exercises first to get ID mapping
  const exerciseIdMap = new Map<string, number>();
  if (guestExercisesRaw) {
    const guestExercises = JSON.parse(guestExercisesRaw);
    for (const ex of guestExercises) {
      try {
        const res = await fetch(`${API_URL}/api/exercises`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: ex.name,
            muscle_group: ex.muscle_group,
            catalog_id: ex.catalog_id || null,
            default_mode: ex.default_mode || 'reps-weight',
          }),
        });
        if (res.ok) {
          const created = await res.json();
          exerciseIdMap.set(ex.id, created.id);
        }
      } catch {}
    }
  }

  // Migrate workouts
  if (guestWorkoutsRaw) {
    const guestWorkouts = JSON.parse(guestWorkoutsRaw);
    for (const w of guestWorkouts) {
      try {
        const exercises = (w.exercises || []).map((ex: { exercise_id: string; sets: unknown[]; notes?: string; mode?: string }) => ({
          ...ex,
          exercise_id: exerciseIdMap.get(ex.exercise_id) || ex.exercise_id,
        }));
        await fetch(`${API_URL}/api/workouts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...w, id: undefined, exercises }),
        });
      } catch {}
    }
  }

  // Migrate templates
  if (guestTemplatesRaw) {
    const guestTemplates = JSON.parse(guestTemplatesRaw);
    for (const t of guestTemplates) {
      try {
        const exercises = (t.exercises || []).map((ex: { exercise_id: string; sets: number; reps: number; mode?: string }) => ({
          ...ex,
          exercise_id: exerciseIdMap.get(ex.exercise_id) || ex.exercise_id,
        }));
        await fetch(`${API_URL}/api/templates`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ ...t, id: undefined, exercises }),
        });
      } catch {}
    }
  }
}

type Step = 'identity' | 'password';

export default function RegisterPage() {
  const { t } = useI18n();
  const { register } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('identity');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canContinue = email.trim().length > 0 && nickname.trim().length >= 2;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = password.length >= 6 && passwordsMatch && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      await register(nickname.trim(), password, email.trim());
      await migrateGuestData();
      router.push('/'); // Will trigger onboarding via AuthProvider
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.registerError || 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col items-center justify-center px-6">
      {step === 'identity' ? (
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏅</div>
            <h1 className="font-serif text-[28px] text-text">Jupiter Tracker</h1>
            <p className="text-[13px] text-muted mt-1">{t.registerTagline || 'Suis ta progression sportive'}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-2">
                Email
              </label>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-2">
                {t.registerNickname || "Nom d'utilisateur"}
              </label>
              <TextInput
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t.registerNicknamePlaceholder || 'Ton pseudo'}
                autoComplete="username"
              />
            </div>
          </div>

          <button
            onClick={() => { setError(''); setStep('password'); }}
            disabled={!canContinue}
            className="w-full mt-8 py-4 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-bg-card font-semibold text-[16px] disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {t.continue || 'Continuer'}
          </button>

          <p className="text-center text-[13px] text-muted mt-4">
            {t.alreadyHaveAccount || 'Déjà un compte ?'}{' '}
            <button onClick={() => router.push('/profile')} className="text-accent font-medium">
              {t.loginLink || 'Se connecter'}
            </button>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <button
            onClick={() => setStep('identity')}
            className="text-secondary text-[14px] mb-6 flex items-center gap-1"
          >
            ← {t.back || 'Retour'}
          </button>

          <h1 className="font-serif text-[26px] text-text mb-1">
            {t.registerChoosePassword || 'Choisis un mot de passe'}
          </h1>
          <p className="text-[14px] text-secondary mb-6">
            {t.registerPasswordHint || 'Minimum 6 caractères.'}
          </p>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-2">
                {t.password || 'Mot de passe'}
              </label>
              <div className="relative">
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted text-[14px]"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-wider text-secondary mb-2">
                {t.confirmPassword || 'Confirmer'}
              </label>
              <div className="relative">
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  error={confirmPassword.length > 0 && !passwordsMatch}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted text-[14px]"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[13px] text-danger text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full mt-4 py-4 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-bg-card font-semibold text-[16px] disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              {submitting
                ? (t.registerCreating || 'Création...')
                : (t.registerCreateAccount || 'Créer mon compte')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update profile page to navigate to /register instead of opening bottom sheet**

In `frontend/src/app/profile/page.tsx`, in the `GuestProfileView` component, find the "Create Account" button (around line 377) and change:

```typescript
onClick={() => setShowRegister(true)}
```
to:
```typescript
onClick={() => router.push('/register')}
```

Add `useRouter` import if not already present, and remove the `showRegister` state and `<RegisterSheet>` render since they are no longer needed from this page. Keep `RegisterSheet` and `LoginSheet` components in the file for now — `LoginSheet` is still used.

- [ ] **Step 3: Verify register page renders**

Run `npm run dev`, navigate to `/register`. Verify both screens work (identity → password → back).

- [ ] **Step 4: Type check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/register/page.tsx frontend/src/app/profile/page.tsx
git commit -m "feat: add full-screen register page, replace bottom sheet"
```

---

### Task 4: Onboarding — swipe container component

**Files:**
- Create: `frontend/src/components/onboarding/SwipeContainer.tsx`

This is a reusable horizontal swipe container with dot indicators.

- [ ] **Step 1: Create SwipeContainer**

Create `frontend/src/components/onboarding/SwipeContainer.tsx`:

```typescript
'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';

interface SwipeContainerProps {
  children: ReactNode[];
  onComplete: () => void;
  dotColor?: string;
}

export default function SwipeContainer({ children, onComplete, dotColor = '#c9a96e' }: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = children.length;

  const goTo = useCallback((index: number) => {
    if (index >= total) {
      onComplete();
      return;
    }
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
    setOffsetX(0);
  }, [total, onComplete]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    // If vertical scroll is dominant, don't hijack
    if (!isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartRef.current = null;
      return;
    }

    setIsSwiping(true);
    // Resist at edges
    if ((currentIndex === 0 && deltaX > 0) || (currentIndex === total - 1 && deltaX < 0)) {
      setOffsetX(deltaX * 0.3);
    } else {
      setOffsetX(deltaX);
    }
  }, [currentIndex, total, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const threshold = 50;
    const velocity = Math.abs(offsetX) / (Date.now() - touchStartRef.current.time);

    if (offsetX < -threshold || velocity > 0.5 && offsetX < 0) {
      goTo(currentIndex + 1);
    } else if (offsetX > threshold || velocity > 0.5 && offsetX > 0) {
      goTo(currentIndex - 1);
    } else {
      setOffsetX(0);
    }
    touchStartRef.current = null;
    setIsSwiping(false);
  }, [offsetX, currentIndex, goTo]);

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-hidden" ref={containerRef}>
      {/* Dot indicators */}
      <div className="absolute top-[max(env(safe-area-inset-top,0px),12px)] left-0 right-0 z-10 flex justify-center gap-1.5 pt-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === currentIndex ? dotColor : '#2a2b32',
              boxShadow: i === currentIndex ? `0 0 8px ${dotColor}60` : 'none',
            }}
          />
        ))}
      </div>

      {/* Slides */}
      <div
        className="flex h-full"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${offsetX}px))`,
          transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children.map((child, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 overflow-y-auto">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

export function useSwipeNext() {
  // Utility: parent passes a goNext callback into each slide via context or props
  // For simplicity, each screen will receive a `onNext` prop instead
}
```

- [ ] **Step 2: Type check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/onboarding/SwipeContainer.tsx
git commit -m "feat: add SwipeContainer component for onboarding"
```

---

### Task 5: Onboarding — individual screen components

**Files:**
- Create: `frontend/src/components/onboarding/WelcomeScreen.tsx`
- Create: `frontend/src/components/onboarding/GoalScreen.tsx`
- Create: `frontend/src/components/onboarding/MedalScreen.tsx`
- Create: `frontend/src/components/onboarding/DiscoveryScreen.tsx`

- [ ] **Step 1: Create WelcomeScreen**

Create `frontend/src/components/onboarding/WelcomeScreen.tsx`:

```typescript
'use client';

import { useI18n } from '@/lib/i18n';

interface Props {
  username: string;
  onNext: () => void;
}

export default function WelcomeScreen({ username, onNext }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 relative">
      {/* Gold glows */}
      <div className="absolute top-[20%] left-[-10%] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(201,169,110,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(201,169,110,0.08),transparent_70%)] pointer-events-none" />

      <div className="text-[56px] mb-4">🏅</div>
      <h1 className="font-serif text-[30px] text-text text-center mb-3">
        {t.onboardingWelcome || 'Bienvenue,'} <span className="text-accent">{username}</span>
      </h1>
      <p className="text-[15px] text-secondary text-center leading-relaxed px-4 max-w-sm">
        {t.onboardingWelcomeText1 || 'Tu as fait le premier pas.'}
        <br /><br />
        {t.onboardingWelcomeText2pre || 'Ici, '}
        <span className="text-accent font-medium">{t.onboardingWelcomeHighlight1 || 'pas de compétition avec les autres'}</span>
        {t.onboardingWelcomeText2post || ' — seulement avec toi-même.'}
        <br /><br />
        {t.onboardingWelcomeText3pre || "L'objectif est simple : trouver "}
        <span className="text-accent font-medium">{t.onboardingWelcomeHighlight2 || 'ta motivation'}</span>
        {t.onboardingWelcomeText3post || ' et rester régulier.'}
      </p>

      <button
        onClick={onNext}
        className="w-full max-w-sm mt-auto mb-8 py-4 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-bg-card font-semibold text-[16px] active:scale-[0.98] transition-transform"
      >
        {t.continue || 'Continuer'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create GoalScreen**

Create `frontend/src/components/onboarding/GoalScreen.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { setUserGoal } from '@/lib/api';

const PRESETS = [
  { key: 'casual', target: 2, emoji: '🚶' },
  { key: 'regular', target: 3, emoji: '🏃' },
  { key: 'athlete', target: 5, emoji: '🏋️' },
] as const;

interface Props {
  onNext: () => void;
}

export default function GoalScreen({ onNext }: Props) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(3);
  const [saving, setSaving] = useState(false);

  async function handleValidate() {
    setSaving(true);
    try {
      await setUserGoal(selected);
    } catch {
      // Non-blocking — goal can be set later
    }
    setSaving(false);
    onNext();
  }

  const presetLabels: Record<string, { name: string; desc: string }> = {
    casual: { name: t.goalCasual || 'Occasionnel', desc: t.goalCasualDesc || '2 séances / semaine' },
    regular: { name: t.goalRegular || 'Régulier', desc: t.goalRegularDesc || '3 séances / semaine' },
    athlete: { name: t.goalAthlete || 'Sportif', desc: t.goalAthleteDesc || '5 séances / semaine' },
  };

  return (
    <div className="flex flex-col h-full px-6 pt-16">
      <h1 className="font-serif text-[26px] text-text mt-4">
        {t.onboardingGoalTitle || 'Ton objectif'}
      </h1>
      <p className="text-[14px] text-secondary leading-relaxed mt-2 mb-4">
        {t.onboardingGoalSubtitle || 'Combien de séances veux-tu faire par semaine ?'}
      </p>

      <div className="bg-bg-card border-l-[3px] border-accent rounded-r-[10px] px-4 py-3 mb-4">
        <p className="text-[13px] text-secondary leading-relaxed">
          {t.onboardingGoalCallout1pre || "L'important c'est la "}
          <span className="text-accent font-medium">{t.onboardingGoalCalloutHighlight1 || 'régularité'}</span>
          {t.onboardingGoalCallout1post || ", pas l'intensité. Choisis un objectif "}
          <span className="text-accent font-medium">{t.onboardingGoalCalloutHighlight2 || 'réaliste'}</span>
          {t.onboardingGoalCallout2 || ' — tu pourras le modifier à tout moment.'}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {PRESETS.map((preset) => {
          const isSelected = selected === preset.target;
          const label = presetLabels[preset.key];
          return (
            <button
              key={preset.key}
              onClick={() => setSelected(preset.target)}
              className={`flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] transition-all duration-150 active:scale-[0.98] ${
                isSelected
                  ? 'border-accent bg-accent/[0.06]'
                  : 'border-border bg-bg-card'
              }`}
            >
              <div className={`w-11 h-11 rounded-[10px] flex items-center justify-center text-2xl ${
                isSelected ? 'bg-accent/20' : 'bg-bg-elevated'
              }`}>
                {preset.emoji}
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold">{label.name}</span>
                  {preset.key === 'regular' && (
                    <span className="text-[10px] font-semibold bg-accent/20 text-accent px-2 py-0.5 rounded-md">
                      {t.onboardingRecommended || 'recommandé'}
                    </span>
                  )}
                </div>
                <span className="text-[12px] text-secondary">{label.desc}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent shadow-[inset_0_0_0_3px_#0e0f11]'
                  : 'border-border'
              }`} />
            </button>
          );
        })}
      </div>

      <p className="text-[12px] text-muted text-center italic mt-3">
        {t.onboardingGoalNote || 'Personnalisable de 1 à 7 dans les réglages'}
      </p>

      <button
        onClick={handleValidate}
        disabled={saving}
        className="w-full mt-auto mb-8 py-4 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-bg-card font-semibold text-[16px] active:scale-[0.98] transition-transform disabled:opacity-40"
      >
        {saving
          ? (t.saving || 'Enregistrement...')
          : (t.onboardingGoalValidate || 'Valider mon objectif')}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Create MedalScreen**

Create `frontend/src/components/onboarding/MedalScreen.tsx`:

```typescript
'use client';

import { useI18n } from '@/lib/i18n';

interface Props {
  onNext: () => void;
}

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const CHECKED = [true, false, true, false, true, false, false];

export default function MedalScreen({ onNext }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col h-full px-6 pt-16">
      <h1 className="font-serif text-[26px] text-text mt-4">
        {t.onboardingMedalTitle || 'Tes médailles'}
      </h1>
      <p className="text-[14px] text-secondary leading-relaxed mt-2 mb-5">
        {t.onboardingMedalText || "Chaque semaine où tu atteins ton objectif, tu gagnes une médaille. C'est notre façon de célébrer ta régularité."}
      </p>

      <div className="flex justify-center my-5">
        <div className="text-[56px] drop-shadow-[0_4px_12px_rgba(201,169,110,0.3)]">🏅</div>
      </div>

      <div className="bg-bg-card border border-border rounded-[14px] p-4 mb-4">
        <p className="text-[12px] text-secondary text-center font-medium mb-3">
          {t.onboardingMedalExample || 'Exemple — objectif 3×/semaine'}
        </p>
        <div className="flex gap-1.5 justify-center mb-3">
          {DAYS.map((day, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] ${
                CHECKED[i]
                  ? 'bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-bg-card font-bold'
                  : 'bg-bg-elevated text-muted'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <p className="text-[13px] text-secondary text-center">
          {t.onboardingMedalResult1 || '3 séances cette semaine → '}
          <span className="text-accent font-semibold">{t.onboardingMedalResult2 || '🏅 Médaille gagnée !'}</span>
        </p>
      </div>

      <p className="text-[13px] text-secondary text-center mt-2">
        {t.onboardingMedalProgression || 'Accumule les médailles et progresse de niveau en niveau.'}
      </p>

      <button
        onClick={onNext}
        className="w-full mt-auto mb-8 py-4 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-bg-card font-semibold text-[16px] active:scale-[0.98] transition-transform"
      >
        {t.onboardingMedalCTA || 'Compris !'}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create DiscoveryScreen**

Create `frontend/src/components/onboarding/DiscoveryScreen.tsx`:

```typescript
'use client';

import { useState, useRef, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

interface Props {
  onComplete: () => void;
}

const SPORTS = [
  { emoji: '🚴', name: 'Vélo', nameEn: 'Cycling', color: '#3b9eff' },
  { emoji: '🏋️', name: 'Musculation', nameEn: 'Strength', color: '#ff8a3b' },
  { emoji: '🏃', name: 'Course', nameEn: 'Running', color: '#34d399' },
  { emoji: '🏊', name: 'Natation', nameEn: 'Swimming', color: '#06b6d4' },
  { emoji: '🚶', name: 'Marche', nameEn: 'Walking', color: '#f59e0b' },
  { emoji: '⚡', name: 'Custom', nameEn: 'Custom', color: '#a78bfa' },
];

// Generate a sample calendar for the current month
function generateCalendarDays() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  // Adjust to Monday start (0=Mon, 6=Sun)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  // Scatter some "workout" days
  const workoutDays = new Set([2, 4, 6, 9, 11, 14, 16, 18, 21, 23, 25]);

  const cells: { day: number; isEmpty: boolean; hasWorkout: boolean; isToday: boolean }[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: 0, isEmpty: true, hasWorkout: false, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isEmpty: false, hasWorkout: workoutDays.has(d) && d <= today, isToday: d === today });
  }
  return cells;
}

const MONTH_NAMES_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAY_HEADERS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DiscoveryScreen({ onComplete }: Props) {
  const { t, locale } = useI18n();
  const [subSlide, setSubSlide] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const calendarDays = generateCalendarDays();
  const now = new Date();
  const monthNames = locale === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_FR;
  const dayHeaders = locale === 'en' ? DAY_HEADERS_EN : DAY_HEADERS_FR;

  const totalSubSlides = 3;

  const goToSub = useCallback((index: number) => {
    if (index >= totalSubSlides) {
      onComplete();
      return;
    }
    setSubSlide(Math.max(0, Math.min(index, totalSubSlides - 1)));
    setOffsetX(0);
  }, [onComplete]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const deltaX = e.touches[0].clientX - touchRef.current.x;
    const deltaY = e.touches[0].clientY - touchRef.current.y;
    if (!isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) { touchRef.current = null; return; }
    setIsSwiping(true);
    if ((subSlide === 0 && deltaX > 0) || (subSlide === totalSubSlides - 1 && deltaX < 0)) {
      setOffsetX(deltaX * 0.3);
    } else {
      setOffsetX(deltaX);
    }
  }, [subSlide, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!touchRef.current) return;
    const velocity = Math.abs(offsetX) / (Date.now() - touchRef.current.time);
    if (offsetX < -50 || (velocity > 0.5 && offsetX < 0)) goToSub(subSlide + 1);
    else if (offsetX > 50 || (velocity > 0.5 && offsetX > 0)) goToSub(subSlide - 1);
    else setOffsetX(0);
    touchRef.current = null;
    setIsSwiping(false);
  }, [offsetX, subSlide, goToSub]);

  const ctaLabel = subSlide < totalSubSlides - 1
    ? (t.next || 'Suivant')
    : (t.onboardingLetsGo || "C'est parti !");

  const handleCTA = () => {
    if (subSlide < totalSubSlides - 1) {
      goToSub(subSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full pt-16">
      <h1 className="font-serif text-[26px] text-text mt-4 px-6">
        {subSlide === 1
          ? (t.onboardingCalendarTitle || 'Ton calendrier')
          : subSlide === 2
            ? ''
            : (t.onboardingSportsTitle || 'Ton espace sportif')}
      </h1>

      {/* Sub-dots */}
      <div className="flex justify-center gap-1.5 my-2">
        {Array.from({ length: totalSubSlides }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === subSlide ? 'bg-accent' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Sub-slide content with swipe */}
      <div
        className="flex flex-1 min-h-0"
        style={{
          transform: `translateX(calc(-${subSlide * 100}% + ${offsetX}px))`,
          transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sub 1: Sports */}
        <div className="w-full flex-shrink-0 px-6 flex flex-col">
          <p className="text-[14px] text-secondary text-center mb-4 leading-relaxed">
            {t.onboardingSportsText || '6 sports, chacun avec ses séances type et sa bibliothèque.'}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {SPORTS.map((sport) => (
              <div
                key={sport.name}
                className="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-xl bg-bg-card border border-border"
                style={{ borderColor: `${sport.color}30` }}
              >
                <span className="text-2xl">{sport.emoji}</span>
                <span className="text-[11px] font-medium text-secondary">
                  {locale === 'en' ? sport.nameEn : sport.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub 2: Calendar */}
        <div className="w-full flex-shrink-0 px-6 flex flex-col">
          <p className="text-[14px] text-secondary text-center mb-4 leading-relaxed">
            {t.onboardingCalendarText || "C'est ici que tu coches tes jours d'activité. Ta vue la plus visuelle pour suivre ta régularité."}
          </p>
          <div className="bg-bg-card rounded-[14px] p-3.5 border border-border">
            <p className="text-center font-serif text-[17px] text-accent mb-2.5">
              {monthNames[now.getMonth()]} {now.getFullYear()}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {dayHeaders.map((d, i) => (
                <div key={i} className="text-[9px] text-muted font-semibold py-1">{d}</div>
              ))}
              {calendarDays.map((cell, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] ${
                    cell.isEmpty ? 'invisible'
                    : cell.hasWorkout ? 'bg-gradient-to-br from-accent/30 to-accent/10 text-accent font-semibold border border-accent/30'
                    : cell.isToday ? 'border border-accent text-text'
                    : 'text-muted'
                  }`}
                >
                  {cell.isEmpty ? '' : cell.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sub 3: CTA Final */}
        <div className="w-full flex-shrink-0 px-6 flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-[15%] left-[-10%] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(201,169,110,0.08),transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-[15%] right-[-15%] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(201,169,110,0.08),transparent_70%)] pointer-events-none" />
          <div className="text-[64px] mb-5">💪</div>
          <h2 className="font-serif text-[30px] text-text mb-3">{t.onboardingReadyTitle || 'Tout est prêt'}</h2>
          <p className="text-[15px] text-secondary leading-relaxed max-w-xs">
            {t.onboardingReadyText1 || 'Enregistre ta première séance et commence à construire'}
            {' '}<span className="text-accent font-medium">{t.onboardingReadyHighlight || 'ta régularité'}</span>.
          </p>
        </div>
      </div>

      {/* CTA button */}
      <div className="px-6 pb-8 pt-4">
        <button
          onClick={handleCTA}
          className="w-full py-4 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#a0833a] text-bg-card font-semibold text-[16px] active:scale-[0.98] transition-transform"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Type check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/onboarding/
git commit -m "feat: add onboarding screen components (welcome, goal, medal, discovery)"
```

---

### Task 6: Onboarding — main flow component + AuthProvider integration

**Files:**
- Create: `frontend/src/components/onboarding/OnboardingFlow.tsx`
- Modify: `frontend/src/components/Providers.tsx`
- Modify: `frontend/src/lib/auth.tsx`

- [ ] **Step 1: Create OnboardingFlow**

Create `frontend/src/components/onboarding/OnboardingFlow.tsx`:

```typescript
'use client';

import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { completeOnboarding } from '@/lib/api';
import SwipeContainer from './SwipeContainer';
import WelcomeScreen from './WelcomeScreen';
import GoalScreen from './GoalScreen';
import MedalScreen from './MedalScreen';
import DiscoveryScreen from './DiscoveryScreen';

interface Props {
  onDone: () => void;
}

export default function OnboardingFlow({ onDone }: Props) {
  const { user } = useAuth();

  const handleComplete = useCallback(async () => {
    try {
      await completeOnboarding();
    } catch {
      // Non-blocking
    }
    onDone();
  }, [onDone]);

  // This wrapper is needed because SwipeContainer expects children as array,
  // and DiscoveryScreen handles its own completion
  // We use a "dummy" onComplete on SwipeContainer that triggers when swiping past the last slide
  // But each screen also has its own onNext/onComplete via button

  return (
    <SwipeContainer onComplete={handleComplete}>
      <WelcomeScreen username={user?.nickname || ''} onNext={() => {}} />
      <GoalScreen onNext={() => {}} />
      <MedalScreen onNext={() => {}} />
      <DiscoveryScreen onComplete={handleComplete} />
    </SwipeContainer>
  );
}
```

**Note:** The `onNext` props on individual screens trigger the button tap action. But since SwipeContainer handles the slide transitions via swipe, the button taps in each screen need to also advance the container. We need to pass a ref-based goNext down. Let's update SwipeContainer to support this.

- [ ] **Step 2: Update SwipeContainer to expose goNext via render prop**

Replace `frontend/src/components/onboarding/SwipeContainer.tsx` children handling. Change the interface and rendering:

```typescript
'use client';

import { useState, useRef, useCallback, type ReactElement } from 'react';

interface SwipeContainerProps {
  children: (goNext: () => void) => ReactElement[];
  onComplete: () => void;
  dotColor?: string;
}

export default function SwipeContainer({ children, onComplete, dotColor = '#c9a96e' }: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const slides = children(goTo.bind(null, -1)); // we'll fix this below
  const total = slides.length;

  // goTo navigates to a specific index; if past last, calls onComplete
  const goTo = useCallback((index: number) => {
    if (index >= total) {
      onComplete();
      return;
    }
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
    setOffsetX(0);
  }, [total, onComplete]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  // Re-render children with the real goNext
  const renderedSlides = children(goNext);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    setIsSwiping(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;
    if (!isSwiping && Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartRef.current = null;
      return;
    }
    setIsSwiping(true);
    if ((currentIndex === 0 && deltaX > 0) || (currentIndex === total - 1 && deltaX < 0)) {
      setOffsetX(deltaX * 0.3);
    } else {
      setOffsetX(deltaX);
    }
  }, [currentIndex, total, isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const threshold = 50;
    const velocity = Math.abs(offsetX) / (Date.now() - touchStartRef.current.time);
    if (offsetX < -threshold || (velocity > 0.5 && offsetX < 0)) {
      goTo(currentIndex + 1);
    } else if (offsetX > threshold || (velocity > 0.5 && offsetX > 0)) {
      goTo(currentIndex - 1);
    } else {
      setOffsetX(0);
    }
    touchStartRef.current = null;
    setIsSwiping(false);
  }, [offsetX, currentIndex, goTo]);

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-hidden">
      {/* Dot indicators */}
      <div className="absolute top-[max(env(safe-area-inset-top,0px),12px)] left-0 right-0 z-10 flex justify-center gap-1.5 pt-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === currentIndex ? dotColor : '#2a2b32',
              boxShadow: i === currentIndex ? `0 0 8px ${dotColor}60` : 'none',
            }}
          />
        ))}
      </div>

      {/* Slides */}
      <div
        className="flex h-full"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${offsetX}px))`,
          transition: isSwiping ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderedSlides.map((child, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 overflow-y-auto">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update OnboardingFlow to use render prop**

Replace `frontend/src/components/onboarding/OnboardingFlow.tsx`:

```typescript
'use client';

import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { completeOnboarding } from '@/lib/api';
import SwipeContainer from './SwipeContainer';
import WelcomeScreen from './WelcomeScreen';
import GoalScreen from './GoalScreen';
import MedalScreen from './MedalScreen';
import DiscoveryScreen from './DiscoveryScreen';

interface Props {
  onDone: () => void;
}

export default function OnboardingFlow({ onDone }: Props) {
  const { user } = useAuth();

  const handleComplete = useCallback(async () => {
    try {
      await completeOnboarding();
    } catch {
      // Non-blocking
    }
    onDone();
  }, [onDone]);

  return (
    <SwipeContainer onComplete={handleComplete}>
      {(goNext) => [
        <WelcomeScreen key="welcome" username={user?.nickname || ''} onNext={goNext} />,
        <GoalScreen key="goal" onNext={goNext} />,
        <MedalScreen key="medal" onNext={goNext} />,
        <DiscoveryScreen key="discovery" onComplete={handleComplete} />,
      ]}
    </SwipeContainer>
  );
}
```

- [ ] **Step 4: Add `showOnboarding` state to AuthProvider**

In `frontend/src/lib/auth.tsx`, add `showOnboarding` to the context:

Add to `AuthContextType`:
```typescript
showOnboarding: boolean;
setShowOnboarding: (v: boolean) => void;
```

Add state in `AuthProvider`:
```typescript
const [showOnboarding, setShowOnboarding] = useState(false);
```

In the useEffect where `/api/auth/me` response is handled, after `setUser(...)`:
```typescript
if (data.has_seen_onboarding === false) {
  setShowOnboarding(true);
}
```

Add to context value:
```typescript
showOnboarding, setShowOnboarding
```

Update the default context value to include:
```typescript
showOnboarding: false,
setShowOnboarding: () => {},
```

- [ ] **Step 5: Wire OnboardingFlow into Providers.tsx**

In `frontend/src/components/Providers.tsx`:

```typescript
'use client';

import { I18nProvider } from '@/lib/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';
import ErrorBoundary from '@/components/ErrorBoundary';
import SplashDismiss from '@/components/SplashDismiss';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { showOnboarding, setShowOnboarding, updateUser, user } = useAuth();

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onDone={() => {
          setShowOnboarding(false);
          if (user) updateUser({ ...user, has_seen_onboarding: true });
        }}
      />
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <AuthProvider>
          <OnboardingGate>
            {children}
            <SplashDismiss />
          </OnboardingGate>
        </AuthProvider>
      </ErrorBoundary>
    </I18nProvider>
  );
}
```

- [ ] **Step 6: Update `updateUser` signature in auth.tsx**

The current `updateUser` accepts `{ id: number; nickname: string }`. Update it to accept the full User type:

```typescript
const updateUser = useCallback((u: User) => {
  setUser(u);
}, []);
```

- [ ] **Step 7: Update register flow to trigger onboarding**

In `frontend/src/app/register/page.tsx`, after successful registration, the router pushes to `/`. Since the user's `has_seen_onboarding` is `false` by default, the AuthProvider will detect this on the next `/api/auth/me` fetch and show the onboarding automatically. No extra code needed — the existing flow handles it.

- [ ] **Step 8: Type check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 9: Manual test**

1. Run `npm run dev`
2. As guest, go to profile → click "Create Account" → verify it navigates to `/register`
3. Fill in email + username → Continue → Password → "Créer mon compte"
4. Verify onboarding overlay appears with 4 screens
5. Swipe through all screens, verify goal saves, verify "C'est parti" dismisses
6. Refresh page — verify onboarding does NOT reappear

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/onboarding/OnboardingFlow.tsx frontend/src/components/onboarding/SwipeContainer.tsx frontend/src/components/Providers.tsx frontend/src/lib/auth.tsx
git commit -m "feat: wire onboarding flow into app with AuthProvider integration"
```

---

### Task 7: i18n — add all onboarding translation keys

**Files:**
- Modify: `frontend/src/lib/i18n.tsx`

- [ ] **Step 1: Add FR + EN keys**

Add the following keys to the FR translations object and the EN translations object in `frontend/src/lib/i18n.tsx`:

**FR keys (these are the defaults in the components, so many are already hardcoded — but add them to i18n for consistency):**
```typescript
// Register page
registerTagline: 'Suis ta progression sportive',
registerNickname: "Nom d'utilisateur",
registerNicknamePlaceholder: 'Ton pseudo',
registerChoosePassword: 'Choisis un mot de passe',
registerPasswordHint: 'Minimum 6 caractères.',
confirmPassword: 'Confirmer',
registerCreating: 'Création...',
registerCreateAccount: 'Créer mon compte',
alreadyHaveAccount: 'Déjà un compte ?',
loginLink: 'Se connecter',

// Onboarding
onboardingWelcome: 'Bienvenue,',
onboardingWelcomeText1: 'Tu as fait le premier pas.',
onboardingWelcomeText2pre: 'Ici, ',
onboardingWelcomeHighlight1: 'pas de compétition avec les autres',
onboardingWelcomeText2post: ' — seulement avec toi-même.',
onboardingWelcomeText3pre: "L'objectif est simple : trouver ",
onboardingWelcomeHighlight2: 'ta motivation',
onboardingWelcomeText3post: ' et rester régulier.',
onboardingGoalTitle: 'Ton objectif',
onboardingGoalSubtitle: 'Combien de séances veux-tu faire par semaine ?',
onboardingGoalCallout1pre: "L'important c'est la ",
onboardingGoalCalloutHighlight1: 'régularité',
onboardingGoalCallout1post: ", pas l'intensité. Choisis un objectif ",
onboardingGoalCalloutHighlight2: 'réaliste',
onboardingGoalCallout2: ' — tu pourras le modifier à tout moment.',
onboardingRecommended: 'recommandé',
onboardingGoalNote: 'Personnalisable de 1 à 7 dans les réglages',
onboardingGoalValidate: 'Valider mon objectif',
onboardingMedalTitle: 'Tes médailles',
onboardingMedalText: "Chaque semaine où tu atteins ton objectif, tu gagnes une médaille. C'est notre façon de célébrer ta régularité.",
onboardingMedalExample: 'Exemple — objectif 3×/semaine',
onboardingMedalResult1: '3 séances cette semaine → ',
onboardingMedalResult2: '🏅 Médaille gagnée !',
onboardingMedalProgression: 'Accumule les médailles et progresse de niveau en niveau.',
onboardingMedalCTA: 'Compris !',
onboardingSportsTitle: 'Ton espace sportif',
onboardingSportsText: '6 sports, chacun avec ses séances type et sa bibliothèque.',
onboardingCalendarTitle: 'Ton calendrier',
onboardingCalendarText: "C'est ici que tu coches tes jours d'activité. Ta vue la plus visuelle pour suivre ta régularité.",
onboardingReadyTitle: 'Tout est prêt',
onboardingReadyText1: 'Enregistre ta première séance et commence à construire',
onboardingReadyHighlight: 'ta régularité',
onboardingLetsGo: "C'est parti !",
```

**EN keys:**
```typescript
registerTagline: 'Track your sports progress',
registerNickname: 'Username',
registerNicknamePlaceholder: 'Your username',
registerChoosePassword: 'Choose a password',
registerPasswordHint: 'Minimum 6 characters.',
confirmPassword: 'Confirm',
registerCreating: 'Creating...',
registerCreateAccount: 'Create my account',
alreadyHaveAccount: 'Already have an account?',
loginLink: 'Log in',

onboardingWelcome: 'Welcome,',
onboardingWelcomeText1: "You've taken the first step.",
onboardingWelcomeText2pre: 'Here, ',
onboardingWelcomeHighlight1: "no competition with others",
onboardingWelcomeText2post: ' — only with yourself.',
onboardingWelcomeText3pre: 'The goal is simple: find ',
onboardingWelcomeHighlight2: 'your motivation',
onboardingWelcomeText3post: ' and stay consistent.',
onboardingGoalTitle: 'Your goal',
onboardingGoalSubtitle: 'How many sessions per week do you want to do?',
onboardingGoalCallout1pre: "What matters is ",
onboardingGoalCalloutHighlight1: 'consistency',
onboardingGoalCallout1post: ", not intensity. Choose a ",
onboardingGoalCalloutHighlight2: 'realistic',
onboardingGoalCallout2: ' goal — you can change it anytime.',
onboardingRecommended: 'recommended',
onboardingGoalNote: 'Customizable from 1 to 7 in settings',
onboardingGoalValidate: 'Set my goal',
onboardingMedalTitle: 'Your medals',
onboardingMedalText: "Every week you reach your goal, you earn a medal. It's our way of celebrating your consistency.",
onboardingMedalExample: 'Example — goal 3×/week',
onboardingMedalResult1: '3 sessions this week → ',
onboardingMedalResult2: '🏅 Medal earned!',
onboardingMedalProgression: 'Collect medals and level up.',
onboardingMedalCTA: 'Got it!',
onboardingSportsTitle: 'Your sports space',
onboardingSportsText: '6 sports, each with session types and an exercise library.',
onboardingCalendarTitle: 'Your calendar',
onboardingCalendarText: "This is where you check off your active days. Your most visual way to track consistency.",
onboardingReadyTitle: "All set",
onboardingReadyText1: 'Log your first session and start building',
onboardingReadyHighlight: 'your consistency',
onboardingLetsGo: "Let's go!",
```

- [ ] **Step 2: Type check**

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/i18n.tsx
git commit -m "feat: add i18n keys for register page and onboarding"
```

---

### Task 8: Update CLAUDE.md and rules

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add onboarding documentation to CLAUDE.md**

Add the following to the end of the CLAUDE.md gotchas section:

```markdown
- Onboarding: `OnboardingFlow` overlay shown when `has_seen_onboarding` is false on user record. 4 swipeable screens (welcome → goal → medals → discovery). `SwipeContainer` handles touch swipe with dot indicators. Discovery screen has 3 internal sub-slides (sports → calendar → CTA). `OnboardingGate` in Providers.tsx checks auth state and renders overlay. Completion calls `PUT /api/auth/me` with `has_seen_onboarding: true`. Register page at `/register` (full-screen, 2-step: identity → password). Guest data migration happens after registration.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add onboarding documentation to CLAUDE.md"
```
