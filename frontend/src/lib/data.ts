export type WorkoutType = 'velo' | 'musculation' | 'course' | 'natation' | 'custom';

export const WORKOUT_TYPES: WorkoutType[] = ['velo', 'musculation', 'course', 'natation', 'custom'];

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
  custom: { defaultEmoji: '🎯', color: 'custom-workout', colorSoft: 'custom-workout-soft', route: '/workout/custom' },
};

export const SPORT_EMOJIS = [
  '🚴', '🏃', '🏊', '🏋️', '🧘', '🤸', '🎯',
  '⚽', '🏀', '🎾', '🏓', '🥊', '🏈', '🏐',
  '⛷️', '🏄', '🧗', '🤾', '🏌️', '🚣', '⛸️',
  '💪', '🔥', '⚡', '🏆', '❤️', '🌟',
  '🥋', '🤺', '🏇', '🛹',
];

export const UPPER_BODY_GROUPS = ['Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Abdominaux'];
export const LOWER_BODY_GROUPS = ['Quadriceps', 'Ischios', 'Fessiers', 'Mollets'];
export const MUSCLE_GROUPS = [...UPPER_BODY_GROUPS, ...LOWER_BODY_GROUPS];

export const RIDE_TYPES = ['Route', 'Gravel', 'Home trainer', 'VTT', 'Vélotaf'];
