# Weekly Medal Highlights — Design

## Goal

Visually highlight weeks in the calendar where the user earned medals (3+ workouts), with a per-week medal count badge on the right side and a subtle row tint.

## Visual Treatment

- **Row tint**: faint `accent/8` background on the entire week row (all 7 day cells + badge) for qualifying weeks.
- **Right badge**: a narrow 8th column (~24px) to the right of Sunday. Qualifying weeks show a small medal icon + count (e.g. `1`, `2`). Non-qualifying weeks show nothing.
- Badge is compact, vertically centered in the row, accent-colored text.

## Data Flow

- **New backend endpoint**: `GET /api/stats/weekly-medals?month=YYYY-MM`
- Returns: `Array<{ week_start: string, workout_count: number, medals: number }>`
- SQL: groups workouts by ISO week (`date_trunc('week', date)`), computes `GREATEST(count - 2, 0)` medals per week.
- Returns all weeks overlapping the requested month (including partial weeks at start/end of month).

## Calendar Grid Change

- Grid changes from `grid-cols-7` to `grid-cols-[repeat(7,1fr)_24px]`.
- Day header row gets an empty 8th cell.
- Each week row gets a badge cell in the 8th column.
- Row tint applied via a wrapper or by adding background to each cell in qualifying weeks.

## Cross-month Weeks

- Weeks spanning two months show tint + badge on both months.
- Backend query uses `week_start < month_end AND week_start + 7 days > month_start` to catch overlapping weeks.

## Isolation

- Built on branch `feat/weekly-medal-highlights`, easy to revert.
