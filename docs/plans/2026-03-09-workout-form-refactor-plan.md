# Workout Form Refactor — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract ~80% shared code from 5 workout forms into `useWorkoutForm()` hook + `WorkoutFormShell` component, making it trivial to add new workout types.

**Architecture:** Slot pattern — shared hook handles all state/logic (draft, save, edit, delete), shared shell renders common UI (header, buttons, modals), each form only defines its specific fields as children.

**Tech Stack:** React hooks, Next.js App Router, TypeScript, Tailwind CSS

---

### Task 1: Extract duration utilities to shared module

**Files:**
- Create: `frontend/src/lib/duration.ts`

**Step 1: Create `duration.ts`**

Extract `parseDuration` and `formatDuration` from any existing form (they're identical across all 5):

```typescript
export function parseDuration(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  const hm = s.match(/^(\d+)\s*h\s*(\d+)?\s*(min)?$/i);
  if (hm) {
    const h = parseInt(hm[1]);
    const m = hm[2] ? parseInt(hm[2]) : 0;
    return h * 60 + m;
  }
  const colon = s.match(/^(\d+):(\d{1,2})$/);
  if (colon) return parseInt(colon[1]) * 60 + parseInt(colon[2]);
  const mOnly = s.match(/^(\d+)\s*(min|m)$/i);
  if (mOnly) return parseInt(mOnly[1]);
  if (/^\d+$/.test(s)) return parseInt(s);
  return null;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}
```

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
feat: extract duration utilities to shared module
```

---

### Task 2: Extract DeleteConfirmModal component

**Files:**
- Create: `frontend/src/components/DeleteConfirmModal.tsx`

**Step 1: Create `DeleteConfirmModal.tsx`**

Extract the delete confirmation modal shared across all 6 forms. Props:

```typescript
interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
  message?: string;  // defaults to t.deleteConfirmGeneric
}
```

The JSX is identical across all forms: backdrop + card + title + message + cancel/delete buttons. Use `useI18n()` inside for translations.

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
feat: extract DeleteConfirmModal component
```

---

### Task 3: Create useWorkoutForm hook

**Files:**
- Create: `frontend/src/lib/useWorkoutForm.ts`

**Step 1: Create the hook**

The hook encapsulates ALL shared logic from the 5 simple forms:

1. **URL params** — reads `date` and `id` from `useSearchParams()`
2. **localStorage draft** — load on mount, auto-save on field changes, clear on save
3. **API fetch** — loads existing workout when `id` is present (checks draft first)
4. **Edit mode toggle** — `editing` state, `readOnly` shorthand
5. **Save flow** — validates via `options.validate()`, builds payload via `options.buildPayload()`, calls createWorkout/updateWorkout, handles animation/redirect/error
6. **Delete flow** — `showDeleteConfirm`, `confirmDelete()`, `deleting` state
7. **Custom emoji/name** — state + patchWorkoutMeta on change for existing workouts
8. **Date display** — locale-aware formatted date string
9. **headerProps** — pre-built object for `<WorkoutFormHeader>`

Generic type `F extends Record<string, string>` for the fields object.

Key implementation details:
- `storageKey = workoutId ? `${storagePrefix}-edit-${workoutId}` : `${storagePrefix}-draft-${date}``
- Draft includes fields + customEmoji + customName
- `hasData` defaults to checking if any field in `F` is non-empty
- loadFromApi receives `workout_details` or `cycling_details` depending on type
- For cycling type: reads `data.cycling_details`, for others: reads `(data as any).workout_details`
- Save on create: shows save animation, then redirects to `/calendar?saved=1`
- Save on edit: redirects to `/calendar` immediately

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
feat: create useWorkoutForm shared hook
```

---

### Task 4: Create WorkoutFormShell component

**Files:**
- Create: `frontend/src/components/WorkoutFormShell.tsx`

**Step 1: Create the shell**

Takes `form` (return of useWorkoutForm), `color`, `shadowColor`, optional `deleteMessage`, and `children`.

Renders in order:
1. `<div className="page-container px-5 pb-36 lg:pb-20">`
2. `<WorkoutFormHeader {...form.headerProps} />`
3. `{children}` — the slot for type-specific fields
4. Loading indicator (when `form.loadingWorkout`)
5. `<SaveAnimation>` (when `form.showSaveAnimation`)
6. Error banner (when `form.saveError`)
7. Save button — uses `bg-${color}` class and `shadowColor` prop
8. Edit button (existing workout, not editing)
9. Delete button (existing workout)
10. `<DeleteConfirmModal>` — uses `form.showDeleteConfirm`, `form.confirmDelete`, `form.deleting`

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
feat: create WorkoutFormShell component
```

---

### Task 5: Refactor running form

**Files:**
- Modify: `frontend/src/app/workout/running/page.tsx`

**Step 1: Rewrite running form**

