---
paths:
  - "frontend/src/app/workout/**"
  - "frontend/src/lib/data.ts"
  - "frontend/src/lib/useWorkoutForm.ts"
---

# Adding a New Workout Type (checklist)

1. **DB**: Add value to `workouts.type` CHECK constraint in Supabase
2. **`data.ts`**: Add to `WorkoutType` union + `WORKOUT_TYPES` array + `WORKOUT_CONFIG` (emoji, color, colorSoft, route)
3. **Tailwind**: Add color classes in `tailwind.config.ts` if new color. Also add to `colorClasses` map in `WorkoutFormShell.tsx`
4. **`i18n.tsx`**: Add translation keys (FR + EN) to `workoutTypeLabels` and `workoutTypeTags`
5. **`useWorkoutForm.ts`**: Add workout name mapping in `workoutNames` record
6. **Page**: Create `frontend/src/app/workout/NEWTYPE/page.tsx` — copy from `running/page.tsx` (simplest) and adapt
7. **API**: If using `workout_details`, add type to allowed list in `frontend/src/app/api/workouts/route.ts`
8. **Zod**: Add type to schemas in `frontend/src/lib/validations.ts`
9. **Calendar**: Auto-appears via `WORKOUT_CONFIG` lookup
10. **Home/Stats**: `api.ts` `toWorkout()` needs a case for the new type's detail string
