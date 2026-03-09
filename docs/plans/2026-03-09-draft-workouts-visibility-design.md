# Draft Workouts Visibility — Design

**Goal:** Show unsaved workout drafts (from localStorage) on the calendar and home page as visual indicators.

**Architecture:** Pure client-side. Scan localStorage for draft keys, render draft cards with dashed border + reduced opacity. No backend changes.

## Draft Storage Pattern

All 6 workout types store drafts with key `{prefix}-draft-{date}`:
- `cycling-draft-2026-03-09`
- `strength-draft-2026-03-09`
- `running-draft-2026-03-09`
- `swimming-draft-2026-03-09`
- `walking-draft-2026-03-09`
- `custom-draft-2026-03-09`

Simple types store `{ fields, customEmoji, customName }`. Strength stores exercise entries array + separate `-meta` key for emoji/name.

## Utility: getDraftWorkouts()

New file `frontend/src/lib/drafts.ts`:
- Scans localStorage for all `{prefix}-draft-*` keys
- Returns `DraftWorkout[]` with `{ type, date, emoji?, name? }`
- Maps storage prefix back to WorkoutType (cycling→velo, strength→musculation, etc.)
- Optionally filtered by date or date range

## Calendar Changes

- Call `getDraftWorkouts()` filtered to current month
- Grid cells: show draft chip with dashed border + 50% opacity (same emoji/tag as saved workouts)
- Day panel: show draft card with dashed border + opacity + "Brouillon"/"Draft" label
- Click redirects to `/workout/{type}?date={date}` (loads draft automatically)
- Drafts don't count toward background color intensity

## Home Page Changes

- Call `getDraftWorkouts()` filtered to today
- "Today" section: show draft cards after saved workouts, same dashed + opacity style
- Click redirects to form

## i18n

- Add `draft` key: FR "Brouillon", EN "Draft"

## No Changes

- No API/backend modifications
- Weekly tracker unchanged (confirmed workouts only)
- Stats unchanged
- No new component — conditional styling on existing cards
