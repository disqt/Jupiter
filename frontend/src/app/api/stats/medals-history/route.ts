import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*)::int as workout_count,
          GREATEST(COUNT(*) - 2, 0)::int as medals
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      )
      SELECT
        to_char(week_start, 'YYYY-MM-DD') as week_start,
        workout_count,
        medals,
        SUM(medals) OVER (ORDER BY week_start)::int as cumulative
      FROM weekly_counts
      ORDER BY week_start
    `, [userId]);

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
