import { type WorkoutType, WORKOUT_CONFIG } from '@/lib/data';

export interface DraftWorkout {
  type: WorkoutType;
  date: string;
  emoji?: string;
  name?: string;
}

const PREFIX_TO_TYPE: Record<string, WorkoutType> = {
  cycling: 'velo',
  strength: 'musculation',
  running: 'course',
  swimming: 'natation',
  walking: 'marche',
  custom: 'custom',
};

const PREFIXES = Object.keys(PREFIX_TO_TYPE);

/**
 * Scan localStorage for draft workouts.
 * Optionally filter by a specific date or set of dates.
 */
export function getDraftWorkouts(filterDates?: Set<string>): DraftWorkout[] {
  if (typeof window === 'undefined') return [];

  const drafts: DraftWorkout[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    for (const prefix of PREFIXES) {
      const draftPrefix = `${prefix}-draft-`;
      if (!key.startsWith(draftPrefix)) continue;

      const date = key.slice(draftPrefix.length);
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) break;
      if (filterDates && !filterDates.has(date)) break;

      try {
        const type = PREFIX_TO_TYPE[prefix];
        let emoji: string | undefined;
        let name: string | undefined;

        if (prefix === 'strength') {
          // Strength stores meta separately
          const meta = localStorage.getItem(key + '-meta');
          if (meta) {
            const parsed = JSON.parse(meta);
            emoji = parsed.customEmoji || undefined;
            name = parsed.customName || undefined;
          }
        } else {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            emoji = parsed.customEmoji || undefined;
            name = parsed.customName || undefined;
          }
        }

        drafts.push({
          type,
          date,
          emoji: emoji || WORKOUT_CONFIG[type].defaultEmoji,
          name,
        });
      } catch {
        // Ignore corrupt entries
      }
      break;
    }
  }

  return drafts;
}

/**
 * Get the route for resuming a draft workout.
 */
export function getDraftRoute(draft: DraftWorkout): string {
  const config = WORKOUT_CONFIG[draft.type];
  return `${config.route}?date=${draft.date}`;
}
