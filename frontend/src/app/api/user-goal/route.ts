import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db-server';
import { authenticate, handleApiError } from '@/lib/auth-api';
import { userGoalSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const result = await pool.query(
      `SELECT target FROM user_goals
       WHERE user_id = $1
       ORDER BY effective_from DESC
       LIMIT 1`,
      [userId]
    );
    return NextResponse.json({ target: result.rows[0]?.target ?? 3 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = authenticate(request);
    const body = await request.json();
    const parsed = userGoalSchema.parse(body);

    // Compute Monday of current ISO week (server-side, local timezone)
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - dow);
    const effectiveFrom = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;

    const result = await pool.query(
      `INSERT INTO user_goals (user_id, target, effective_from)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, effective_from)
       DO UPDATE SET target = $2
       RETURNING target, effective_from`,
      [userId, parsed.target, effectiveFrom]
    );

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    return handleApiError(err);
  }
}
