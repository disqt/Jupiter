import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';
import { monthParamSchema, yearParamSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    let dateFormat: string;
    let dateValue: string;

    if (month) {
      const parsed = monthParamSchema.safeParse({ month });
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid month format (YYYY-MM)' }, { status: 400 });
      }
      dateFormat = 'YYYY-MM';
      dateValue = month;
    } else if (year) {
      const parsed = yearParamSchema.safeParse({ year });
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid year format (YYYY)' }, { status: 400 });
      }
      dateFormat = 'YYYY';
      dateValue = year;
    } else {
      return NextResponse.json({ error: 'month (YYYY-MM) or year (YYYY) query param required' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(el.reps * el.weight), 0)::float as total_tonnage,
        COUNT(DISTINCT el.exercise_id)::int as exercise_count,
        COUNT(*)::int as total_sets
       FROM exercise_logs el
       JOIN workouts w ON w.id = el.workout_id
       WHERE w.type = 'musculation'
         AND to_char(w.date, $1) = $2
         AND w.user_id = $3`,
      [dateFormat, dateValue, userId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
