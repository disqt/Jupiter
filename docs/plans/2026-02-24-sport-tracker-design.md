# Sport Tracker — Design Document

## Objectif

Application web mobile-first de tracking d'entraînements (musculation + vélo) pour usage personnel. Accessible depuis un iPhone via navigateur.

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + TypeScript |
| Backend | Express.js (API CRUD) |
| Base de données | PostgreSQL |
| Hébergement | disqt.com (plus tard) |
| Dev | Local, repo GitHub disqt.com |

## Structure du repo

```
sport-tracker/
├── frontend/    → Next.js (port 3000)
├── backend/     → Express.js (port 3001)
└── database/    → Scripts SQL de création des tables
```

## Modèle de données

### workouts
| Champ | Type | Description |
|-------|------|-------------|
| id | SERIAL PK | Identifiant unique |
| date | DATE | Date de la séance |
| type | VARCHAR | `musculation` ou `velo` |
| notes | TEXT | Commentaire libre (optionnel) |
| created_at | TIMESTAMP | Date de création |

### cycling_details
| Champ | Type | Description |
|-------|------|-------------|
| id | SERIAL PK | Identifiant unique |
| workout_id | FK → workouts | Séance associée |
| duration | INTEGER | Durée en minutes |
| distance | DECIMAL | Distance en km |
| elevation | INTEGER | Dénivelé en mètres |
| ride_type | VARCHAR | route, gravel, home trainer, etc. |

### exercises
| Champ | Type | Description |
|-------|------|-------------|
| id | SERIAL PK | Identifiant unique |
| name | VARCHAR | Nom de l'exercice |
| muscle_group | VARCHAR | Groupe musculaire |

### exercise_logs
| Champ | Type | Description |
|-------|------|-------------|
| id | SERIAL PK | Identifiant unique |
| workout_id | FK → workouts | Séance associée |
| exercise_id | FK → exercises | Exercice associé |
| set_number | INTEGER | Numéro de série (1, 2, 3...) |
| reps | INTEGER | Nombre de répétitions |
| weight | DECIMAL | Poids en kg |

## Écrans

### 1. Calendrier (accueil)
- Vue mensuelle du mois en cours
- Navigation mois par mois (flèches gauche/droite)
- Pastilles colorées sur les jours entraînés (bleu = vélo, orange = muscu)
- Résumé du mois en dessous : nombre de séances, km vélo totaux, dénivelé total, nombre de séances muscu
- Clic sur un jour → affiche les séances du jour (si existantes) + bouton flottant "+"
- Le "+" ouvre un choix : Musculation ou Vélo

### 2. Séance vélo
- Formulaire : durée, distance, dénivelé, type de sortie (dropdown)
- Bouton sauvegarder
- Retour au calendrier après sauvegarde

### 3. Séance musculation
- Sélection d'exercices depuis la bibliothèque
- Possibilité de créer un exercice à la volée
- Pour chaque exercice ajouté :
  - Dernière performance affichée en référence (grisé)
  - Saisie des séries : reps + poids
  - Bouton "+" pour ajouter une série
- Bouton sauvegarder
- Retour au calendrier après sauvegarde

### Navigation
- Barre en bas avec 2 onglets : Calendrier | Stats
- Stats grisé/désactivé pour la V1

## API Routes (Express.js)

### Workouts
- `GET /api/workouts?month=YYYY-MM` — séances d'un mois
- `GET /api/workouts/:id` — détail d'une séance
- `POST /api/workouts` — créer une séance
- `PUT /api/workouts/:id` — modifier une séance
- `DELETE /api/workouts/:id` — supprimer une séance

### Exercises
- `GET /api/exercises` — liste de tous les exercices
- `POST /api/exercises` — créer un exercice
- `PUT /api/exercises/:id` — modifier un exercice
- `DELETE /api/exercises/:id` — supprimer un exercice

### Exercise Logs
- `GET /api/exercises/:id/last-performance` — dernière performance pour un exercice
- `POST /api/workouts/:id/logs` — ajouter des logs d'exercice à une séance

### Stats (V1 basique)
- `GET /api/stats/monthly?month=YYYY-MM` — résumé mensuel (nb séances, km vélo, dénivelé, nb muscu)

## Hors scope (V2)
- Onglet Stats détaillé (progression par exercice, volume par semaine)
- Authentification / protection par mot de passe
- Déploiement sur disqt.com
