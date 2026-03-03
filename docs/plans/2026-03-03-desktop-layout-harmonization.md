# Desktop Layout Harmonization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harmonize desktop content width, padding, and centering across all pages using shared CSS utility classes.

**Architecture:** Two utility classes (`page-container`, `page-container-wide`) defined in `globals.css` replace per-page ad-hoc `lg:max-w-*` / `lg:mx-auto` / `lg:px-*` classes. All standard pages use `page-container` (max-w-4xl, 896px). Calendar keeps `page-container-wide` (max-w-6xl) for its 2-column layout.

**Tech Stack:** Tailwind CSS `@layer utilities`, Next.js App Router pages

---

### Task 1: Add utility classes to globals.css

**Files:**
- Modify: `frontend/src/app/globals.css` (after line 3, after `@tailwind utilities;`)

**Step 1: Add the two page-container utility classes**

At the end of `globals.css` (after the `.auth-float-delayed` block, line 33), add:

```css
/* Desktop page containers */
@layer utilities {
  .page-container {
    @apply lg:max-w-4xl lg:mx-auto lg:px-8;
  }
  .page-container-wide {
    @apply lg:max-w-6xl lg:mx-auto lg:px-8;
  }
}
```

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors

**Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat: add page-container utility classes for desktop layout"
```

---

### Task 2: Update HomePage container

**Files:**
- Modify: `frontend/src/components/HomePage.tsx:112` and `:125`

**Step 1: Replace container classes**

Line 112 — loading state wrapper:
```
// Before:
<div className="px-5 pb-36 lg:max-w-xl lg:mx-auto lg:pb-20">
// After:
<div className="page-container px-5 pb-36 lg:pb-20">
```

Line 125 — main content wrapper:
```
// Before:
<div className="px-5 pb-36 lg:max-w-xl lg:mx-auto lg:pb-20">
// After:
<div className="page-container px-5 pb-36 lg:pb-20">
```

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add frontend/src/components/HomePage.tsx
git commit -m "feat: use page-container on HomePage"
```

---

### Task 3: Update Calendar container

**Files:**
- Modify: `frontend/src/components/Calendar.tsx:232`

**Step 1: Replace container classes**

Line 232:
```
// Before:
<div className="px-5 pb-5 lg:flex lg:gap-8 lg:px-8 lg:pt-8 lg:max-w-6xl">
// After:
<div className="page-container-wide px-5 pb-5 lg:flex lg:gap-8 lg:pt-8">
```

Note: `lg:px-8` and `lg:max-w-6xl` are now in `page-container-wide`, so remove them. Keep `lg:flex lg:gap-8 lg:pt-8` which are layout-specific.

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add frontend/src/components/Calendar.tsx
git commit -m "feat: use page-container-wide on Calendar"
```

---

### Task 4: Update StatsPage container

**Files:**
- Modify: `frontend/src/components/StatsPage.tsx:258`

**Step 1: Replace container classes**

Line 258:
```
// Before:
<div className="px-5 pb-24 lg:max-w-3xl lg:mx-auto overflow-x-hidden">
// After:
<div className="page-container px-5 pb-24 overflow-x-hidden">
```

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add frontend/src/components/StatsPage.tsx
git commit -m "feat: use page-container on StatsPage"
```

---

### Task 5: Update Profile page container

**Files:**
- Modify: `frontend/src/app/profile/page.tsx:75`

**Step 1: Replace container classes**

Line 75:
```
// Before:
<div className="px-5 pb-20 lg:max-w-xl lg:mx-auto">
// After:
<div className="page-container px-5 pb-20">
```

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add frontend/src/app/profile/page.tsx
git commit -m "feat: use page-container on Profile page"
```

---

### Task 6: Update all workout form pages

**Files:**
- Modify: `frontend/src/app/workout/cycling/page.tsx:173`
- Modify: `frontend/src/app/workout/running/page.tsx:166`
- Modify: `frontend/src/app/workout/swimming/page.tsx:166`
- Modify: `frontend/src/app/workout/walking/page.tsx:166`
- Modify: `frontend/src/app/workout/custom/page.tsx:197`
- Modify: `frontend/src/app/workout/strength/page.tsx:354`

**Step 1: Replace container classes on all 6 pages**

For cycling, running, swimming, walking, custom (same pattern):
```
// Before:
<div className="px-5 pb-36 lg:max-w-xl lg:mx-auto lg:pb-20">
// After:
<div className="page-container px-5 pb-36 lg:pb-20">
```

For strength (already uses max-w-4xl):
```
// Before:
<div className="px-5 pb-36 lg:max-w-4xl lg:mx-auto lg:pb-20">
// After:
<div className="page-container px-5 pb-36 lg:pb-20">
```

**Step 2: Verify build**

Run: `cd frontend && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add frontend/src/app/workout/
git commit -m "feat: use page-container on all workout form pages"
```

---

### Task 7: Visual verification

**Step 1: Start dev server**

Run: `cd /Users/sylvainmerle/Documents/Sport && npm run dev`

**Step 2: Check all pages on desktop (wide browser window)**

Verify consistent width and centering on:
- [ ] `/` (home)
- [ ] `/calendar` (wider, 2-col layout preserved)
- [ ] `/stats`
- [ ] `/profile`
- [ ] `/workout/cycling`
- [ ] `/workout/strength`

**Step 3: Check mobile (narrow browser window or devtools)**

Verify no regressions — pages should look identical to before on mobile.
