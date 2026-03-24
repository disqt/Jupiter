import { PoolClient } from 'pg';
import { WorkoutType } from '@/lib/data';

export interface PersonalRecord {
  type: 'distance' | 'duration' | 'weight';
  value: number;
  previous: number | null;
  exerciseName?: string;
}

export async function computePersonalRecords(
  client: PoolClient,
  userId: number,
  workoutId: string,
  type: WorkoutType,
  payload: {
    cycling_details?: { distance?: number | null; duration?: number | null } | null;
    workout_details?: { distance?: number | null; duration?: number | null } | null;
  }
): Promise<PersonalRecord[]> {
  const records: PersonalRecord[] = [];

  if (type === 'velo') {
    const current = payload.cycling_details;
    if (!current) return records;

    const histResult = await client.query<{ max_distance: string | null; max_duration: string | null }>(
      `SELECT MAX(cd.distance) as max_distance, MAX(cd.duration) as max_duration
       FROM cycling_details cd
       JOIN workouts w ON w.id = cd.workout_id
       WHERE w.user_id = $1 AND w.type = $2 AND cd.workout_id != $3`,
      [userId, type, workoutId]
    );

    const hist = histResult.rows[0];
    const maxDist = hist.max_distance !== null ? parseFloat(hist.max_distance) : null;
    const maxDur = hist.max_duration !== null ? parseFloat(hist.max_duration) : null;

    if (current.distance != null && current.distance > 0) {
      if (maxDist === null || current.distance > maxDist) {
        records.push({ type: 'distance', value: current.distance, previous: maxDist });
      }
    }
    if (current.duration != null && current.duration > 0) {
      if (maxDur === null || current.duration > maxDur) {
        records.push({ type: 'duration', value: current.duration, previous: maxDur });
      }
    }
  } else if (['course', 'natation', 'marche', 'custom'].includes(type)) {
    const current = payload.workout_details;
    if (!current) return records;

    const histResult = await client.query<{ max_distance: string | null; max_duration: string | null }>(
      `SELECT MAX(wd.distance) as max_distance, MAX(wd.duration) as max_duration
       FROM workout_details wd
       JOIN workouts w ON w.id = wd.workout_id
       WHERE w.user_id = $1 AND w.type = $2 AND wd.workout_id != $3`,
      [userId, type, workoutId]
    );

    const hist = histResult.rows[0];
    const maxDist = hist.max_distance !== null ? parseFloat(hist.max_distance) : null;
    const maxDur = hist.max_duration !== null ? parseFloat(hist.max_duration) : null;

    // Distance PR: all sports except custom
    if (type !== 'custom' && current.distance != null && current.distance > 0) {
      if (maxDist === null || current.distance > maxDist) {
        records.push({ type: 'distance', value: current.distance, previous: maxDist });
      }
    }
    if (current.duration != null && current.duration > 0) {
      if (maxDur === null || current.duration > maxDur) {
        records.push({ type: 'duration', value: current.duration, previous: maxDur });
      }
    }
  } else if (type === 'musculation') {
    // Query current workout's per-exercise max weight (just inserted in same transaction)
    const currentResult = await client.query<{
      exercise_id: string;
      exercise_name: string;
      max_weight: string;
    }>(
      `SELECT el.exercise_id, e.name as exercise_name, MAX(el.weight) as max_weight
       FROM exercise_logs el
       JOIN exercises e ON e.id = el.exercise_id
       WHERE el.workout_id = $1 AND el.weight > 0
       GROUP BY el.exercise_id, e.name`,
      [workoutId]
    );

    if (currentResult.rows.length === 0) return records;

    // Query historical max weight per exercise (excluding current workout)
    const histResult = await client.query<{
      exercise_id: string;
      exercise_name: string;
      max_weight: string;
    }>(
      `SELECT el.exercise_id, e.name as exercise_name, MAX(el.weight) as max_weight
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       JOIN exercises e ON e.id = el.exercise_id
       WHERE w.user_id = $1 AND w.type = 'musculation' AND el.workout_id != $2 AND el.weight > 0
       GROUP BY el.exercise_id, e.name`,
      [userId, workoutId]
    );

    // Build historical map: exercise_id -> max_weight
    const histMap = new Map<string, number>();
    for (const row of histResult.rows) {
      histMap.set(row.exercise_id, parseFloat(row.max_weight));
    }

    // Compare current vs historical
    for (const row of currentResult.rows) {
      const currentMax = parseFloat(row.max_weight);
      const historicalMax = histMap.get(row.exercise_id) ?? null;

      if (historicalMax === null || currentMax > historicalMax) {
        records.push({
          type: 'weight',
          value: currentMax,
          previous: historicalMax,
          exerciseName: row.exercise_name,
        });
      }
    }
  }

  return records;
}
