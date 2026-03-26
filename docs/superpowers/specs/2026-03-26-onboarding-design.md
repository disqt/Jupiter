# Onboarding — Design Spec

## Overview

Two independent flows: **account creation** (auth) and **onboarding** (app discovery). The onboarding is shown to all users (new + existing) via a `has_seen_onboarding` flag.

## Flow 1: Account Creation

Full-screen, no stepper. Replaces the current bottom sheet registration.

### Screen 1 — Identity
- Logo (🏅) + "Jupiter Tracker" + tagline centered at top
- Email field
- Username field
- "Continuer" CTA (gold gradient)
- "Déjà un compte ? Se connecter" link below

### Screen 2 — Password
- Title: "Choisis un mot de passe"
- Subtitle: "Minimum 6 caractères."
- Password field with visibility toggle
- Confirm password field with visibility toggle
- "Créer mon compte" CTA (gold gradient)

**After successful account creation → triggers onboarding flow.**

## Flow 2: Onboarding Jupiter

4 screens, swipe horizontal with dot indicators. Shown to:
- New users: immediately after account creation
- Existing users: on next app visit if `has_seen_onboarding` is false

### Screen 1 — Bienvenue
- Dot progress: 1/4 active
- 🏅 icon, large centered
- "Bienvenue, {username}" in serif
- Message: "Pas de compétition avec les autres — seulement avec toi-même. L'objectif est simple : trouver ta motivation et rester régulier."
- Gold text highlights on key phrases
- Subtle gold glow accents in background
- "Continuer" CTA

### Screen 2 — Objectif
- Dot progress: 2/4 active
- Title: "Ton objectif"
- Subtitle: "Combien de séances veux-tu faire par semaine ?"
- Gold left-border callout: "L'important c'est la régularité, pas l'intensité. Choisis un objectif réaliste — tu pourras le modifier à tout moment."
- 3 preset cards (reuse GoalModal pattern):
  - 🚶 Occasionnel — 2 séances/semaine
  - 🏃 Régulier — 3 séances/semaine (badge "recommandé", selected by default)
  - 🏋️ Sportif — 5 séances/semaine
- Note: "Personnalisable de 1 à 7 dans les réglages"
- "Valider mon objectif" CTA
- **Action:** calls `PUT /api/user-goal` to set the user's goal

### Screen 3 — Médailles
- Dot progress: 3/4 active
- Title: "Tes médailles"
- Text: "Chaque semaine où tu atteins ton objectif, tu gagnes une médaille. C'est notre façon de célébrer ta régularité."
- Single large 🏅 emoji with gold drop shadow
- Example card:
  - "Exemple — objectif 3×/semaine"
  - Week view: L M M J V S D with 3 checked days (gold gradient)
  - Result: "3 séances cette semaine → 🏅 Médaille gagnée !"
- Text: "Accumule les médailles et progresse de niveau en niveau."
- "Compris !" CTA

### Screen 4 — Découverte (3 sub-slides, swipe within)
Inner dot indicators (3 dots), separate from main progress dots.

**Sub-slide 4a — Sports:**
- Title: "Ton espace sportif"
- Text: "6 sports, chacun avec ses séances type et sa bibliothèque."
- 3×2 grid of sport cards with colored borders:
  - 🚴 Vélo (blue), 🏋️ Musculation (orange), 🏃 Course (green)
  - 🏊 Natation (cyan), 🚶 Marche (amber), ⚡ Custom (purple)
- "Suivant" CTA

**Sub-slide 4b — Calendrier:**
- Title: "Ton calendrier"
- Text: "C'est ici que tu coches tes jours d'activité. Ta vue la plus visuelle pour suivre ta régularité."
- Calendar mockup showing a month with scattered workout days (gold cells)
- "Suivant" CTA

**Sub-slide 4c — CTA Final:**
- 💪 large emoji
- "Tout est prêt" in serif
- "Enregistre ta première séance et commence à construire ta régularité."
- "C'est parti !" CTA → navigates to home page
- **Action:** sets `has_seen_onboarding = true` via API

## Technical Details

### Database
- Add `has_seen_onboarding BOOLEAN DEFAULT FALSE` to `users` table
- Migration to set existing users to `false` (so they see it too)

### API
- `GET /api/auth/me` — include `has_seen_onboarding` in response
- `PUT /api/auth/me` — accept `has_seen_onboarding` update
- Onboarding goal selection calls existing `PUT /api/user-goal`

### Frontend
- New route: `/register` — full-screen account creation (2 screens)
- New component: `OnboardingFlow.tsx` — 4-screen swipe wizard
  - Uses swipe gesture (touch events) + dot indicators
  - Each screen is a child component
  - On completion: calls API to set flag, navigates to `/`
- `AuthProvider` checks `has_seen_onboarding` on login/app load → if false, redirects to onboarding
- Guest mode: no onboarding (guest users don't have accounts)
- Update profile page: replace `RegisterSheet` open → navigate to `/register`

### Navigation
- Register flow: `/register` → `/register/password` (or single component with internal state)
- After account creation: auto-redirect to onboarding
- Onboarding: rendered as overlay/full-screen on top of app, not a route (avoids URL issues with existing users)
- On dismiss: navigate to `/` (home)

### Swipe Implementation
- Touch events: `touchstart`, `touchmove`, `touchend`
- Track deltaX, threshold ~50px to trigger slide
- CSS transform + transition for smooth sliding
- Prevent vertical scroll during horizontal swipe
- Sub-slides in screen 4: nested swipe container

### Existing Users Trigger
- On app load, `AuthProvider` fetches `/api/auth/me`
- If `has_seen_onboarding === false` → show `OnboardingFlow` as full-screen overlay
- Onboarding can't be skipped (no X button) — user must go through all steps
- After completion, flag is set and overlay is removed

## Mockups
Visual mockups available at `.superpowers/brainstorm/4587-1774518779/content/onboarding-v2.html`
