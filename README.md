# Jupiter Tracker

Application de tracking d'entraînements sportifs (musculation & cyclisme). Mobile-first, optimisée pour iPhone.

## Stack

- **Frontend** : Next.js 14 + Tailwind CSS + TypeScript
- **Backend** : Express.js + TypeScript
- **Base de données** : PostgreSQL

## Structure

```
frontend/   → App Next.js (interface utilisateur)
backend/    → API Express.js
database/   → Scripts SQL d'initialisation
```

## Lancer le frontend en local

```bash
cd frontend
npm install
npm run dev
```

L'app est accessible sur `http://localhost:3000`.

## Fonctionnalités

- Calendrier mensuel avec indicateurs d'entraînements
- Enregistrement de séances de musculation (exercices, séries, reps, poids)
- Enregistrement de sorties vélo (durée, distance, dénivelé)
- Référence aux performances précédentes
- Bibliothèque d'exercices personnalisable
