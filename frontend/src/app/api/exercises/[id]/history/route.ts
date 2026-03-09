import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = authenticate(request);
    const { id } = params;
    const result = await pool.query(
      `SELECT el.set_number, el.reps, el.weight, w.date,
              ewn.note as exercise_note, ewn.pinned as note_pinned
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       LEFT JOIN exercise_workout_notes ewn ON ewn.workout_id = w.id AND ewn.exercise_id = el.exercise_id
       WHERE el.exercise_id = $1
         AND w.user_id = $2
       AND w.date IN (
         SELECT DISTINCT w2.date FROM workouts w2
         JOIN exercise_logs el2 ON el2.workout_id = w2.id
         WHERE el2.exercise_id = $1 AND w2.user_id = $2
         ORDER BY w2.date DESC
         LIMIT 3
       )
       ORDER BY w.date DESC, el.set_number`,
      [id, userId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
