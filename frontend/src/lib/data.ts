export interface Workout {
  id: number;
  date: string; // YYYY-MM-DD
  type: 'velo' | 'musculation';
  detail: string;
  // cycling fields
  duration?: number;
  distance?: number;
  elevation?: number;
  rideType?: string;
  // strength fields
  exercises?: {
    name: string;
    muscleGroup: string;
    sets: { setNumber: number; reps: number; weight: number }[];
    lastPerformance?: { setNumber: number; reps: number; weight: number }[];
  }[];
}

export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
}

export const EXERCISES: Exercise[] = [
  { id: 1, name: 'Développé couché', muscleGroup: 'Pectoraux' },
  { id: 2, name: 'Développé incliné', muscleGroup: 'Pectoraux' },
  { id: 3, name: 'Écarté poulie', muscleGroup: 'Pectoraux' },
  { id: 4, name: 'Rowing barre', muscleGroup: 'Dos' },
  { id: 5, name: 'Tractions', muscleGroup: 'Dos' },
  { id: 6, name: 'Soulevé de terre', muscleGroup: 'Dos' },
  { id: 7, name: 'Tirage vertical', muscleGroup: 'Dos' },
  { id: 8, name: 'Développé militaire', muscleGroup: 'Épaules' },
  { id: 9, name: 'Élévations latérales', muscleGroup: 'Épaules' },
  { id: 10, name: 'Curl biceps', muscleGroup: 'Biceps' },
  { id: 11, name: 'Curl marteau', muscleGroup: 'Biceps' },
  { id: 12, name: 'Extension triceps', muscleGroup: 'Triceps' },
  { id: 13, name: 'Dips', muscleGroup: 'Triceps' },
  { id: 14, name: 'Squat', muscleGroup: 'Jambes' },
  { id: 15, name: 'Leg press', muscleGroup: 'Jambes' },
  { id: 16, name: 'Fentes', muscleGroup: 'Jambes' },
  { id: 17, name: 'Crunch', muscleGroup: 'Abdominaux' },
  { id: 18, name: 'Gainage', muscleGroup: 'Abdominaux' },
];

export const MUSCLE_GROUPS = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers', 'Autre'];

export const RIDE_TYPES = ['Route', 'Gravel', 'Home trainer', 'VTT', 'Vélotaf'];

