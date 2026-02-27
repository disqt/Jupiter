# New Workout Types + Custom Emoji & Name

## Problem
App only supports 2 workout types (cycling, strength). Users need running, swimming, and a custom type. All workouts should have customizable emoji and name.

## Types

| Type | DB slug | Default emoji | Color |
|---|---|---|---|
| Vélo | `velo` | 🚴 | `#3b9eff` (blue) |
| Musculation | `musculation` | 🏋️ | `#ff8a3b` (orange) |
| Course à pied | `course` | 🏃 | `#34d399` (emerald) |
| Natation | `natation` | 🏊 | `#06b6d4` (cyan) |
| Personnalisé | `custom` | 🎯 | `#a78bfa` (violet/accent) |

## Database Changes

### Table `workouts` — new columns
- `custom_emoji VARCHAR(10) NULL` — overrides default type emoji
- `custom_name VARCHAR(100) NULL` — overrides default type name

### New table `workout_details`
For running, swimming, custom types (cycling_details and exercise_logs stay unchanged):
- `id SERIAL PRIMARY KEY`
- `workout_id INT REFERENCES workouts(id) ON DELETE CASCADE`
- `duration INT NULL` (minutes)
- `distance DECIMAL(10,2) NULL` (km)
- `elevation INT NULL` (m)
- `laps INT NULL` (swimming laps)

## Fields Per Type

| Type | Fields |
|---|---|
| Vélo | ride_type, duration, distance, elevation (unchanged) |
| Musculation | exercises/sets (unchanged) |
| Course | duration, distance |
| Natation | duration, laps (optional) |
| Custom | duration (required), + "Add field" button → distance, elevation |

## Custom Emoji
- Curated grid of ~30 sport/fitness emojis in bottom-sheet
- Stored in `workouts.custom_emoji`
- If null → default emoji for the type
- Visible in: form header + calendar

## Custom Name
- Pen icon next to title in form header
- Click → modal with text input pre-filled with default name
- Stored in `workouts.custom_name`
- If null → default translated type name
- Visible in: form header + calendar detail

## Stats API Restructure
```json
{
  "total_count": "12",
  "counts_by_type": { "velo": "4", "musculation": "3", "course": "2", "natation": "2", "custom": "1" },
  "total_distance_km": "127",
  "total_elevation_m": "2450",
  "active_days": "10"
}
```

## Frontend Routes
- `/workout/running` (course)
- `/workout/swimming` (natation)
- `/workout/custom` (custom)
- Existing `/workout/cycling` and `/workout/strength` unchanged

## Calendar Abstraction
Replace hardcoded ternaries with a type → config lookup table:
```ts
const WORKOUT_CONFIG: Record<WorkoutType, { emoji, color, colorSoft, label, route }> = { ... }
```

## Custom Form — "Add Field" Button
Bottom of custom form has a button that opens a picker:
- Distance (km)
- Elevation (m)
Selected fields appear as inputs in the form. Deselecting removes them.
