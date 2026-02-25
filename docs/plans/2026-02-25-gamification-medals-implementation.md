# Gamification: Weekly Progress Bar + Medals — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a weekly progress bar + medal counter to the sticky header, a medal stat card in key insights, and a celebration animation when earning medals.

**Architecture:** Pure frontend — medals are derived from workout dates at render time. New helper functions in `data.ts` compute week bounds and medal counts. A new `WeeklyProgress` component renders in both the mobile header and desktop sidebar. No backend or DB changes.

**Tech Stack:** Next.js 14, Tailwind CSS, TypeScript. No external libs needed.

---

### Task 1: Data Layer — Weekly Progress & Medal Functions

**Files:**
- Modify: `frontend/src/lib/data.ts:96-125` (append after existing functions)

**Step 1: Add `getWeekBounds` function**

Append to `frontend/src/lib/data.ts`:

```typescript
export function getWeekBounds(dateStr: string): { monday: string; sunday: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  return { monday: fmt(monday), sunday: fmt(sunday) };
}
```

**Step 2: Add `getWeeklyProgress` function**

Append to `frontend/src/lib/data.ts`:

```typescript
export function getWeeklyProgress(dateStr: string): { count: number; medals: number; weekStart: string; weekEnd: string } {
  const { monday, sunday } = getWeekBounds(dateStr);
  const count = DUMMY_WORKOUTS.filter(w => w.date >= monday && w.date <= sunday).length;
  const medals = Math.max(0, count - 2);
  return { count, medals, weekStart: monday, weekEnd: sunday };
}
```

**Step 3: Add `getTotalMedals` function**

Append to `frontend/src/lib/data.ts`:

```typescript
export function getTotalMedals(): number {
  if (DUMMY_WORKOUTS.length === 0) return 0;
  const sorted = [...DUMMY_WORKOUTS].sort((a, b) => a.date.localeCompare(b.date));
  const firstDate = sorted[0].date;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  let totalMedals = 0;
  let { monday } = getWeekBounds(firstDate);

  while (monday <= todayStr) {
    const sun = new Date(monday + 'T00:00:00');
    sun.setDate(sun.getDate() + 6);
    const sundayStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
    const count = DUMMY_WORKOUTS.filter(w => w.date >= monday && w.date <= sundayStr).length;
    totalMedals += Math.max(0, count - 2);
    const nextMon = new Date(monday + 'T00:00:00');
    nextMon.setDate(nextMon.getDate() + 7);
    monday = `${nextMon.getFullYear()}-${String(nextMon.getMonth() + 1).padStart(2, '0')}-${String(nextMon.getDate()).padStart(2, '0')}`;
  }

  return totalMedals;
}
```

**Step 4: Verify manually**

With the dummy data, expected values:
- Week Feb 2-8: 4 workouts → 2 medals
- Week Feb 9-15: 5 workouts → 3 medals
- Week Feb 16-22: 4 workouts → 2 medals
- Week Feb 23-Mar 1: 2 workouts → 0 medals
- Total: 7 medals
- Current week (Feb 25): count=2, medals=0

**Step 5: Commit**

```bash
git add frontend/src/lib/data.ts
git commit -m "feat: add weekly progress and medal calculation functions"
```

---

### Task 2: Tailwind Config — Medal Glow Keyframes

**Files:**
- Modify: `frontend/tailwind.config.ts:45-96` (keyframes + animation sections)

**Step 1: Add keyframes for progress bar glow and medal bounce**

Add these keyframes inside the `keyframes` object at line ~82 (before the closing `}`):

```typescript
medalBounce: {
  '0%': { transform: 'scale(1)' },
  '30%': { transform: 'scale(1.3)' },
  '60%': { transform: 'scale(0.95)' },
  '100%': { transform: 'scale(1)' },
},
medalFloatUp: {
  from: { opacity: '1', transform: 'translateY(0)' },
  to: { opacity: '0', transform: 'translateY(-20px)' },
},
progressGlow: {
  '0%, 100%': { opacity: '0.5' },
  '50%': { opacity: '1' },
},
```

**Step 2: Add animation utilities**

Add inside the `animation` object at line ~95:

```typescript
medalBounce: 'medalBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
medalFloatUp: 'medalFloatUp 0.8s ease-out forwards',
progressGlow: 'progressGlow 2s ease-in-out infinite',
```

