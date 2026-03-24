# Cardio Session Types & Library — Design Spec

## Goal

Add a "session type" optional field to all cardio workout forms (cycling, running, swimming, walking) and a static library of educational articles per sport explaining common training concepts (endurance, intervals, tempo, recovery, etc.). The library is accessible via an inspiration card on empty forms and a ⋮ header menu entry.

## Scope

Three deliverables:

1. **Session type field** on all cardio forms (optional, toggle-to-show)
2. **Library page** per sport listing session type articles
3. **Article page** with rich editorial design (structured blocks, scroll animations)

Out of scope: custom workouts (no session type), guest mode library (hidden behind auth), user-generated content, CMS.

---

## Part 1: Session Type Field

### Session types per sport

**Cycling (`velo`):**
- `endurance` — Endurance
- `intervals` — Intervalles
- `tempo` — Tempo
- `recovery` — Récupération
- `climbing` — Côtes / Grimpée

**Running (`course`):**
- `endurance` — Endurance
- `intervals` — Intervalles
- `tempo` — Tempo
- `recovery` — Récupération
- `fartlek` — Fartlek

**Swimming (`natation`):**
- `endurance` — Endurance
- `intervals` — Intervalles
- `technique` — Technique
- `recovery` — Récupération
- `mixed` — Mixte

**Walking (`marche`):**
- `walk` — Balade
- `brisk` — Marche rapide
- `hike` — Randonnée
- `recovery` — Récupération

### Data model

**Constants** in `data.ts`:

```typescript
export const SESSION_TYPES: Record<string, string[]> = {
  velo: ['endurance', 'intervals', 'tempo', 'recovery', 'climbing'],
  course: ['endurance', 'intervals', 'tempo', 'recovery', 'fartlek'],
  natation: ['endurance', 'intervals', 'technique', 'recovery', 'mixed'],
  marche: ['walk', 'brisk', 'hike', 'recovery'],
};
```

DB values are English lowercase keys. Display via `t.sessionTypes[key]`.

### Database

Add `session_type VARCHAR(30)` column:
- `cycling_details.session_type` (nullable, no default)
- `workout_details.session_type` (nullable, no default)

Migration: `ALTER TABLE cycling_details ADD COLUMN session_type VARCHAR(30);` and same for `workout_details`.

### Form integration

Follow the **custom page optional field pattern** (`_activeFields` toggle):

- Field hidden by default
- `+ Type de séance` button shown below mandatory fields (same row as `+ Distance` on custom page)
- On click: field appears as a `<select>` dropdown with sport-specific session types
- `Remove` link to hide and clear the field
- Value included in payload only when active
- On edit/load: if `session_type` is non-null, add to `_activeFields` automatically

**Cycling specifics:** The `+ Type de séance` button appears in the add-fields row, below the existing always-visible fields (ride type, duration, distance, elevation). Ride type stays a separate, always-visible field.

### i18n keys

```typescript
sessionType: 'Type de séance' / 'Session type',
addSessionType: '+ Type de séance' / '+ Session type',
sessionTypes: {
  endurance: 'Endurance' / 'Endurance',
  intervals: 'Intervalles' / 'Intervals',
  tempo: 'Tempo' / 'Tempo',
  recovery: 'Récupération' / 'Recovery',
  climbing: 'Côtes / Grimpée' / 'Climbing',
  fartlek: 'Fartlek' / 'Fartlek',
  technique: 'Technique' / 'Technique',
  mixed: 'Mixte' / 'Mixed',
  walk: 'Balade' / 'Walk',
  brisk: 'Marche rapide' / 'Brisk walk',
  hike: 'Randonnée' / 'Hike',
} as Record<string, string>,
```

### API changes

- **POST/PUT workouts:** Accept `session_type` in `cycling_details` and `workout_details` payloads. Validate against `SESSION_TYPES[workoutType]` — reject unknown values.
- **GET workouts:** Return `session_type` in details response (already included if column exists).
- **Zod validation:** Add `session_type: z.string().max(30).optional()` to cycling and workout details schemas.

---

## Part 2: Inspiration Card & Menu

### Inspiration card (empty state)

Shown at the top of the form (below header, above fields) when **all form fields are empty** and the workout is **new** (no `workoutId`).

**Design:**
- Subtle gradient card (`#1a2332` → `#1a1b22`), blue-tinted border (`#2a3a4a`)
- Left: 💡 emoji
- Center: "Besoin d'inspiration ?" + "Découvrez nos séances type {sport}"
- Right: "Voir →" in sport accent color
- Tap opens `/workout/{sport}/library`
- Dismissable with × (persist dismiss in localStorage `library-card-dismissed-{sport}` for session)

**Visibility rules:**
- New workout only (`!workoutId`)
- All form fields empty (duration, distance, etc.)
- Not dismissed this session
- Not in read-only or edit mode

### Header menu (⋮)

Add `headerRight` menu to all 4 cardio pages, following the strength page pattern:

- Show only when `!loadingWorkout && (!workoutId || editing)`
- Menu contains: "Séances type" entry → navigates to `/workout/{sport}/library`
- For cycling: also keep any future menu items (currently none beyond this)
- For running/swimming/walking: new menu, single entry

**i18n:** `libraryMenuLabel: 'Séances type' / 'Session guides'`

---

## Part 3: Library Page

### Route

`/workout/[sport]/library` — e.g. `/workout/cycling/library`

Implemented as `frontend/src/app/workout/[sport]/library/page.tsx` with dynamic `[sport]` param. Validates sport is one of `velo`, `course`, `natation`, `marche`. Redirects to `/` if invalid.

