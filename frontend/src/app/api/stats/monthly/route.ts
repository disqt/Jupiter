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

    if (month) {
      dateFormat = 'YYYY-MM';
      dateValue = month;
    } else if (year) {
      dateFormat = 'YYYY';
      dateValue = year;
    } else {
      return NextResponse.json({ error: 'month (YYYY-MM) or year (YYYY) query param required' }, { status: 400 });
    }

    const countsResult = await pool.query(
      `SELECT type, COUNT(*)::text as count
       FROM workouts
       WHERE to_char(date, $1) = $2 AND user_id = $3
       GROUP BY type`,
      [dateFormat, dateValue, userId]
    );
    const counts_by_type: Record<string, string> = {};
    for (const row of countsResult.rows) {
      counts_by_type[row.type] = row.count;
    }

    const aggResult = await pool.query(
      `SELECT
        COUNT(*)::text AS total_count,
        COALESCE(SUM(COALESCE(cd.distance, wd.distance)), 0)::text AS total_distance_km,
        COALESCE(SUM(COALESCE(cd.elevation, wd.elevation)), 0)::text AS total_elevation_m,
        COUNT(DISTINCT w.date)::text AS active_days
       FROM workouts w
       LEFT JOIN cycling_details cd ON cd.workout_id = w.id
       LEFT JOIN workout_details wd ON wd.workout_id = w.id
       WHERE to_char(w.date, $1) = $2
         AND w.user_id = $3`,
      [dateFormat, dateValue, userId]
    );

    return NextResponse.json({ ...aggResult.rows[0], counts_by_type });
  } catch (err) {
    return handleApiError(err);
  }
}