Replace the entire ~300 line form with:
- Import `useWorkoutForm`, `WorkoutFormShell`, `parseDuration`, `formatDuration`
- Configure hook with `type: 'course'`, `storagePrefix: 'running'`, fields `{ duration, distance }`
- Render `<WorkoutFormShell>` with duration input + distance input as children
- Duration input: `type="text"`, onBlur normalizes via parseDuration/formatDuration
- Distance input: `type="text"`, `inputMode="decimal"`, onChange regex `/^[0-9]*\.?[0-9]*$/`
- Keep the Suspense wrapper export

**Step 2: Verify build + test locally**

Run: `cd frontend && npx tsc --noEmit`

Manually test: create new running workout, edit existing, delete, check draft saving works.

**Step 3: Commit**

```
refactor: running form uses shared useWorkoutForm hook
```

---

### Task 6: Refactor walking form

**Files:**
- Modify: `frontend/src/app/workout/walking/page.tsx`

**Step 1: Rewrite walking form**

Same as running: `type: 'marche'`, `storagePrefix: 'walking'`, fields `{ duration, distance }`. Distance placeholder "5.0" instead of "10.5".

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
refactor: walking form uses shared useWorkoutForm hook
```

---

### Task 7: Refactor swimming form

**Files:**
- Modify: `frontend/src/app/workout/swimming/page.tsx`

**Step 1: Rewrite swimming form**

`type: 'natation'`, `storagePrefix: 'swimming'`, fields `{ duration, laps }`.
- Laps field: `inputMode="numeric"`, regex `/^[0-9]*$/`, validation checks `parseInt(laps)` valid
- loadFromApi reads `wd.laps` instead of `wd.distance`

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
refactor: swimming form uses shared useWorkoutForm hook
```

---

### Task 8: Refactor cycling form

**Files:**
- Modify: `frontend/src/app/workout/cycling/page.tsx`

**Step 1: Rewrite cycling form**

`type: 'velo'`, `storagePrefix: 'cycling'`, fields `{ duration, distance, elevation, rideType }`.

Key differences from simple forms:
- Has 4 fields + ride type dropdown
- `buildPayload` uses `cycling_details` (not `workout_details`)
- `loadFromApi` reads from `data.cycling_details` (not `workout_details`)
- Ride type is a `<select>` with `RIDE_TYPES` options
- Extra validation for elevation (integer)
- `deleteMessage` uses `t.deleteConfirmCycling`

The hook's `loadFromApi` callback receives the raw API data. For cycling, it needs to access `cycling_details` instead of `workout_details`. The hook should pass the full API response to `loadFromApi` so cycling can read from its own field.

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
refactor: cycling form uses shared useWorkoutForm hook
```

---

### Task 9: Refactor custom form

**Files:**
- Modify: `frontend/src/app/workout/custom/page.tsx`

**Step 1: Rewrite custom form**

`type: 'custom'`, `storagePrefix: 'custom'`, fields `{ duration, distance, elevation }`.

Key differences:
- Has `activeFields` Set state for optional distance/elevation toggle (managed locally, NOT in the hook)
- Toggle buttons to add/remove distance and elevation fields
- Draft saving needs to include `activeFields` — override `hasData` to also consider duration
- `buildPayload` only includes distance/elevation if they're in `activeFields`
- `loadFromApi` restores `activeFields` based on which values exist in API response

The hook's `defaultFields` includes all 3 fields. The `activeFields` toggle is local state in the form component — it controls visibility and payload building, but the hook just stores the field values.

Custom form will need slightly more code (~50 lines) because of the toggle logic, but still much less than current ~370 lines.

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
refactor: custom form uses shared useWorkoutForm hook
```

---

### Task 10: Update strength form to use DeleteConfirmModal

**Files:**
- Modify: `frontend/src/app/workout/strength/page.tsx`

**Step 1: Replace inline delete modal with component**

In strength form:
- Import `DeleteConfirmModal` from `@/components/DeleteConfirmModal`
- Replace the ~30 lines of delete modal JSX with `<DeleteConfirmModal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={handleDelete} deleting={deleting} message={t.deleteConfirmStrength} />`
- Extract the delete handler into a named function

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```
refactor: strength form uses shared DeleteConfirmModal
```

---

### Task 11: Final verification + cleanup

**Files:**
- Verify all 6 workout forms work correctly
- Update CLAUDE.md with new architecture info

**Step 1: Full build check**

Run: `cd frontend && npx tsc --noEmit && npm run build`

**Step 2: Update CLAUDE.md**

Add new key files:
- `frontend/src/lib/duration.ts` — shared parseDuration/formatDuration
- `frontend/src/lib/useWorkoutForm.ts` — shared workout form hook
- `frontend/src/components/WorkoutFormShell.tsx` — shared form UI shell
- `frontend/src/components/DeleteConfirmModal.tsx` — shared delete modal

Add pattern note:
- New workout type: add to WorkoutType + WORKOUT_CONFIG, create page.tsx with ~30 lines using useWorkoutForm + WorkoutFormShell
- Strength form is separate (too complex for shared hook) but uses DeleteConfirmModal

**Step 3: Commit**

```
docs: update CLAUDE.md with refactored workout form architecture
```
