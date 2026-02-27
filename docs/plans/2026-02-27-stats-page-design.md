# Stats Page Design

## Overview

Full stats page replacing the disabled "Stats" tab. Single scrollable page with period selector (month/year), Recharts graphs, and summary cards. Dark theme consistent with existing app design.

## Data Sources

### Existing API endpoints
- `GET /api/stats/monthly?month=YYYY-MM` — total_count, counts_by_type, total_distance_km, total_elevation_m, active_days
- `GET /api/stats/weekly-progress` — week_count, total_medals
- `GET /api/stats/weekly-medals?month=YYYY-MM` — medals per week (week_start, workout_count, medals)

### New API endpoints needed
- `GET /api/stats/medals-history` — cumulative medals over time (all weeks since first workout)
- `GET /api/stats/distance-by-type?month=YYYY-MM` or `?year=YYYY` — distance broken down by sport and time period
- `GET /api/stats/monthly?year=YYYY` — same aggregates but for full year (extend existing endpoint)
- `GET /api/stats/strength-volume?month=YYYY-MM` or `?year=YYYY` — total tonnage (reps x weight) and exercise count

## Sections (top to bottom)

### 1. Period Selector
- Toggle: "Mois" / "Annee" (pill buttons)
- Month mode: `< Fevrier 2026 >` navigation arrows (same pattern as Calendar)
- Year mode: `< 2026 >` navigation arrows
- All sections below react to the selected period

### 2. Summary Cards (horizontal scroll)
Four cards in a horizontal scrollable row:
- **Total sessions** — number + type emoji breakdown below
- **Distance** — total km
- **Elevation** — total m
- **Active days** — count

Cards use `bg-card` background, same border-radius as existing cards.

### 3. Medal Progression Graph (always full history)
- Recharts `AreaChart` with gradient fill
- X axis: weeks (labeled by month)
- Y axis: cumulative medal count
- Color: accent purple (`#a78bfa`) with soft gradient fill
- NOT filtered by period selector — always shows full history to visualize progression
- Tooltip on touch: "Semaine du X: Y medailles (total: Z)"

### 4. Workout Type Distribution (filtered by period)
- Recharts `PieChart` / donut
- Each slice = one workout type, colored by sport color (cycling blue, strength orange, etc.)
- Center: total count
- Legend below with type labels + counts
- Filtered by selected month or year

### 5. Distance by Sport (filtered by period, filterable by sport)
- Recharts `BarChart`
- Filter chips at top: All / Velo / Course / Natation / Marche / Custom (toggleable)
- Month mode: bars grouped by week (W1, W2, W3, W4)
- Year mode: bars grouped by month (Jan, Feb, ...)
- Stacked bars, one color per sport type
- Tooltip: sport name + distance

### 6. Strength Volume (filtered by period, conditional)
- Only shown if user has musculation workouts in the period
- Simple stat card (no chart):
  - Total tonnage (sum of reps x weight across all sets) in kg
  - Total exercises performed
  - Total sets
- Uses `bg-card` styling

## Tech Stack
- **Recharts** (npm install recharts) — React-native chart components
- **Frontend only** — new page at `/stats`, "use client"
- **Backend** — 3-4 new SQL endpoints in stats.ts

## Colors
Charts use sport-specific colors from tailwind config:
- cycling: `#3b9eff`
- strength: `#ff8a3b`
- running: `#34d399`
- swimming: `#06b6d4`
- walking: `#f59e0b`
- custom: `#a78bfa`
- medal accent: `#a78bfa`

## i18n
All labels translated FR/EN. New keys needed for section titles, tooltips, period labels.
