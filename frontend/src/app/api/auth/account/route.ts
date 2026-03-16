import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function DELETE(request: NextRequest) {
  try {
    const userId = authenticate(request);

    await pool.query('BEGIN');
    try {
      // Delete exercise workout notes (depends on workouts + exercises)
      await pool.query(
        `DELETE FROM exercise_workout_notes WHERE workout_id IN (SELECT id FROM workouts WHERE user_id = $1)`,
        [userId]
      );
      // Delete exercise logs (depends on workouts + exercises)
      await pool.query(
        `DELETE FROM exercise_logs WHERE workout_id IN (SELECT id FROM workouts WHERE user_id = $1)`,
        [userId]
      );
      // Delete cycling details
      await pool.query(
        `DELETE FROM cycling_details WHERE workout_id IN (SELECT id FROM workouts WHERE user_id = $1)`,
        [userId]
      );
      // Delete workout details
      await pool.query(
        `DELETE FROM workout_details WHERE workout_id IN (SELECT id FROM workouts WHERE user_id = $1)`,
        [userId]
      );
      // Delete workouts
      await pool.query('DELETE FROM workouts WHERE user_id = $1', [userId]);
      // Delete exercises
      await pool.query('DELETE FROM exercises WHERE user_id = $1', [userId]);
      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);

      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}
