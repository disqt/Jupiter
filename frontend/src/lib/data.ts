export type WorkoutType = 'velo' | 'musculation' | 'course' | 'natation' | 'marche' | 'custom';

export const WORKOUT_TYPES: WorkoutType[] = ['velo', 'musculation', 'course', 'natation', 'marche', 'custom'];

export const WORKOUT_CONFIG: Record<WorkoutType, {
  defaultEmoji: string;
  color: string;
  colorSoft: string;
  route: string;
}> = {
  velo: { defaultEmoji: '🚴', color: 'cycling', colorSoft: 'cycling-soft', route: '/workout/cycling' },
  musculation: { defaultEmoji: '🏋️', color: 'strength', colorSoft: 'strength-soft', route: '/workout/strength' },
  course: { defaultEmoji: '🏃', color: 'running', colorSoft: 'running-soft', route: '/workout/running' },
  natation: { defaultEmoji: '🏊', color: 'swimming', colorSoft: 'swimming-soft', route: '/workout/swimming' },
  marche: { defaultEmoji: '🚶', color: 'walking', colorSoft: 'walking-soft', route: '/workout/walking' },
  custom: { defaultEmoji: '🎯', color: 'custom-workout', colorSoft: 'custom-workout-soft', route: '/workout/custom' },
};

export const SPORT_EMOJIS = [
  '🚴', '🏃', '🏊', '🏋️', '🚶', '🧘', '🤸', '🎯',
  '⚽', '🏀', '🎾', '🏓', '🥊', '🏈', '🏐',
  '⛷️', '🏄', '🧗', '🤾', '🏌️', '🚣', '⛸️',
  '💪', '🔥', '⚡', '🏆', '❤️', '🌟',
  '🥋', '🤺', '🏇', '🛹',
];

export const UPPER_BODY_GROUPS = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Abdominaux'];
export const LOWER_BODY_GROUPS = ['Quadriceps', 'Ischios', 'Fessiers', 'Mollets'];
export const MUSCLE_GROUPS = [...UPPER_BODY_GROUPS, ...LOWER_BODY_GROUPS];

export const RIDE_TYPES = ['Route', 'Gravel', 'Home trainer', 'VTT', 'Vélotaf'];

/** Compute athlete level from total medals.
 * Level 0 = débutant (0-4 medals)
 * Level 1 = 5 medals, Level 2 = 11, Level 3 = 18, Level 4 = 26...
 * Threshold for level N = N*(9+N)/2
 */
export function computeLevel(totalMedals: number): { level: number; currentThreshold: number; nextThreshold: number; medalsInLevel: number } {
  let level = 0;
  let cumulative = 0;
  let cost = 5;
  while (cumulative + cost <= totalMedals) {
    cumulative += cost;
    level++;
    cost++;
  }
  const nextThreshold = cumulative + cost;
  return { level, currentThreshold: cumulative, nextThreshold, medalsInLevel: totalMedals - cumulative };
}
