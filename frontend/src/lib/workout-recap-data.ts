import { WorkoutType, computeLevel } from './data';
import { PersonalRecord } from './api';

export const REVEAL_TIMING = {
  AUTO_DELAY: 1500,
  FIRST_DELAY: 800,
  FADE_DURATION: 600,
  LEVEL_BAR_DURATION: 1200,
};

export interface RecapData {
  workoutType: WorkoutType;
  date: string;
  customEmoji?: string | null;
  customName?: string | null;
  duration?: number | null;
  distance?: number | null;
  elevation?: number | null;
  // Muscu-specific
  exerciseCount?: number;
  totalVolume?: number; // sum(weight * reps) across all sets
  // Details chips
  details: { label: string; value: string }[];
  // PRs
  records: PersonalRecord[];
  // Streak
  weekCount: number;
  consecutiveWeeks: number;
  // Medal
  medalsEarned: number; // 0 if < 3 sessions this week
  // Level
  totalMedals: number;
  level: number;
  currentThreshold: number;
  nextThreshold: number;
  medalsInLevel: number;
  leveledUp: boolean;
}

interface FormData {
  cycling_details?: { duration?: number; distance?: number; elevation?: number; ride_type?: string };
  workout_details?: { duration?: number; distance?: number; elevation?: number; laps?: number };
  exercise_logs?: { exercise_id: number; set_number: number; reps: number; weight: number; mode?: string }[];
  muscle_groups?: string[];
}

interface WeeklyProgress {
  week_count: number;
  total_medals: number;
  consecutive_weeks: number;
  current_target?: number;
}

export function buildRecapData(
  saveResponse: { records: PersonalRecord[] },
  weeklyProgress: WeeklyProgress | null,
  formData: FormData,
  workoutType: WorkoutType,
  date: string,
  customEmoji: string | null | undefined,
  customName: string | null | undefined,
  previousTotalMedals: number,
): RecapData {
  // Extract duration/distance/elevation based on sport type
  let duration: number | null | undefined;
  let distance: number | null | undefined;
  let elevation: number | null | undefined;

  if (workoutType === 'velo') {
    duration = formData.cycling_details?.duration;
    distance = formData.cycling_details?.distance;
    elevation = formData.cycling_details?.elevation;
  } else if (workoutType === 'course' || workoutType === 'natation' || workoutType === 'marche' || workoutType === 'custom') {
    duration = formData.workout_details?.duration;
    distance = formData.workout_details?.distance;
    elevation = formData.workout_details?.elevation;
  }

  // Build details chips
  const details: { label: string; value: string }[] = [];

  if (workoutType === 'velo') {
    if (distance != null && duration != null && duration > 0) {
      const speedKmh = (distance / duration) * 60;
      details.push({ label: 'speed', value: `${speedKmh.toFixed(1)} km/h` });
    }
    const rideType = formData.cycling_details?.ride_type;
    if (rideType) {
      details.push({ label: 'rideType', value: rideType });
    }
  } else if (workoutType === 'course' || workoutType === 'marche') {
    if (duration != null && distance != null && distance > 0) {
      const paceMinPerKm = duration / distance;
      const paceMin = Math.floor(paceMinPerKm);
      const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
      details.push({ label: 'pace', value: `${paceMin}:${paceSec.toString().padStart(2, '0')} min/km` });
    }
  } else if (workoutType === 'natation') {
    const laps = formData.workout_details?.laps;
    if (laps != null) {
      details.push({ label: 'laps', value: String(laps) });
    }
  } else if (workoutType === 'musculation') {
    const exerciseLogs = formData.exercise_logs ?? [];
    const exerciseIds = new Set(exerciseLogs.map((l) => l.exercise_id));
    const exerciseCount = exerciseIds.size;
    if (exerciseCount > 0) {
      details.push({ label: 'exercises', value: String(exerciseCount) });
    }
    if (formData.muscle_groups && formData.muscle_groups.length > 0) {
      details.push({ label: 'muscleGroups', value: formData.muscle_groups.join(', ') });
    }
  } else if (workoutType === 'custom') {
    if (customName) {
      details.push({ label: 'customName', value: customName });
    }
  }

  // Muscu-specific aggregates
  let exerciseCount: number | undefined;
  let totalVolume: number | undefined;
  if (workoutType === 'musculation' && formData.exercise_logs) {
    const exerciseLogs = formData.exercise_logs;
    exerciseCount = new Set(exerciseLogs.map((l) => l.exercise_id)).size;
    totalVolume = exerciseLogs.reduce((sum, l) => sum + (l.weight ?? 0) * (l.reps ?? 0), 0);
  }

  // Weekly progress
  const weekCount = weeklyProgress?.week_count ?? 0;
  const consecutiveWeeks = weeklyProgress?.consecutive_weeks ?? 0;
  const totalMedals = weeklyProgress?.total_medals ?? previousTotalMedals;
  const currentTarget = weeklyProgress?.current_target ?? 3;
  const medalsEarned = Math.max(weekCount - (currentTarget - 1), 0);

  // Level info
  const levelInfo = computeLevel(totalMedals);
  const prevLevelInfo = computeLevel(previousTotalMedals);
  const leveledUp = levelInfo.level > prevLevelInfo.level;

  return {
    workoutType,
    date,
    customEmoji,
    customName,
    duration,
    distance,
    elevation,
    exerciseCount,
    totalVolume,
    details,
    records: saveResponse.records,
    weekCount,
    consecutiveWeeks,
    medalsEarned,
    totalMedals,
    level: levelInfo.level,
    currentThreshold: levelInfo.currentThreshold,
    nextThreshold: levelInfo.nextThreshold,
    medalsInLevel: levelInfo.medalsInLevel,
    leveledUp,
  };
}

export function getVisibleBlocks(data: RecapData, isGuest: boolean): string[] {
  const blocks = ['header', 'stats', 'details'];
  if (!isGuest) {
    if (data.records.length > 0) blocks.push('records');
    blocks.push('streak');
    if (data.medalsEarned > 0) blocks.push('medal');
    blocks.push('level');
  }
  blocks.push('cta');
  return blocks;
}