**Step 3: Commit**

```bash
git add frontend/tailwind.config.ts
git commit -m "feat: add medal and progress bar animation keyframes"
```

---

### Task 3: WeeklyProgress Component

**Files:**
- Create: `frontend/src/components/WeeklyProgress.tsx`

**Step 1: Create the component**

```tsx
'use client';

import { getWeeklyProgress, getTotalMedals } from '@/lib/data';

export default function WeeklyProgress() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const { count } = getWeeklyProgress(todayStr);
  const totalMedals = getTotalMedals();

  const progress = Math.min(count / 3, 1);
  const extra = Math.max(0, count - 3);

  // Glow intensity increases with extra workouts beyond 3
  const glowStyle = count >= 3
    ? { boxShadow: `0 0 ${8 + extra * 4}px ${2 + extra * 2}px rgba(167, 139, 250, ${0.3 + extra * 0.1})` }
    : {};

  return (
    <div className="w-full">
      {/* Medal counter */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-text-muted">{count}/3 cette semaine</span>
        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-accent">
            <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
            <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] font-bold text-accent">{totalMedals}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-accent to-[#8b5cf6] transition-all duration-500 ease-out ${count >= 3 ? 'animate-progressGlow' : ''}`}
          style={{ width: `${progress * 100}%`, ...glowStyle }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/WeeklyProgress.tsx
git commit -m "feat: create WeeklyProgress component with bar and medal counter"
```

---

### Task 4: Integrate into Mobile Header + Desktop Sidebar

**Files:**
- Modify: `frontend/src/components/Calendar.tsx:66-73` (mobile header)
- Modify: `frontend/src/components/BottomNav.tsx:36-55` (desktop sidebar)

**Step 1: Add progress bar to mobile header in Calendar.tsx**

Add import at top of `Calendar.tsx`:

```typescript
import WeeklyProgress from '@/components/WeeklyProgress';
```

Replace the mobile header block (lines 68-73):

```tsx
{/* Header — visible on mobile/tablet only */}
<div className="sticky top-0 z-10 bg-gradient-to-b from-bg from-70% to-transparent px-5 pt-14 pb-3 lg:hidden">
  <h1 className="font-serif text-[28px] font-normal tracking-tight mb-2.5">
    <span className="text-accent">Jupiter</span> <span className="text-text-muted italic">Tracker</span>
  </h1>
  <WeeklyProgress />
</div>
```

**Step 2: Add progress bar to desktop sidebar in BottomNav.tsx**

Add import at top of `BottomNav.tsx`:

```typescript
import WeeklyProgress from '@/components/WeeklyProgress';
```

In the desktop sidebar section (line 36-55), add the progress bar after the title (after line 39):

```tsx
<h2 className="font-serif text-xl mb-4">
  Jupiter <span className="text-text-muted italic">Tracker</span>
</h2>
<div className="mb-6">
  <WeeklyProgress />
</div>
```

Note: change `mb-8` on the h2 to `mb-4` to tighten spacing.

**Step 3: Commit**

```bash
git add frontend/src/components/Calendar.tsx frontend/src/components/BottomNav.tsx
git commit -m "feat: add weekly progress bar to mobile header and desktop sidebar"
```

---

### Task 5: Medal Stat Card in Key Insights

**Files:**
- Modify: `frontend/src/components/Calendar.tsx:189-206` (stats grid)

**Step 1: Import `getTotalMedals` in Calendar.tsx**

Update the import line at top:

```typescript
import { getWorkoutsForMonth, getMonthlyStats, getTotalMedals, type Workout } from '@/lib/data';
```

**Step 2: Add `totalMedals` computation inside the component**

After line 25 (`const stats = getMonthlyStats(year, month);`), add:

```typescript
const totalMedals = getTotalMedals();
```

**Step 3: Add medal card after the stats grid closing `</div>` (line 206)**

After the existing stats grid, before `</div>` of the right column:

```tsx
{/* Medal card */}
<div className="mt-2.5 bg-bg-card border border-border rounded-card p-3.5 px-4 relative overflow-hidden col-span-2">
  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-transparent" />
  <div className="flex items-center gap-2">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent shrink-0">
      <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
      <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <div>
      <div className="text-[26px] font-bold tracking-tight leading-none text-accent">
        {totalMedals}
      </div>
      <div className="text-xs text-text-muted mt-1 font-medium">Médailles gagnées</div>
    </div>
  </div>
</div>
```

**Step 4: Commit**

```bash
git add frontend/src/components/Calendar.tsx
git commit -m "feat: add total medals stat card in key insights"
```

---

### Task 6: Medal Celebration Animation

**Files:**
- Modify: `frontend/src/components/WeeklyProgress.tsx` (add bounce + float animation)

**Step 1: Add celebration state and URL param detection**

The celebration triggers when the user returns to the calendar after saving a workout that earned a medal. We detect this via a `?saved=1` URL param added by the save redirect.

Update `WeeklyProgress.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getWeeklyProgress, getTotalMedals } from '@/lib/data';

