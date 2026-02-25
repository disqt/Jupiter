# Gamification: Weekly Progress Bar + Medal System

## Overview

Add a gamification layer to Jupiter Tracker: a weekly progress bar in the sticky header that tracks workouts per week, and a medal system rewarding consistency.

## Rules

- Week = Monday to Sunday (ISO)
- Bar fills based on workouts completed this week (any type counts)
- 3 workouts in a week = 1 medal
- Each additional workout above 3 = 1 extra medal (4 workouts = 2 medals, 5 = 3, etc.)
- Medal awarded instantly when the qualifying workout is saved
- Medals are retroactive — calculated from full workout history
- No new database table — medals derived from workout dates

## Data Layer (`data.ts`)

New functions:
- `getWeekBounds(date: string)` — returns `{ monday, sunday }` as YYYY-MM-DD strings
- `getWorkoutsForWeek(monday: string, sunday: string)` — filters DUMMY_WORKOUTS by date range
- `getWeeklyProgress(date: string)` — returns `{ count, medals, weekStart, weekEnd }` for the week containing `date`
- `getTotalMedals()` — iterates all weeks from first workout to current week, sums medals per week (`max(0, count - 2)`)

## UI: Sticky Header (mobile + desktop)

### Mobile header (enriched existing)

```
┌─────────────────────────────────┐
│ Jupiter Tracker          🏅 x7  │
│ ████████████░░░░░░  2/3         │
└─────────────────────────────────┘
```

- Line 1: title left, medal counter right (violet flat SVG icon + count)
- Line 2: progress bar below, "N/3" label right of bar

### Desktop sidebar

Same medal counter + progress bar below the "Jupiter Tracker" branding.

### Progress bar styling

- Track: `bg-border` (#2a2b32), 4px height, `rounded-full`
- Fill: gradient `from-accent to-[#8b5cf6]`, animated width via `transition-all`
- At 3/3: full bar + subtle violet glow (`box-shadow`)
- At 4+: bar stays full, glow intensifies per extra workout (increasing opacity + spread)

### Medal icon

SVG flat design, monochrome violet (#a78bfa). Circle with star inside.

## UI: Key Insights ("Ce mois-ci")

New 5th stat card in the existing grid:
- `col-span-2` for full width
- Top accent bar: violet gradient
- Value in `text-accent`, label "Medailles gagnees"
- Shows total cumulated medals (not monthly)

## Animation: Medal Celebration

When returning to calendar after saving a qualifying workout:
- Medal icon in header does a scale bounce (1 -> 1.3 -> 1)
- "+1" text floats up and fades out beside the icon
- Sober, no confetti — matches existing save animation tone
