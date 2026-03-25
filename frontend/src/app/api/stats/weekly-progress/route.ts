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
      weekly_with_target AS (
        SELECT wc.week_start, wc.count,
          COALESCE(
            (SELECT target FROM user_goals
             WHERE user_id = $1 AND effective_from <= wc.week_start::date
             ORDER BY effective_from DESC LIMIT 1),
            3
          ) as target
        FROM weekly_counts wc
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
        COALESCE((SELECT SUM(GREATEST(count - (target - 1), 0)) FROM weekly_with_target), 0) as total_medals,
        (SELECT weeks FROM consecutive) as consecutive_weeks,
        COALESCE(
          (SELECT target FROM user_goals
           WHERE user_id = $1 AND effective_from <= date_trunc('week', CURRENT_DATE)::date
           ORDER BY effective_from DESC LIMIT 1),
          3
        )::int as current_target
    `, [userId]);

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
