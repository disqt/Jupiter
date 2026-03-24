import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';
import { monthParamSchema, createWorkoutSchema } from '@/lib/validations';
import { computePersonalRecords } from '@/lib/pr-computation';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    const parsed = monthParamSchema.safeParse({ month });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid month format (YYYY-MM)' }, { status: 400 });
    }
    const result = await pool.query(
      `SELECT w.*,
        cd.duration, cd.distance, cd.elevation, cd.ride_type,
        wd.duration as wd_duration, wd.distance as wd_distance, wd.elevation as wd_elevation, wd.laps as wd_laps,
        (SELECT COUNT(DISTINCT el.exercise_id) FROM exercise_logs el WHERE el.workout_id = w.id) as exercise_count
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, 'YYYY-MM') = $1
         AND w.user_id = $2
       ORDER BY w.date, w.created_at`,
      [month, userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const userId = authenticate(request);
    await client.query('BEGIN');
    const body = await request.json();
    const parsed = createWorkoutSchema.safeParse(body);
    if (!parsed.success) {
      client.release();
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { date, type, notes, cycling_details, exercise_logs, exercise_notes, workout_details, custom_emoji, custom_name } = parsed.data;

    const workoutResult = await client.query(
      'INSERT INTO workouts (date, type, notes, user_id, custom_emoji, custom_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [date, type, notes || null, userId, custom_emoji || null, custom_name || null]
    );
    const workout = workoutResult.rows[0];

    if (type === 'velo' && cycling_details) {
      const { duration, distance, elevation, ride_type } = cycling_details;
      await client.query(
        `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [workout.id, duration, distance, elevation, ride_type]
      );
    }

    if (type === 'musculation' && exercise_logs) {
      for (const log of exercise_logs) {
        await client.query(
          `INSERT INTO exercise_logs (workout_id, exercise_id, set_number, reps, weight, mode, duration)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [workout.id, log.exercise_id, log.set_number, log.reps, log.weight, log.mode || 'reps-weight', log.duration || null]
        );
      }
      if (exercise_notes) {
        for (const en of exercise_notes) {
          if (en.note) {
            await client.query(
              `INSERT INTO exercise_workout_notes (workout_id, exercise_id, note, pinned)
               VALUES ($1, $2, $3, $4)`,
              [workout.id, en.exercise_id, en.note, en.pinned]
            );
          }
        }
      }
    }

    if (['course', 'natation', 'marche', 'custom'].includes(type) && workout_details) {
      const { duration, distance, elevation, laps } = workout_details;
      await client.query(
        `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
         VALUES ($1, $2, $3, $4, $5)`,
        [workout.id, duration || null, distance || null, elevation || null, laps || null]
      );
    }

    const records = await computePersonalRecords(client, userId, workout.id, type, {
      cycling_details: cycling_details ?? null,
      workout_details: workout_details ?? null,
    });

    await client.query('COMMIT');

    // Clean up unused exercises (no history, no template refs) — fire and forget
    pool.query(
      `DELETE FROM exercises e
       WHERE e.user_id = $1
         AND NOT EXISTS (SELECT 1 FROM exercise_logs el WHERE el.exercise_id = e.id)
         AND NOT EXISTS (SELECT 1 FROM workout_template_exercises wte
                         JOIN workout_templates wt ON wt.id = wte.template_id
                         WHERE wte.exercise_id = e.id AND wt.user_id = $1)`,
      [userId]
    ).catch(() => {});

    return NextResponse.json({ ...workout, records }, { status: 201 });
  } catch (err) {
    await client.query('ROLLBACK');
    return handleApiError(err);
  } finally {
    client.release();
  }
}