export default function WeeklyProgress() {
  const searchParams = useSearchParams();
  const [showCelebration, setShowCelebration] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const { count } = getWeeklyProgress(todayStr);
  const totalMedals = getTotalMedals();

  const progress = Math.min(count / 3, 1);
  const extra = Math.max(0, count - 3);

  useEffect(() => {
    if (searchParams.get('saved') === '1' && count >= 3) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 1200);
      // Clean URL param
      window.history.replaceState({}, '', '/');
      return () => clearTimeout(timer);
    }
  }, [searchParams, count]);

  const glowStyle = count >= 3
    ? { boxShadow: `0 0 ${8 + extra * 4}px ${2 + extra * 2}px rgba(167, 139, 250, ${0.3 + extra * 0.1})` }
    : {};

  return (
    <div className="w-full">
      {/* Medal counter */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-text-muted">{count}/3 cette semaine</span>
        <div className="flex items-center gap-1 relative">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            className={`text-accent ${showCelebration ? 'animate-medalBounce' : ''}`}>
            <circle cx="12" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <polygon points="12,5 13.5,8 17,8.5 14.5,11 15,14.5 12,13 9,14.5 9.5,11 7,8.5 10.5,8" fill="currentColor" />
            <path d="M8 14.5l-2 5.5 4-2M16 14.5l2 5.5-4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-[13px] font-bold text-accent">{totalMedals}</span>
          {showCelebration && (
            <span className="absolute -top-1 -right-3 text-[11px] font-bold text-accent animate-medalFloatUp">+1</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-1 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-accent to-[#8b5cf6] transition-all duration-500 ease-out ${count >= 3 ? 'animate-progressGlow' : ''}`}
          style={{ width: `${progress * 100}%`, ...glowStyle }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Update save redirects to pass `?saved=1`**

In `frontend/src/app/workout/strength/page.tsx`, update the SaveAnimation onComplete:

```tsx
{showSaveAnimation && <SaveAnimation onComplete={() => router.push('/?saved=1')} />}
```

In `frontend/src/app/workout/cycling/page.tsx`, same change:

```tsx
{showSaveAnimation && <SaveAnimation onComplete={() => router.push('/?saved=1')} />}
```

**Step 3: Wrap WeeklyProgress with Suspense in Calendar.tsx**

Since `WeeklyProgress` now uses `useSearchParams`, it needs a Suspense boundary. Update the header in Calendar.tsx:

```tsx
import { Suspense } from 'react';
```

And wrap:

```tsx
<Suspense fallback={null}>
  <WeeklyProgress />
</Suspense>
```

Do the same in BottomNav.tsx sidebar.

**Step 4: Commit**

```bash
git add frontend/src/components/WeeklyProgress.tsx frontend/src/app/workout/strength/page.tsx frontend/src/app/workout/cycling/page.tsx frontend/src/components/Calendar.tsx frontend/src/components/BottomNav.tsx
git commit -m "feat: add medal celebration animation on save"
```

---

### Task 7: Visual QA & Polish

**Step 1: Run dev server and verify**

```bash
cd frontend && npm run dev
```

**Step 2: Check all views**

- Mobile header: progress bar shows 2/3, medal counter shows 7
- Desktop sidebar: same progress bar under branding
- Key insights: medal card shows 7 at bottom
- Save a workout → checkmark animation → redirect → medal bounce (if 3+ this week)
- Progress bar glow intensifies at 4+ workouts

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: gamification complete — weekly progress bar + medal system"
```
