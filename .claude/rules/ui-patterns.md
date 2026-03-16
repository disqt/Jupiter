---
paths:
  - "frontend/src/components/**"
  - "frontend/src/app/workout/**"
  - "frontend/src/app/profile/**"
---

# UI Patterns & Components

## Bottom Sheets
`BottomSheet` component (`frontend/src/components/BottomSheet.tsx`) — backdrop, notch, animation, swipe-to-close. Props: `open`, `onClose`, `desktopSidebarOffset` (sidebar offset on lg:), `fullScreenMobile` (exercise picker), `className`. Scrollable children need `data-bottom-sheet-scroll`. All bottom-sheet modals: notch at top + "Annuler" button at bottom. No X close buttons. Homepage modals pass `desktopSidebarOffset`.

## Strength Exercise Cards
Chevron on left (collapse toggle), three-dot menu (⋮) on right. Collapsed by default in view mode (summary like "4×10 @ 80kg" or "3× 45s"), expanded in edit mode. Menu options: History (always), Replace (edit — exercise picker, confirmation if data exists), Tracking mode (edit — BottomSheet with selectable cards), Add note (edit, hidden when note visible), Remove (edit, red, confirmation modal).

## Exercise Tracking Modes
`reps-weight` (default — columns: Set, Previous, Reps, Weight) and `time` (columns: Set, Previous, Duration in seconds). Mode stored per exercise_log (`mode` column) + per exercise as default (`exercises.default_mode`). Time input: `inputMode="numeric"`, raw seconds, formatted as mm:ss in view/history. Auto-fills empty sets below on blur.

## New Exercise Modal
Name + muscle group + tracking mode selector (two side-by-side cards: dumbbell "Reps & poids" / chrono "Temps"). Default mode persists to `exercises.default_mode`.

## Profile Page
Sectioned cards with `Section` (icon + title) and `SettingRow`. Sections: avatar header, profile (nickname), security (password), app settings (language dropdown), logout button, delete account button. Guest view: centered avatar + CTA + settings. Login/register forms in `<form>` (Enter submits).

## Desktop Layout
`page-container` (896px) / `page-container-wide` (1152px) utility classes in `globals.css`. Calendar uses `page-container-wide`, all others use `page-container`.

## Page Titles
Calendar, Stats, Profile: `h1.font-serif.text-[22px].font-normal` inside `div.pt-14.pb-4.lg:pt-8`. HomePage has its own greeting pattern.

## WorkoutFormShell
Save button uses static `colorClasses` map (NOT dynamic `bg-${color}`) — Tailwind cannot detect dynamic class names.
