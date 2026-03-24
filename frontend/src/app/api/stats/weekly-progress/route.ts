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
          COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      ),
      current_week AS (
        SELECT COUNT(*) as count
        FROM workouts
        WHERE user_id = $1
          AND date >= date_trunc('week', CURRENT_DATE)
          AND date < date_trunc('week', CURRENT_DATE) + interval '7 days'
      ),
      consecutive AS (
        SELECT COUNT(*) as weeks FROM (
          SELECT week_start,
            ROW_NUMBER() OVER (ORDER BY week_start DESC) as rn
          FROM weekly_counts
          WHERE week_start <= date_trunc('week', CURRENT_DATE)
        ) numbered
        WHERE week_start = date_trunc('week', CURRENT_DATE) - ((rn - 1) * interval '7 days')
      )
      SELECT
        (SELECT count FROM current_week) as week_count,
        COALESCE((SELECT SUM(GREATEST(count - 2, 0)) FROM weekly_counts), 0) as total_medals,
        (SELECT weeks FROM consecutive) as consecutive_weeks
    `, [userId]);

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
