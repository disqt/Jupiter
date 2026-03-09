# Workout Form Refactor — Design

## Problem

6 workout form pages share ~80% identical code (draft saving, edit mode, delete modal, save flow, error handling, date formatting, header setup). Each is ~300 lines. Adding a new workout type means copying an entire page and changing ~20 lines. This duplication makes maintenance expensive and bugs easy to miss.

## Approach: Slot Pattern + Shared Hook

**Option chosen:** Extract shared logic into `useWorkoutForm()` hook + `WorkoutFormShell` UI component. Each workout type keeps its own `page.tsx` but only defines its specific fields as children (slot pattern). Strength stays separate — it's structurally different (exercise logs vs simple fields).

### Scope

- **In scope:** 5 "simple" forms (running, walking, swimming, cycling, custom)
- **Partially in scope:** Strength — imports `DeleteConfirmModal` and `duration.ts`
- **Out of scope:** API changes, new features, strength refactoring

### New Files

```
frontend/src/lib/duration.ts          — parseDuration + formatDuration (extracted from forms)
frontend/src/lib/useWorkoutForm.ts    — shared hook (draft, save, edit, delete, state)
frontend/src/components/WorkoutFormShell.tsx  — UI shell (header, buttons, modals, error/animation)
frontend/src/components/DeleteConfirmModal.tsx — extracted delete modal (used by all 6 forms)
```

### useWorkoutForm Hook API

```typescript
interface UseWorkoutFormOptions<F extends Record<string, string>> {
  type: WorkoutType;
  storagePrefix: string;
  defaultFields: F;
  buildPayload: (fields: F) => Record<string, unknown>;  // builds cycling_details or workout_details
  validate: (fields: F) => string | null;
  loadFromApi: (data: Record<string, unknown>) => Partial<F>;
  hasData?: (fields: F) => boolean;  // optional, defaults to checking any non-empty field
}

interface UseWorkoutFormReturn<F> {
  fields: F;
  setField: (name: keyof F, value: string) => void;
  setFields: (updates: Partial<F>) => void;
  handleSave: () => Promise<void>;
  saving: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  readOnly: boolean;              // shorthand for !!workoutId && !editing
  saveError: string;
  loadingWorkout: boolean;
  showSaveAnimation: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  confirmDelete: () => Promise<void>;
  deleting: boolean;
  dateDisplay: string;
  customEmoji: string;
  setCustomEmoji: (v: string) => void;
  customName: string;
  setCustomName: (v: string) => void;
  hasDraft: boolean;
  workoutId: string | null;
  headerProps: WorkoutFormHeaderProps;  // ready to spread on <WorkoutFormHeader>
}
```

### WorkoutFormShell Component

```tsx
interface WorkoutFormShellProps<F> {
  form: UseWorkoutFormReturn<F>;
  color: string;           // Tailwind class: 'running', 'cycling', etc.
  shadowColor: string;     // CSS rgba for save button shadow
  deleteMessage?: string;  // i18n key for delete confirm text (default: generic)
  children: ReactNode;     // slot for type-specific fields
}
```

Renders: `header → {children} → loading → save animation → error → save button → edit/delete buttons → delete modal`

### Result: Running Form (~30 lines)

```tsx
function RunningForm() {
  const { t } = useI18n();
  const form = useWorkoutForm({
    type: 'course',
    storagePrefix: 'running',
    defaultFields: { duration: '', distance: '' },
    buildPayload: (f) => ({
      workout_details: {
        duration: f.duration ? parseDuration(f.duration) ?? undefined : undefined,
        distance: f.distance ? parseFloat(f.distance) : undefined,
      },
    }),
    validate: (f) => {
      if (f.duration && !parseDuration(f.duration)) return t.errorInvalidDuration;
      if (f.distance && (isNaN(parseFloat(f.distance)) || parseFloat(f.distance) < 0)) return t.errorInvalidDistance;
      return null;
    },
    loadFromApi: (wd) => ({
      duration: wd.duration ? formatDuration(Number(wd.duration)) : '',
      distance: wd.distance ? String(wd.distance) : '',
    }),
  });

  return (
    <WorkoutFormShell form={form} color="running" shadowColor="rgba(52,211,153,0.3)">
      <div className="md:grid md:grid-cols-2 md:gap-4">
        <DurationField value={form.fields.duration} onChange={v => form.setField('duration', v)} disabled={form.readOnly} />
        <DecimalField label={t.distance} value={form.fields.distance} onChange={v => form.setField('distance', v)} disabled={form.readOnly} placeholder="10.5" />
      </div>
    </WorkoutFormShell>
  );
}
```

### Adding a New Type (e.g., "yoga")

1. Add `'yoga'` to `WorkoutType` in `data.ts` + WORKOUT_CONFIG entry
2. Create `app/workout/yoga/page.tsx` with ~20 lines (hook config + fields)
3. Add DB CHECK constraint for 'yoga' type
4. Done

### What Strength Gets

- Imports `DeleteConfirmModal` instead of duplicating ~30 lines of modal JSX
- Imports `parseDuration`/`formatDuration` from `lib/duration.ts` (future use)
- No other changes — keeps its own complex logic
