# Duration Input — Smart Text Field

## Problem
Currently the cycling duration input is a plain number field (minutes only). Users must mentally convert "2h30" → "150" before entering.

## Solution
Replace with a single text field that accepts multiple formats and normalizes on blur.

## Parsing Rules

| Input | Interpretation | Display |
|---|---|---|
| `2h30` | 150 min | `2h 30min` |
| `2h` | 120 min | `2h` |
| `1:45` | 105 min | `1h 45min` |
| `90` | 90 min | `1h 30min` |
| `45` | 45 min | `45min` |
| `2h30min` | 150 min | `2h 30min` |
| `30m` | 30 min | `30min` |

- Number alone = always minutes (backward compatible)
- Regex patterns: `Xh[Y[min]]`, `X:Y`, `N[min|m]`

## Behavior
- `<input type="text">` with `inputMode="text"` (need "h", "m", ":" characters)
- Placeholder: "ex: 1h30" (FR) / "e.g. 1h30" (EN)
- On blur: normalize display (e.g. "90" → "1h 30min")
- Internal storage: always minutes (integer), unchanged for backend
- Loading existing workout: `duration: 150` displays as "2h 30min"
- localStorage draft: saves the displayed text (normalized)

## Files Changed
- `frontend/src/app/workout/cycling/page.tsx` — replace number input with smart text field
- `frontend/src/lib/i18n.tsx` — add translated placeholder

## No Backend Changes
API still receives `duration: integer` (minutes).
