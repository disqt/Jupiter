import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    let dateFormat: string;
    let dateValue: string;
    let periodExpr: string;

    if (month) {
      dateFormat = 'YYYY-MM';
      dateValue = month;
      periodExpr = `EXTRACT(ISOYEAR FROM w.date)::int * 100 + EXTRACT(WEEK FROM w.date)::int`;
    } else if (year) {
      dateFormat = 'YYYY';
      dateValue = year;
      periodExpr = `to_char(w.date, 'MM')`;
    } else {
      return NextResponse.json({ error: 'month (YYYY-MM) or year (YYYY) query param required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT
        ${periodExpr} as period_num,
        w.type,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance, 0)), 0)::float as distance
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, $1) = $2
         AND w.user_id = $3
       GROUP BY period_num, w.type
       ORDER BY period_num, w.type`,
      [dateFormat, dateValue, userId]
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    return handleApiError(err);
  }
}
