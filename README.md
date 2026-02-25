# Jupiter Tracker

Application de tracking d'entraînements sportifs (musculation & cyclisme). Mobile-first, optimisée pour iPhone.

## Stack

- **Frontend** : Next.js 14 + Tailwind CSS + TypeScript
- **Backend** : Express.js + TypeScript + Drizzle ORM
- **Base de données** : PostgreSQL (Supabase)

## Structure

```
frontend/   → App Next.js (interface utilisateur)
backend/    → API Express.js + migrations Drizzle
database/   → Scripts SQL d'initialisation
```

## Lancer en local

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev

# Migrations
cd backend && npm run db:migrate
```

L'app est accessible sur `http://localhost:3000`.

## Fonctionnalités

- Calendrier mensuel avec indicateurs d'entraînements
- Enregistrement de séances de musculation (exercices, séries, reps, poids)
- Enregistrement de sorties vélo (durée, distance, dénivelé)
- Référence aux performances précédentes
- Bibliothèque d'exercices personnalisable
- Historique des 3 dernières séances par exercice
- Notes par exercice avec système d'épinglage
- Animation de sauvegarde (checkmark animé)
- Sauvegarde automatique des séances en cours (localStorage)
- **Gamification** : barre de progression hebdo + système de médailles
  - 3 entraînements/semaine = 1 médaille, +1 par séance supplémentaire
  - Compteur de médailles dans le header + key insights
  - Animation de célébration à l'obtention d'une médaille
- Migrations de schéma versionnées via Drizzle ORM
