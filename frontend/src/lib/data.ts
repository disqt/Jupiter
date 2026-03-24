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
export const MUSCLE_GROUPS = [...UPPER_BODY_GROUPS, ...LOWER_BODY_GROUPS, 'Avant-bras'];

export const RIDE_TYPES = ['Route', 'Gravel', 'Home trainer', 'VTT', 'Vélotaf'];

export const SESSION_TYPES: Record<string, string[]> = {
  velo: ['endurance', 'intervals', 'tempo', 'recovery', 'climbing'],
  course: ['endurance', 'intervals', 'tempo', 'recovery', 'fartlek'],
  natation: ['endurance', 'intervals', 'technique', 'recovery', 'mixed'],
  marche: ['walk', 'brisk', 'hike', 'recovery'],
};

export const SESSION_TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  endurance: { text: '#4ade80', bg: '#1a3a2a' },
  intervals: { text: '#f87171', bg: '#3a1a1a' },
  tempo: { text: '#facc15', bg: '#2a2a1a' },
  recovery: { text: '#60a5fa', bg: '#1a2a3a' },
  climbing: { text: '#c084fc', bg: '#2a1a2a' },
  fartlek: { text: '#fb923c', bg: '#2a1a0a' },
  technique: { text: '#2dd4bf', bg: '#0a2a2a' },
  mixed: { text: '#a78bfa', bg: '#1a1a3a' },
  walk: { text: '#4ade80', bg: '#1a3a2a' },
  brisk: { text: '#facc15', bg: '#2a2a1a' },
  hike: { text: '#c084fc', bg: '#2a1a2a' },
};

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
