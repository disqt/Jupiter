import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    if (!month) {
      return NextResponse.json({ error: 'month query param required (YYYY-MM)' }, { status: 400 });
    }

    const result = await pool.query(`
      WITH weekly_counts AS (
        SELECT
          date_trunc('week', date::timestamp) as week_start,
          COUNT(*)::int as workout_count
        FROM workouts
        WHERE user_id = $1
        GROUP BY date_trunc('week', date::timestamp)
      ),
      weekly_with_medals AS (
        SELECT wc.week_start, wc.workout_count,
          GREATEST(wc.workout_count - (COALESCE(
            (SELECT target FROM user_goals
             WHERE user_id = $1 AND effective_from <= wc.week_start::date
             ORDER BY effective_from DESC LIMIT 1),
            3
          ) - 1), 0)::int as medals
        FROM weekly_counts wc
      )
      SELECT
        to_char(week_start, 'YYYY-MM-DD') as week_start,
        workout_count,
        medals
      FROM weekly_with_medals
      WHERE week_start + interval '6 days' >= ($2 || '-01')::date
        AND week_start < (($2 || '-01')::date + interval '1 month')
      ORDER BY week_start
    `, [userId, month]);

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
