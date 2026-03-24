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

Follow the **custom page optional field pattern** (`_activeFields` toggle). Note: cycling, running, swimming, and walking pages do NOT currently use the `_activeFields` mechanism — only the custom page does. Each cardio page must be updated to:

1. Add `_activeFields: ''` and `sessionType: ''` to `defaultFields`
2. Add the toggle logic (same `Set`-based pattern as custom page)
3. Include `session_type` in `buildPayload` only when active
4. Reconstruct `_activeFields` from non-null `session_type` in `loadFromApi`

**Field behavior:**
- Hidden by default
- `+ Type de séance` button shown below mandatory fields (same style as `+ Distance` on custom page)
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

- **POST workouts** (`frontend/src/app/api/workouts/route.ts`): Accept `session_type` in `cycling_details` and `workout_details` payloads. Include in INSERT queries.
- **PUT workouts** (`frontend/src/app/api/workouts/[id]/route.ts`): Accept `session_type` in UPDATE payloads. Include in UPDATE queries.
- **GET workouts** (`frontend/src/app/api/workouts/route.ts` and `[id]/route.ts`): The SELECT queries explicitly name columns (no `SELECT *`). Add `cd.session_type` and `wd.session_type` to the SELECT lists.
- **Zod validation** (`validations.ts`): Add `session_type: z.string().max(30).optional()` to `cyclingDetailsSchema` and `workoutDetailsSchema`. Add a `.refine()` that validates the value against `SESSION_TYPES[workoutType]` in the route handlers (since the Zod schema doesn't know the workout type).
- **Guest storage** (`guest-storage.ts`): Add `session_type` to the guest workout details interface so guest workouts preserve the field.

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
- No data entered yet — use `useWorkoutForm`'s `hasData` function (returns false when all fields empty)
- Not dismissed this session

### Header menu (⋮)

Add `headerRight` menu to all 4 cardio pages, following the strength page pattern. Currently `WorkoutFormShell` accepts a `headerRight` prop but only the strength page uses it. Cardio pages must pass their own `headerRight` to the shell.

- Show only when `!loadingWorkout && (!workoutId || editing)`
- Menu contains: "Séances type" entry → navigates to `/workout/{sport}/library`
- For cycling: also keep any future menu items (currently none beyond this)
- For running/swimming/walking: new menu, single entry
- Extract a reusable `CardioHeaderMenu` component (shared across 4 pages) that renders the ⋮ button + dropdown with "Séances type" entry

**i18n:** `libraryMenuLabel: 'Séances type' / 'Session guides'`

---

## Part 3: Library Page

### Route

`/workout/{sport}/library` — e.g. `/workout/cycling/library`

Uses **static route folders** per sport (matching existing codebase pattern — no dynamic `[sport]` segment):
- `frontend/src/app/workout/cycling/library/page.tsx`
- `frontend/src/app/workout/running/library/page.tsx`
- `frontend/src/app/workout/swimming/library/page.tsx`
- `frontend/src/app/workout/walking/library/page.tsx`

Each page imports a shared `LibraryListPage` component passing its sport config (DB type, URL slug, accent color). The shared component lives at `frontend/src/components/LibraryListPage.tsx`.

**URL slug → DB type mapping** (in `data.ts`):
| URL slug | DB type |
|---|---|
| `cycling` | `velo` |
| `running` | `course` |
| `swimming` | `natation` |
| `walking` | `marche` |

Article sub-pages follow the same static pattern:
- `frontend/src/app/workout/cycling/library/[sessionType]/page.tsx` (dynamic only for session type)
- Same for running, swimming, walking

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
| Create | `frontend/src/components/LibraryListPage.tsx` (shared library list component) |
| Create | `frontend/src/components/LibraryArticle.tsx` (article block renderer) |
| Create | `frontend/src/components/CardioHeaderMenu.tsx` (shared ⋮ menu for cardio pages) |
| Create | `frontend/src/components/InspirationCard.tsx` (shared inspiration card) |
| Create | `frontend/src/lib/library-content.ts` (static article data) |
| Create | `frontend/src/app/workout/cycling/library/page.tsx` (thin wrapper) |
| Create | `frontend/src/app/workout/cycling/library/[sessionType]/page.tsx` |
| Create | `frontend/src/app/workout/running/library/page.tsx` (thin wrapper) |
| Create | `frontend/src/app/workout/running/library/[sessionType]/page.tsx` |
| Create | `frontend/src/app/workout/swimming/library/page.tsx` (thin wrapper) |
| Create | `frontend/src/app/workout/swimming/library/[sessionType]/page.tsx` |
| Create | `frontend/src/app/workout/walking/library/page.tsx` (thin wrapper) |
| Create | `frontend/src/app/workout/walking/library/[sessionType]/page.tsx` |
| Modify | `frontend/src/lib/data.ts` (SESSION_TYPES, SESSION_TYPE_COLORS, SPORT_URL_SLUGS) |
| Modify | `frontend/src/lib/i18n.tsx` (session type labels, library i18n keys) |
| Modify | `frontend/src/lib/validations.ts` (session_type in Zod schemas) |
| Modify | `frontend/src/lib/schema.ts` (session_type columns) |
| Modify | `frontend/src/lib/guest-storage.ts` (session_type in guest workout details) |
| Modify | `frontend/src/app/workout/cycling/page.tsx` (+ session type field, + ⋮ menu, + inspiration card) |
| Modify | `frontend/src/app/workout/running/page.tsx` (same) |
| Modify | `frontend/src/app/workout/swimming/page.tsx` (same) |
| Modify | `frontend/src/app/workout/walking/page.tsx` (same) |
| Modify | `frontend/src/app/api/workouts/route.ts` (accept session_type in POST, add to GET SELECT) |
| Modify | `frontend/src/app/api/workouts/[id]/route.ts` (accept session_type in PUT, add to GET SELECT) |
| DB migration | `ALTER TABLE` for both details tables |

## Out of scope

- Custom workout session types
- Guest mode library access
- User-generated articles / CMS
- Session type in stats/charts (future feature)
- Filtering workouts by session type
