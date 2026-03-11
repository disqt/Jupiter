import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';
import { updateWorkoutSchema, patchWorkoutSchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const workoutResult = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (workoutResult.rows.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    const workout = workoutResult.rows[0];

    if (workout.type === 'velo') {
      const cyclingResult = await pool.query(
        'SELECT * FROM cycling_details WHERE workout_id = $1', [id]
      );
      workout.cycling_details = cyclingResult.rows[0] || null;
    } else if (workout.type === 'musculation') {
      const logsResult = await pool.query(
        `SELECT el.*, e.name as exercise_name, e.muscle_group
         FROM exercise_logs el
         JOIN exercises e ON e.id = el.exercise_id
         WHERE el.workout_id = $1
         ORDER BY el.exercise_id, el.set_number`, [id]
      );
      workout.exercise_logs = logsResult.rows;
      const notesResult = await pool.query(
        `SELECT exercise_id, note, pinned FROM exercise_workout_notes WHERE workout_id = $1`, [id]
      );
      workout.exercise_notes = notesResult.rows;
    } else {
      const detailsResult = await pool.query(
        'SELECT * FROM workout_details WHERE workout_id = $1', [id]
      );
      workout.workout_details = detailsResult.rows[0] || null;
    }

    return NextResponse.json(workout);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const client = await pool.connect();
  try {
    const userId = authenticate(request);
    await client.query('BEGIN');
    const { id } = params;
    const body = await request.json();
    const parsed = updateWorkoutSchema.safeParse(body);
    if (!parsed.success) {
      client.release();
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { date, type, notes, cycling_details, exercise_logs, exercise_notes, workout_details, custom_emoji, custom_name } = parsed.data;

    const workoutResult = await client.query(
      'UPDATE workouts SET date = $1, type = $2, notes = $3, custom_emoji = $5, custom_name = $6 WHERE id = $4 AND user_id = $7 RETURNING *',
      [date, type, notes || null, id, custom_emoji || null, custom_name || null, userId]
    );
    if (workoutResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    await client.query('DELETE FROM cycling_details WHERE workout_id = $1', [id]);
    if (type === 'velo' && cycling_details) {
      const { duration, distance, elevation, ride_type } = cycling_details;
      await client.query(
        `INSERT INTO cycling_details (workout_id, duration, distance, elevation, ride_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, duration, distance, elevation, ride_type]
      );
    }

    await client.query('DELETE FROM exercise_logs WHERE workout_id = $1', [id]);
    await client.query('DELETE FROM exercise_workout_notes WHERE workout_id = $1', [id]);
    if (type === 'musculation' && exercise_logs) {
      for (const log of exercise_logs) {
        await client.query(
          `INSERT INTO exercise_logs (workout_id, exercise_id, set_number, reps, weight, mode, duration)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, log.exercise_id, log.set_number, log.reps, log.weight, log.mode || 'reps-weight', log.duration || null]
        );
      }
      if (exercise_notes) {
        for (const en of exercise_notes) {
          if (en.note) {
            await client.query(
              `INSERT INTO exercise_workout_notes (workout_id, exercise_id, note, pinned)
               VALUES ($1, $2, $3, $4)`,
              [id, en.exercise_id, en.note, en.pinned]
            );
          }
        }
      }
    }

    await client.query('DELETE FROM workout_details WHERE workout_id = $1', [id]);
    if (['course', 'natation', 'marche', 'custom'].includes(type) && workout_details) {
      const { duration, distance, elevation, laps } = workout_details;
      await client.query(
        `INSERT INTO workout_details (workout_id, duration, distance, elevation, laps)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, duration || null, distance || null, elevation || null, laps || null]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json(workoutResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    return handleApiError(err);
  } finally {
    client.release();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const body = await request.json();
    const parsed = patchWorkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { custom_emoji, custom_name } = parsed.data;
    const result = await pool.query(
      'UPDATE workouts SET custom_emoji = $1, custom_name = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [custom_emoji || null, custom_name || null, id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      'DELETE FROM workouts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Workout deleted' });
  } catch (err) {
    return handleApiError(err);
  }
}
