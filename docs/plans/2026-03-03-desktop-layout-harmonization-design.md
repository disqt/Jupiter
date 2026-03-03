# Desktop Layout Harmonization

## Problem

Inconsistent content widths and alignment across pages on desktop:
- HomePage/Profile/Workouts: 448px (max-w-xl)
- Stats: 768px (max-w-3xl)
- Calendar: 1024px (max-w-6xl) with 2-column layout
- Padding varies: some pages use lg:px-8, others don't
- Some pages centered, others left-aligned

## Solution

Two CSS utility classes in `globals.css` that standardize layout on desktop:

```css
@layer utilities {
  .page-container {
    @apply lg:max-w-4xl lg:mx-auto lg:px-8;
  }
  .page-container-wide {
    @apply lg:max-w-6xl lg:mx-auto lg:px-8;
  }
}
```

## Page assignments

| Page | Class | Reason |
|------|-------|--------|
| HomePage | `page-container` | Standard content page |
| Calendar | `page-container-wide` | Needs width for 2-column layout |
| Stats | `page-container` | Standard content page |
| Profile | `page-container` | Standard content page |
| Workout forms | `page-container` | Standard content page |

## Changes per file

1. **globals.css** — Add utility classes
2. **HomePage.tsx** — Replace `lg:max-w-xl lg:mx-auto` with `page-container`
3. **Calendar.tsx** — Replace `lg:max-w-6xl` + `lg:px-8` with `page-container-wide`
4. **StatsPage.tsx** — Replace `lg:max-w-3xl lg:mx-auto` with `page-container`
5. **profile/page.tsx** — Replace `lg:max-w-xl lg:mx-auto` with `page-container`
6. **Workout form pages** (6 files) — Replace `lg:max-w-xl lg:mx-auto lg:pb-20` with `page-container`

No changes to layout.tsx or BottomNav.