### Layout

- **Header:** Back button (→ `/workout/{sport}`) + title "Séances type" (serif, 24px) + subtitle "{Sport} — {n} séances"
- **List:** Cards in a vertical stack, one per session type article
- Each card: colored tag (by session type) + article title + one-line description + chevron `›`
- Tap → `/workout/[sport]/library/[sessionType]`

### Tag colors (consistent across sports)

| Session type | Tag color | Background |
|---|---|---|
| endurance | `#4ade80` green | `#1a3a2a` |
| intervals | `#f87171` red | `#3a1a1a` |
| tempo | `#facc15` yellow | `#2a2a1a` |
| recovery | `#60a5fa` blue | `#1a2a3a` |
| climbing | `#c084fc` purple | `#2a1a2a` |
| fartlek | `#fb923c` orange | `#2a1a0a` |
| technique | `#2dd4bf` teal | `#0a2a2a` |
| mixed | `#a78bfa` violet | `#1a1a3a` |
| walk | `#4ade80` green | `#1a3a2a` |
| brisk | `#facc15` yellow | `#2a2a1a` |
| hike | `#c084fc` purple | `#2a1a2a` |

---

## Part 4: Article Page

### Route

`/workout/[sport]/library/[sessionType]` — e.g. `/workout/cycling/library/endurance`

### Content structure

Static content in `frontend/src/lib/library-content.ts`. Each article is a typed array of blocks:

```typescript
export type ArticleBlock =
  | { type: 'hero'; tag: string; title: string; subtitle: string }
  | { type: 'big-numbers'; items: { value: string; label: string }[] }
  | { type: 'intro'; title: string; text: string }
  | { type: 'benefits-grid'; title: string; items: { emoji: string; title: string; text: string }[] }
  | { type: 'caution'; items: string[] }
  | { type: 'examples'; title: string; items: ExampleSession[] }
  | { type: 'tip'; text: string };

export interface ExampleSession {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  metrics: { label: string; value: string }[];
  description: string;
}

export interface LibraryArticle {
  sport: string;
  sessionType: string;
  blocks: ArticleBlock[];
}
```

### Block rendering

Each block type maps to a React component with scroll-triggered animation (fade-in + slide-up via Intersection Observer or CSS `animation-timeline: view()`).

| Block | Design |
|---|---|
| `hero` | Gradient bg (sport color tinted), tag pill, serif title (28px), subtitle text |
| `big-numbers` | Row of 2-3 stat cards, large serif numbers in sport accent, small uppercase label |
| `intro` | Section title (16px bold) + body text (13px, `#c0bfc8`, 1.7 line-height) |
| `benefits-grid` | 2×2 grid of cards with emoji + title + short text |
| `caution` | Yellow-tinted card with ⚠️ icon + bullet list |
| `examples` | Stacked cards with level tag (Débutant/Inter./Avancé color-coded) + metrics row + description |
| `tip` | Left-bordered card with 💡 emoji + tip text (no quotes, no attribution) |

### Editorial guidelines

- **Tone:** Accessible, encouraging, aimed at beginners
- **Technical terms:** Always followed by a parenthetical explanation — e.g. "zone 2 (allure où vous pouvez discuter)", "aérobie (énergie produite grâce à l'oxygène)"
- **Limit jargon:** Prefer plain language. Use technical terms only when they add real value.
- **Examples:** Include beginner, intermediate, and advanced variants
- **i18n:** All article content in both FR and EN (in the static file)

### Article renderer component

`frontend/src/components/LibraryArticle.tsx` — takes `blocks: ArticleBlock[]` + `sport` + `sessionType`, renders each block with animation. Uses `frontend-design` skill for rich visual implementation.

---

## Part 5: Static content file

`frontend/src/lib/library-content.ts` — exports:

```typescript
export const LIBRARY_ARTICLES: LibraryArticle[] = [...]
```

Approximately 19 articles total (5 cycling + 5 running + 5 swimming + 4 walking). Content will be authored separately after the technical implementation is complete. For initial implementation, include 1 complete article (cycling/endurance) as a reference and leave the rest as TODO stubs with just hero blocks.

---

## File summary

| Action | File |
|---|---|
| Create | `frontend/src/app/workout/[sport]/library/page.tsx` |
| Create | `frontend/src/app/workout/[sport]/library/[sessionType]/page.tsx` |
| Create | `frontend/src/components/LibraryArticle.tsx` |
| Create | `frontend/src/lib/library-content.ts` |
| Modify | `frontend/src/lib/data.ts` (SESSION_TYPES, tag colors) |
| Modify | `frontend/src/lib/i18n.tsx` (session type labels, library i18n keys) |
| Modify | `frontend/src/lib/validations.ts` (session_type in Zod schemas) |
| Modify | `frontend/src/lib/schema.ts` (session_type columns) |
| Modify | `frontend/src/app/workout/cycling/page.tsx` (+ session type field, + ⋮ menu, + inspiration card) |
| Modify | `frontend/src/app/workout/running/page.tsx` (same) |
| Modify | `frontend/src/app/workout/swimming/page.tsx` (same) |
| Modify | `frontend/src/app/workout/walking/page.tsx` (same) |
| Modify | `frontend/src/app/api/workouts/route.ts` (accept session_type) |
| Modify | `frontend/src/components/WorkoutFormShell.tsx` (inspiration card slot) |
| DB migration | `ALTER TABLE` for both details tables |

## Out of scope

- Custom workout session types
- Guest mode library access
- User-generated articles / CMS
- Session type in stats/charts (future feature)
- Filtering workouts by session type