export const DUMMY_WORKOUTS: Workout[] = [
  { id: 1, date: '2026-02-02', type: 'musculation', detail: '4 exercices — Push', exercises: [
    { name: 'Développé couché', muscleGroup: 'Pectoraux', sets: [{setNumber:1,reps:10,weight:80},{setNumber:2,reps:8,weight:80},{setNumber:3,reps:8,weight:75}], lastPerformance: [{setNumber:1,reps:10,weight:75},{setNumber:2,reps:8,weight:75},{setNumber:3,reps:7,weight:70}] },
    { name: 'Développé incliné', muscleGroup: 'Pectoraux', sets: [{setNumber:1,reps:10,weight:30},{setNumber:2,reps:8,weight:30}], lastPerformance: [{setNumber:1,reps:10,weight:28},{setNumber:2,reps:8,weight:28}] },
  ]},
  { id: 2, date: '2026-02-04', type: 'velo', detail: '42 km — Route — 680m D+', duration: 95, distance: 42, elevation: 680, rideType: 'Route' },
  { id: 3, date: '2026-02-05', type: 'musculation', detail: '5 exercices — Pull', exercises: [
    { name: 'Rowing barre', muscleGroup: 'Dos', sets: [{setNumber:1,reps:12,weight:60},{setNumber:2,reps:10,weight:60},{setNumber:3,reps:10,weight:55}] },
    { name: 'Tractions', muscleGroup: 'Dos', sets: [{setNumber:1,reps:10,weight:0},{setNumber:2,reps:8,weight:0},{setNumber:3,reps:7,weight:0}] },
    { name: 'Curl biceps', muscleGroup: 'Biceps', sets: [{setNumber:1,reps:12,weight:14},{setNumber:2,reps:10,weight:14}] },
  ]},
  { id: 4, date: '2026-02-07', type: 'velo', detail: '35 km — Gravel — 420m D+', duration: 80, distance: 35, elevation: 420, rideType: 'Gravel' },
  { id: 5, date: '2026-02-09', type: 'musculation', detail: '5 exercices — Legs', exercises: [
    { name: 'Squat', muscleGroup: 'Jambes', sets: [{setNumber:1,reps:10,weight:90},{setNumber:2,reps:8,weight:90},{setNumber:3,reps:8,weight:85},{setNumber:4,reps:6,weight:85}] },
    { name: 'Leg press', muscleGroup: 'Jambes', sets: [{setNumber:1,reps:12,weight:140},{setNumber:2,reps:10,weight:140},{setNumber:3,reps:10,weight:130}] },
  ]},
  { id: 6, date: '2026-02-11', type: 'velo', detail: '55 km — Route — 890m D+', duration: 120, distance: 55, elevation: 890, rideType: 'Route' },
  { id: 7, date: '2026-02-12', type: 'musculation', detail: '4 exercices — Push', exercises: [
    { name: 'Développé couché', muscleGroup: 'Pectoraux', sets: [{setNumber:1,reps:10,weight:80},{setNumber:2,reps:9,weight:80},{setNumber:3,reps:8,weight:77.5}] },
    { name: 'Développé incliné', muscleGroup: 'Pectoraux', sets: [{setNumber:1,reps:10,weight:30},{setNumber:2,reps:9,weight:30},{setNumber:3,reps:8,weight:28}] },
    { name: 'Développé militaire', muscleGroup: 'Épaules', sets: [{setNumber:1,reps:10,weight:40},{setNumber:2,reps:8,weight:40}] },
    { name: 'Extension triceps', muscleGroup: 'Triceps', sets: [{setNumber:1,reps:12,weight:20},{setNumber:2,reps:10,weight:20}] },
  ]},
  { id: 8, date: '2026-02-14', type: 'velo', detail: '28 km — Vélotaf', duration: 45, distance: 28, elevation: 120, rideType: 'Vélotaf' },
  { id: 9, date: '2026-02-14', type: 'musculation', detail: '5 exercices — Upper body', exercises: [
    { name: 'Développé couché', muscleGroup: 'Pectoraux', sets: [{setNumber:1,reps:10,weight:82.5},{setNumber:2,reps:8,weight:80},{setNumber:3,reps:7,weight:80}] },
    { name: 'Rowing barre', muscleGroup: 'Dos', sets: [{setNumber:1,reps:12,weight:62.5},{setNumber:2,reps:10,weight:60},{setNumber:3,reps:10,weight:60}] },
    { name: 'Curl biceps', muscleGroup: 'Biceps', sets: [{setNumber:1,reps:12,weight:15},{setNumber:2,reps:10,weight:14}] },
  ]},
  { id: 10, date: '2026-02-16', type: 'musculation', detail: '5 exercices — Pull', exercises: [
    { name: 'Rowing barre', muscleGroup: 'Dos', sets: [{setNumber:1,reps:12,weight:65},{setNumber:2,reps:10,weight:62.5},{setNumber:3,reps:10,weight:60}] },
    { name: 'Tractions', muscleGroup: 'Dos', sets: [{setNumber:1,reps:10,weight:0},{setNumber:2,reps:9,weight:0},{setNumber:3,reps:8,weight:0}] },
    { name: 'Curl biceps', muscleGroup: 'Biceps', sets: [{setNumber:1,reps:12,weight:15},{setNumber:2,reps:11,weight:15}] },
  ]},
  { id: 11, date: '2026-02-18', type: 'velo', detail: '25 km — Home trainer', duration: 50, distance: 25, elevation: 0, rideType: 'Home trainer' },
  { id: 12, date: '2026-02-19', type: 'musculation', detail: '5 exercices — Legs', exercises: [] },
  { id: 13, date: '2026-02-21', type: 'velo', detail: '62 km — Route — 950m D+', duration: 140, distance: 62, elevation: 950, rideType: 'Route' },
  { id: 14, date: '2026-02-23', type: 'musculation', detail: '4 exercices — Push', exercises: [] },
  { id: 15, date: '2026-02-24', type: 'musculation', detail: '5 exercices — Upper body', exercises: [
    { name: 'Développé couché', muscleGroup: 'Pectoraux', sets: [{setNumber:1,reps:10,weight:82.5},{setNumber:2,reps:9,weight:80},{setNumber:3,reps:8,weight:80},{setNumber:4,reps:0,weight:0}], lastPerformance: [{setNumber:1,reps:10,weight:80},{setNumber:2,reps:8,weight:80},{setNumber:3,reps:8,weight:75},{setNumber:4,reps:6,weight:75}] },
    { name: 'Rowing barre', muscleGroup: 'Dos', sets: [{setNumber:1,reps:12,weight:65},{setNumber:2,reps:0,weight:0},{setNumber:3,reps:0,weight:0}], lastPerformance: [{setNumber:1,reps:12,weight:60},{setNumber:2,reps:10,weight:60},{setNumber:3,reps:10,weight:55}] },
  ]},
];

export function getWorkoutsForMonth(year: number, month: number): Workout[] {
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  return DUMMY_WORKOUTS.filter(w => w.date.startsWith(monthStr));
}

export function getExerciseHistory(exerciseName: string, excludeDate?: string) {
  return DUMMY_WORKOUTS
    .filter(w => w.type === 'musculation' && w.exercises && w.exercises.length > 0)
    .filter(w => excludeDate ? w.date !== excludeDate : true)
    .flatMap(w => {
      const match = w.exercises!.find(e => e.name === exerciseName);
      if (!match) return [];
      return [{ date: w.date, sets: match.sets }];
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
}

export function getMonthlyStats(year: number, month: number) {
  const workouts = getWorkoutsForMonth(year, month);
  const cyclingWorkouts = workouts.filter(w => w.type === 'velo');
  const strengthWorkouts = workouts.filter(w => w.type === 'musculation');
  return {
    cyclingCount: cyclingWorkouts.length,
    strengthCount: strengthWorkouts.length,
    totalDistanceKm: cyclingWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
    totalElevationM: cyclingWorkouts.reduce((sum, w) => sum + (w.elevation || 0), 0),
  };
}
