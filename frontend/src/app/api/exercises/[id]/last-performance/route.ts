import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      `SELECT el.set_number, el.reps, el.weight, el.mode, el.duration, w.date
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE el.exercise_id = $1
         AND w.user_id = $2
         AND w.date = (
           SELECT MAX(w2.date) FROM workouts w2
           JOIN exercise_logs el2 ON el2.workout_id = w2.id
           WHERE el2.exercise_id = $1
             AND w2.user_id = $2
         )
       ORDER BY el.set_number`,
      [id, userId]
    );

    // Fetch latest pinned note for this exercise (if any)
    const pinnedResult = await pool.query(
      `SELECT ewn.note FROM exercise_workout_notes ewn
       JOIN workouts w ON w.id = ewn.workout_id
       WHERE ewn.exercise_id = $1 AND ewn.pinned = true AND w.user_id = $2
       ORDER BY w.date DESC LIMIT 1`,
      [id, userId]
    );

    return NextResponse.json({
      sets: result.rows,
      pinned_note: pinnedResult.rows[0]?.note || null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
